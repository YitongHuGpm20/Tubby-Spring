"""Import DreamLayer ZIPs without changing their artwork; preserve frame timing."""
from pathlib import Path
import json, zipfile
root=Path(__file__).resolve().parents[1]
art=root/'public/art';sources=root/'assets-source/dreamlayer';sources.mkdir(parents=True,exist_ok=True)
manifest={}
for archive in sorted(art.glob('*.zip')):
 with zipfile.ZipFile(archive) as z:
  atlas=json.loads(z.read('atlas.json'))
  (art/(archive.stem+'.png')).write_bytes(z.read('sheet.png'))
  (sources/(archive.stem+'-atlas.json')).write_text(json.dumps(atlas,indent=2))
  (sources/(archive.stem+'-preview.gif')).write_bytes(z.read('preview.gif'))
  frame=next(n for n in z.namelist() if n.startswith('frames/') and n.endswith('.png'))
  if archive.stem.endswith('-walk'):
   (art/(archive.stem.removesuffix('-walk')+'-portrait.png')).write_bytes(z.read(frame))
  manifest[archive.stem]={'count':atlas['frame_count'],'durations':atlas['frame_durations_ms'],'cell':atlas['cell'],'keptBackground':atlas.get('kept_background_frames',[])}
 archive.rename(sources/archive.name)
# Include metadata from previously imported files.
for file in sources.glob('*-atlas.json'):
 key=file.name.removesuffix('-atlas.json');atlas=json.loads(file.read_text())
 manifest[key]={'count':atlas['frame_count'],'durations':atlas['frame_durations_ms'],'cell':atlas['cell'],'keptBackground':atlas.get('kept_background_frames',[])}
(root/'src/game/spriteManifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
print('Imported',len(manifest),'animations; preserved original PNGs and frame timing.')
