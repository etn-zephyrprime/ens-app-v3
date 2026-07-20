import json, glob

path = glob.glob('C:/Users/jbutl/Downloads/*.har')[-1]
with open(path, encoding='utf-8') as f:
    har = json.load(f)

targets = ['ca11bde05977b3631167028862be2a173976ca11', '82ad56cb']
count = 0
for entry in har['log']['entries']:
    req = entry['request']
    post = req.get('postData', {}).get('text', '')
    if any(t in post.lower() for t in targets):
        count += 1
        print(f'=== MATCH {count} ===')
        print('REQUEST:', post[:600])
        resp = entry['response']
        content = resp.get('content', {}).get('text', '')
        print('RESPONSE (status', resp['status'], '):', content[:600])
        print()

if count == 0:
    print('No multicall3 requests found at all — check whether wagmi.ts / .env changes actually took effect.')