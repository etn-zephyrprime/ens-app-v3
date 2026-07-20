import json, glob

path = glob.glob('C:/Users/jbutl/Downloads/localhost.har')[0]
with open(path, encoding='utf-8') as f:
    har = json.load(f)

targets = ['02571be3', '6352211e', '9c22ff5f21f0b81b113e63f7db6da94fedef11b2119b4088b89664fb9a3cb65']
count = 0
for entry in har['log']['entries']:
    req = entry['request']
    post = req.get('postData', {}).get('text', '')
    if any(t in post for t in targets):
        count += 1
        print(f'=== MATCH {count} ===')
        print('REQUEST:', post[:400])
        resp = entry['response']
        content = resp.get('content', {}).get('text', '')
        print('RESPONSE (status', resp['status'], '):', content[:400])
        print()