"""Package only the production web runtime, with index.html at the ZIP root."""
from pathlib import Path
import json, zipfile
root = Path(__file__).resolve().parents[1]
dist = root / 'dist'
if not (dist / 'index.html').is_file():
    raise SystemExit('Run npm run build first.')
version = json.loads((root / 'package.json').read_text())['version']
out = root / 'releases' / f'tubby-springs-{version}-itch-web.zip'
out.parent.mkdir(exist_ok=True)
files = sorted(p for p in dist.rglob('*') if p.is_file() and p.name != '.DS_Store')
assert len(files) <= 1000
assert sum(p.stat().st_size for p in files) <= 500 * 1024 * 1024
for p in files:
    name = p.relative_to(dist).as_posix()
    assert not p.is_symlink() and not p.name.startswith('.')
    assert len(name) <= 240 and p.stat().st_size <= 200 * 1024 * 1024
with zipfile.ZipFile(out, 'w', zipfile.ZIP_DEFLATED, compresslevel=9) as z:
    for p in files:
        z.write(p, p.relative_to(dist).as_posix())
with zipfile.ZipFile(out) as z:
    assert 'index.html' in z.namelist()
    assert z.testzip() is None
print(f'{out}\n{len(files)} files; {out.stat().st_size / 1024 / 1024:.2f} MB ZIP')
