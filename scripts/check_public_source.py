"""Checks the current public source for production connections and privileged keys."""
import pathlib,re,base64,json,sys
root=pathlib.Path(__file__).resolve().parents[1]
errors=[]
for p in root.rglob('*'):
    if not p.is_file() or any(x in p.parts for x in ('.git','node_modules','scripts','.github')): continue
    if p.suffix not in ('.html','.js','.jsx','.ts','.tsx','.json','.md','.txt','.yml','.yaml'): continue
    if p.name in ('package-lock.json',): continue
    text=p.read_text(encoding='utf-8',errors='replace')
    if re.search(r'https://[a-z]{20}\.supabase\.co|https://script\.google\.com/macros/s/|https://[^/\s]+\.ts\.net',text): errors.append(str(p.relative_to(root))+': production service address')
    if re.search(r'sb_secret_[A-Za-z0-9_-]{10,}|-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----',text): errors.append(str(p.relative_to(root))+': privileged credential')
    for token in re.findall(r'eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+',text):
        try:
            if json.loads(base64.urlsafe_b64decode(token.split('.')[1]+'===' )).get('role')=='service_role':errors.append(str(p.relative_to(root))+': privileged JWT')
        except (ValueError,UnicodeDecodeError): pass
    for match in re.finditer(r'"members"\s*:\s*(\[[^\]]*\])',text):
        try:
            if any(not str(name).startswith('Demo ') for name in json.loads(match[1])): errors.append(str(p.relative_to(root))+': non-demo roster members')
        except ValueError: pass
if errors:
    print('\n'.join(sorted(set(errors))));sys.exit(1)
print('Public-source checks passed. This is a heuristic, not proof that all personal data is absent.')
