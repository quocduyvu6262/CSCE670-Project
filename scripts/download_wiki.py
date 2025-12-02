from datasets import load_dataset
import jsonlines
import os

OUTPUT_FILE = "data/processed/wiki_corpus_small.jsonl"
os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)

print("Streaming Wikipedia data...")

# 1. Use streaming=True to avoid downloading the whole 20GB+ dataset
# 2. We remove the slice '[:1%]' because streaming datasets don't support slicing
dataset = load_dataset("wikimedia/wikipedia", "20231101.en", split="train", streaming=True)

# English Wikipedia is roughly 6.5 million articles. 
# 60,000 articles is approx 1%.
MAX_ARTICLES = 60000 
count = 0

with jsonlines.open(OUTPUT_FILE, mode='w') as writer:
    # We use .take() to safely grab only what we need from the stream
    for item in dataset.take(MAX_ARTICLES):
        title = item['title']
        text = item['text']
        
        if text.strip():
            for para in text.split('\n\n'):
                para = para.strip()
                if para:
                    writer.write({
                        "title": title,
                        "text": para,
                        "url": f"https://en.wikipedia.org/wiki/{title.replace(' ', '_')}"
                    })
        
        count += 1
        if count % 1000 == 0:
            print(f"Processed {count} articles...", end='\r')

print(f"\nDone! Saved {count} articles to {OUTPUT_FILE}")