import jsonlines
from sentence_transformers import SentenceTransformer
import numpy as np
import faiss
import os
import json

CORPUS_FILE = "data/processed/wiki_corpus_small.jsonl"
EMBED_FILE = "embeddings/faiss_index/wiki_embeddings.npy"
INDEX_FILE = "embeddings/faiss_index/index.faiss"
META_FILE = "embeddings/faiss_index/meta.json"

os.makedirs(os.path.dirname(EMBED_FILE), exist_ok=True)

# Load corpus
texts = []
meta = []
with jsonlines.open(CORPUS_FILE) as reader:
    for obj in reader:
        texts.append(obj['text'])
        meta.append({"title": obj['title'], "url": obj['url']})

# Embed corpus
model = SentenceTransformer('all-MiniLM-L6-v2')
embeddings = model.encode(texts, batch_size=32, show_progress_bar=True)
embeddings = embeddings.astype('float32')

# Save embeddings
np.save(EMBED_FILE, embeddings)

# Build FAISS index
index = faiss.IndexFlatL2(embeddings.shape[1])
index.add(embeddings)
faiss.write_index(index, INDEX_FILE)

# Save metadata
with open(META_FILE, 'w') as f:
    json.dump(meta, f)

print("FAISS index built successfully!")