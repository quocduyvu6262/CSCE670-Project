import streamlit as st
import faiss
import numpy as np
import json
from sentence_transformers import SentenceTransformer
from transformers import pipeline

# ---------- Paths ----------
EMBED_FILE = "embeddings/faiss_index/wiki_embeddings.npy"
INDEX_FILE = "embeddings/faiss_index/index.faiss"
META_FILE = "embeddings/faiss_index/meta.json"

# ---------- Load FAISS index and metadata ----------
@st.cache_resource
def load_index():
    embeddings = np.load(EMBED_FILE).astype('float32')
    index = faiss.read_index(INDEX_FILE)
    with open(META_FILE) as f:
        meta = json.load(f)
    return embeddings, index, meta

embeddings, index, meta = load_index()

# ---------- Load models ----------
@st.cache_resource
def load_models():
    embed_model = SentenceTransformer('all-MiniLM-L6-v2')
    nli_model = pipeline("text-classification", model="roberta-large-mnli")
    return embed_model, nli_model

embed_model, nli_model = load_models()

# ---------- Helper function ----------
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

# ---------- Streamlit UI ----------
st.set_page_config(page_title="FakeCheck Search", layout="wide")
st.title("Fact Check Search 🕵️‍♂️")
st.write("Enter a claim and see evidence supporting, refuting, or neutral to it.")

claim = st.text_input("Enter claim:")
search_btn = st.button("Search")

# Placeholder for results
results_placeholder = st.empty()

if search_btn and claim:
    with st.spinner("Searching for evidence..."):
        results = search_claim(claim, top_k=5)
    
    # Display results in the placeholder
    with results_placeholder.container():
        for r in results:
            color = "green" if r['label'] == "support" else "red" if r['label'] == "refute" else "gray"
            st.markdown(
                f"**[{r['label'].upper()}]** <span style='color:{color}'>{r['text']}</span>  "
                f"([source]({r['url']}))", unsafe_allow_html=True
            )
