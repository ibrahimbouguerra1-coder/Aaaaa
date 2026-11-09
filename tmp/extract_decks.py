import urllib.request
import json

url = "https://fares-english-guvjqcjnzr9.qoder.website/assets/index-CEBGxdL6.js"
req = urllib.request.urlopen(url)
data = req.read().decode("utf-8", errors="ignore")

idx = data.find('te=[{id:`deck-')
if idx != -1:
    end = data.find('];', idx)
    with open('/tmp/te_raw.js', 'w', encoding='utf-8') as f:
        f.write('export default ' + data[idx+3:end+1] + ';')
    print("Extracted te, length:", end - idx)
else:
    print("Could not find te in bundle")
