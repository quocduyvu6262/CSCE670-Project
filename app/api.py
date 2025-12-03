import os
import sys
from flask import Flask, request, jsonify
from flask_cors import CORS
import faiss
import numpy as np
import json
from sentence_transformers import SentenceTransformer
from transformers import pipeline
from urllib.parse import urlparse

# Add parent directory to path to resolve relative imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# ---------- Paths (relative to project root) ----------
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EMBED_FILE = os.path.join(BASE_DIR, "embeddings/faiss_index/wiki_embeddings.npy")
INDEX_FILE = os.path.join(BASE_DIR, "embeddings/faiss_index/index.faiss")
META_FILE = os.path.join(BASE_DIR, "embeddings/faiss_index/meta.json")

app = Flask(__name__)
CORS(app)  # Enable CORS for Chrome extension

# Global variables for loaded models and index
embeddings = None
index = None
meta = None
embed_model = None
nli_model = None

def load_resources():
    """Load FAISS index, embeddings, and models (called once at startup)"""
    global embeddings, index, meta, embed_model, nli_model
    
    print("Loading FAISS index and metadata...")
    embeddings = np.load(EMBED_FILE).astype('float32')
    index = faiss.read_index(INDEX_FILE)
    with open(META_FILE) as f:
        meta = json.load(f)
    
    print("Loading ML models...")
    embed_model = SentenceTransformer('all-MiniLM-L6-v2')
    nli_model = pipeline("text-classification", model="roberta-large-mnli")
    print("All resources loaded successfully!")

def search_claim(claim, top_k=5):
    """Search for evidence related to a claim"""
    claim_vec = embed_model.encode([claim]).astype('float32')
    D, I = index.search(claim_vec, top_k)
    
    results = []
    for idx in I[0]:
        snippet = meta[idx]
        text = snippet['text']
        nli = nli_model(f"{claim} </s></s> {text}")[0]
        label_map = {"ENTAILMENT": "support", "CONTRADICTION": "refute", "NEUTRAL": "neutral"}
        
        # Map Python service labels to extension format
        label = label_map.get(nli['label'], 'neutral')
        status_map = {
            "support": "supports",
            "refute": "debunks",
            "neutral": "neutral"
        }
        
        # Extract domain from URL
        parsed_url = urlparse(snippet['url'])
        domain = parsed_url.netloc or parsed_url.path.split('/')[0] if parsed_url.path else "unknown"
        
        # Create verdict message
        verdict_map = {
            "supports": "Confirms claim",
            "debunks": "Contradicts claim",
            "neutral": "No clear stance"
        }
        
        results.append({
            "url": snippet['url'],
            "domain": domain,
            "status": status_map[label],
            "verdict": verdict_map[status_map[label]],
            "quote": text[:200] + "..." if len(text) > 200 else text,  # Truncate long quotes
            "title": snippet.get('title', '')
        })
    
    return results

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({"status": "healthy"}), 200

@app.route('/fact-check', methods=['POST'])
def fact_check():
    """Main endpoint for fact-checking claims"""
    try:
        data = request.get_json()
        
        if not data or 'claim' not in data:
            return jsonify({"error": "Missing 'claim' in request body"}), 400
        
        claim = data['claim'].strip()
        if not claim:
            return jsonify({"error": "Claim cannot be empty"}), 400
        
        top_k = data.get('top_k', 5)  # Default to 5 results
        
        # Perform fact-checking
        results = search_claim(claim, top_k=top_k)
        
        # Generate a summary verdict
        supports_count = sum(1 for r in results if r['status'] == 'supports')
        debunks_count = sum(1 for r in results if r['status'] == 'debunks')
        neutral_count = sum(1 for r in results if r['status'] == 'neutral')
        
        if supports_count > debunks_count:
            overall_verdict = f"Based on {len(results)} sources, this claim appears to be **accurate**. {supports_count} source(s) support it, while {debunks_count} contradict it."
        elif debunks_count > supports_count:
            overall_verdict = f"Based on {len(results)} sources, this claim appears to be **inaccurate**. {debunks_count} source(s) contradict it, while {supports_count} support it."
        else:
            overall_verdict = f"Based on {len(results)} sources, the evidence is **mixed**. {supports_count} support, {debunks_count} contradict, and {neutral_count} are neutral."
        
        return jsonify({
            "claim": claim,
            "sources": results,
            "verdict": overall_verdict,
            "summary": {
                "total": len(results),
                "supports": supports_count,
                "debunks": debunks_count,
                "neutral": neutral_count
            }
        }), 200
        
    except Exception as e:
        print(f"Error in fact_check: {str(e)}")
        return jsonify({"error": f"Internal server error: {str(e)}"}), 500

if __name__ == '__main__':
    # Load resources at startup
    load_resources()
    
    # Run the Flask app
    print("Starting Flask API server on http://localhost:5000")
    app.run(host='0.0.0.0', port=5000, debug=True)