import jsonlines
from collections import Counter
import numpy as np

CORPUS_FILE = "data/processed/wiki_corpus_small.jsonl"

num_articles = 0
num_paragraphs = 0
paragraph_lengths = []
titles = set()

with jsonlines.open(CORPUS_FILE) as reader:
    for obj in reader:
        num_paragraphs += 1
        titles.add(obj['title'])
        paragraph_lengths.append(len(obj['text'].split()))  # word count

num_articles = len(titles)
paragraph_lengths = np.array(paragraph_lengths)

print("===== Wikipedia Corpus Statistics =====")
print(f"Total articles: {num_articles}")
print(f"Total paragraphs: {num_paragraphs}")
print(f"Average paragraphs per article: {num_paragraphs / num_articles:.2f}")
print(f"Average paragraph length (words): {paragraph_lengths.mean():.2f}")
print(f"Median paragraph length (words): {np.median(paragraph_lengths):.2f}")
print(f"Max paragraph length (words): {paragraph_lengths.max()}")
print(f"Min paragraph length (words): {paragraph_lengths.min()}")
