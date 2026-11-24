import { createHash } from 'node:crypto';
import { cp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const output = 'dist';
await mkdir(output, { recursive: true });

async function writeVersioned(name, content) {
  const hash = createHash('sha256').update(content).digest('hex').slice(0, 12);
  const filename = name.replace(/(\.[^.]+)$/, `.${hash}$1`);
  await writeFile(join(output, filename), content);
  return filename;
}

const dataName = await writeVersioned('data.js', await readFile('data.js', 'utf8'));
const voiceName = await writeVersioned('voice.js', await readFile('voice.js', 'utf8'));
const app = (await readFile('app.js', 'utf8'))
  .replace("'./data.js'", `'./${dataName}'`)
  .replace("'./voice.js'", `'./${voiceName}'`);
const appName = await writeVersioned('app.js', app);
const styleName = await writeVersioned('style.css', await readFile('style.css', 'utf8'));
const html = (await readFile('index.html', 'utf8'))
  .replace('src="app.js"', `src="${appName}"`)
  .replace('href="style.css"', `href="${styleName}"`);
await writeFile(join(output, 'index.html'), html);
await cp('previews', join(output, 'previews'), { recursive: true });
