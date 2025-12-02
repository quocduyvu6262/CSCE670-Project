import faiss
import numpy as np
import json
from sentence_transformers import SentenceTransformer
from transformers import pipeline

# Paths
EMBED_FILE = "embeddings/faiss_index/wiki_embeddings.npy"
INDEX_FILE = "embeddings/faiss_index/index.faiss"
META_FILE = "embeddings/faiss_index/meta.json"

# Load embeddings & index
embeddings = np.load(EMBED_FILE).astype('float32')
index = faiss.read_index(INDEX_FILE)
with open(META_FILE) as f:
    meta = json.load(f)

# Load models
embed_model = SentenceTransformer('all-MiniLM-L6-v2')
nli_model = pipeline("text-classification", model="roberta-large-mnli")

def search_claim(claim, top_k=5):
    claim_vec = embed_model.encode([claim]).astype('float32')
    D, I = index.search(claim_vec, top_k)
    
    results = []
    for idx in I[0]:
        snippet = meta[idx]
        text = snippet['text']
        nli = nli_model(f"{claim} </s></s> {text}")[0]
        label_map = {"ENTAILMENT": "support", "CONTRADICTION": "refute", "NEUTRAL": "neutral"}
        results.append({
            "title": snippet['title'],
            "url": snippet['url'],
            "text": text,
            "label": label_map.get(nli['label'], 'neutral')
        })
    return results

if __name__ == "__main__":
    claim = input("Enter claim: ")
    results = search_claim(claim)
    for r in results:
        print(f"[{r['label'].upper()}] {r['text']} ({r['url']})")
