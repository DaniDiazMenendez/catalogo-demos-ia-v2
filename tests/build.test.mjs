import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';

test('la publicación cambia las URLs de los módulos según su contenido, incluidos los datos importados', async () => {
  await mkdir('dist/assets', { recursive: true });
  await writeFile('dist/assets/guide.glb.obsolete.gz', 'modelo de una publicación anterior');
  execFileSync(process.execPath, ['build.mjs']);
  const html = await readFile('dist/index.html', 'utf8');
  const appName = html.match(/src="(app\.[a-f0-9]{12}\.js)"/)?.[1];
  const styleName = html.match(/href="(style\.[a-f0-9]{12}\.css)"/)?.[1];
  assert.ok(appName);
  assert.ok(styleName);
  const app = await readFile(`dist/${appName}`, 'utf8');
  const dataName = app.match(/from '\.\/(data\.[a-f0-9]{12}\.js)'/)?.[1];
  const voiceName = app.match(/from '\.\/(voice\.[a-f0-9]{12}\.js)'/)?.[1];
  assert.ok(dataName);
  assert.ok(voiceName);
  for (const [filename, source] of [[appName, app], [styleName, await readFile('style.css', 'utf8')], [dataName, await readFile('data.js', 'utf8')], [voiceName, await readFile('voice.js', 'utf8')]]) {
    const hash = createHash('sha256').update(source).digest('hex').slice(0, 12);
    assert.ok(filename.includes(`.${hash}.`));
    assert.equal(await readFile(`dist/${filename}`, 'utf8'), source);
  }
  assert.doesNotMatch(html, /voice-avatar|avatar-status|guide-poster|<canvas/);
  assert.doesNotMatch(app, /avatar\.|speech-motion/);
  const files = await readdir('dist');
  assert.equal(files.includes('assets'), false);
  assert.equal(files.some(file => file.startsWith('avatar.')), false);
});
