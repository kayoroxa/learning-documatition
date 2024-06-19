# text_punctuation.py
import json
import sys

from deepmultilingualpunctuation import PunctuationModel

model = PunctuationModel()

# Read input texts from a file
with open(sys.argv[1], 'r') as file:
    texts = json.load(file)

# Restore punctuation for each text
results = [model.restore_punctuation(text) for text in texts]

# Print the results as a JSON array
print(json.dumps(results))