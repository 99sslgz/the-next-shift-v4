import {readFile,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const project=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const page=await readFile(path.join(project,'dist','index.html'),'utf8');
const entry=page.replace(/(href|src)="\.\/([^"]+)"/g,(_,attribute,target)=>`${attribute}="./dist/${target}"`);
await writeFile(path.join(project,'index.html'),entry);
