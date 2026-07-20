with open('C:/Users/jbutl/ens-app-v3/node_modules/@ensdomains/thorin/dist/index.js', encoding='utf-8') as f:
    content = f.read()

idx = content.find('"eth"')
print('found at index:', idx)
if idx != -1:
    start = max(0, idx - 200)
    end = min(len(content), idx + 200)
    print(content[start:end])