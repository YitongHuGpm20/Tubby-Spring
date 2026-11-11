"""Read alpha bounds to normalize runtime sprites. Never writes or edits images."""
from pathlib import Path
import json
from PIL import Image
root=Path(__file__).resolve().parents[1]
manifest_file=root/'src/game/spriteManifest.json'
manifest=json.loads(manifest_file.read_text())
bounds={}
for key,info in manifest.items():
 with Image.open(root/'public/art'/(key+'.png')) as sheet:
  cell=info['cell'];cols=sheet.width//cell;boxes=[]
  for i in range(info['count']):
   alpha=sheet.getchannel('A').crop((i%cols*cell,i//cols*cell,i%cols*cell+cell,i//cols*cell+cell))
   box=alpha.point(lambda value:255 if value>=60 else 0).getbbox()
   if box:boxes.append(box)
  bounds[key]=(min(b[0] for b in boxes),min(b[1] for b in boxes),max(b[2] for b in boxes),max(b[3] for b in boxes))
for key,info in manifest.items():
 box=bounds[key];base=bounds[key.split('-')[0]+'-walk'];base_size=max(base[2]-base[0],base[3]-base[1]);size=max(box[2]-box[0],box[3]-box[1]);cell=info['cell']
 info['displayScale']=round(min(1.8,max(.7,base_size/size)),4)
 info['originX']=round((box[0]+box[2])/2/cell,4)
 info['originY']=round(box[3]/cell,4)
manifest_file.write_text(json.dumps(manifest,indent=2)+'\n')
print('Measured',len(manifest),'animation sheets; all original PNGs unchanged.')
