import { createHash } from 'node:crypto';
import { cp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { build } from 'esbuild';

const output = 'dist';
await mkdir(output, { recursive: true });
await mkdir(join(output, 'assets'), { recursive: true });

async function writeVersioned(name, content) {
  const hash = createHash('sha256').update(content).digest('hex').slice(0, 12);
  const filename = name.replace(/(\.[^.]+)$/, `.${hash}$1`);
  await writeFile(join(output, filename), content);
  return filename;
}

const dataName = await writeVersioned('data.js', await readFile('data.js', 'utf8'));
const voiceName = await writeVersioned('voice.js', await readFile('voice.js', 'utf8'));
const modelName = await writeVersioned('assets/guide.glb.gz', await readFile('assets/guide.glb.gz'));
const posterName = await writeVersioned('assets/guide-poster.jpg', await readFile('assets/guide-poster.jpg'));
const avatarSource = (await readFile('avatar.js', 'utf8')).replace("'./assets/guide.glb.gz'", `'./${modelName}'`);
const avatarBundle = await build({
  stdin: { contents: avatarSource, resolveDir: process.cwd(), sourcefile: 'avatar.js' },
  bundle: true, format: 'esm', minify: true, write: false, target: 'es2022'
});
const avatarName = await writeVersioned('avatar.js', avatarBundle.outputFiles[0].text);
const app = (await readFile('app.js', 'utf8'))
  .replace("'./data.js'", `'./${dataName}'`)
  .replace("'./voice.js'", `'./${voiceName}'`)
  .replace("'./avatar.js'", `'./${avatarName}'`);
const appName = await writeVersioned('app.js', app);
const styleName = await writeVersioned('style.css', await readFile('style.css', 'utf8'));
const html = (await readFile('index.html', 'utf8'))
  .replace('src="app.js"', `src="${appName}"`)
  .replace('href="style.css"', `href="${styleName}"`)
  .replace('src="assets/guide-poster.jpg"', `src="${posterName}"`);
await writeFile(join(output, 'index.html'), html);
await cp('previews', join(output, 'previews'), { recursive: true });
await cp('THIRD_PARTY_NOTICES.txt', join(output, 'THIRD_PARTY_NOTICES.txt'));
await cp('node_modules/three/LICENSE', join(output, 'assets/three-LICENSE.txt'));
