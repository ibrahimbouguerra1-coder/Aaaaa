import urllib.request
import re
import json

url = 'https://fares-english-guvjqcjnzr9.qoder.website/assets/index-CEBGxdL6.js'
req = urllib.request.urlopen(url)
content = req.read().decode('utf-8', errors='ignore')

print("Total length:", len(content))

# Look for tabs
nav_matches = re.findall(r'id:\s*["\']([^"\']+)["\'],\s*label:\s*["\']([^"\']+)["\']', content)
print("Nav matches:", nav_matches)

# Look for all modules / skills labs
skills = re.findall(r'id:\s*["\']([a-zA-Z0-9_-]+)["\'],\s*title:\s*["\']([^"\']+)["\']', content)
print("Items with id & title (first 30):", skills[:30])

# Look for level IDs and names
levels = re.findall(r'(A0|A1|A2|B1|B2|C1|C2)[^,}]+', content)
print("Level mentions (first 20):", levels[:20])

# Look for dialogs, exercises, vocabulary
words = re.findall(r'word:\s*["\']([^"\']+)["\'],\s*translation:\s*["\']([^"\']+)["\']', content)
print("Words found:", len(words), words[:10])
