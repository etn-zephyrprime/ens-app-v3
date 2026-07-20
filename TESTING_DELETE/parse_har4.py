import json, glob

path = glob.glob('C:/Users/jbutl/Downloads/*.har')[-1]
with open(path, encoding='utf-8') as f:
    har = json.load(f)

for entry in har['log']['entries']:
    req = entry['request']
    post = req.get('postData', {}).get('text', '')
    if '82ad56cb' in post and '7b787b31ad58d563d7b3938b4bbfab2c588624c5' in post:
        with open('C:/Users/jbutl/multicall_request.txt', 'w') as out:
            out.write(post)
        print('wrote full request to multicall_request.txt')
        break
else:
    print('no match found - check the .har file is from a fresh reload')