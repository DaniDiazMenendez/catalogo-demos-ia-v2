import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { gunzipSync } from 'node:zlib';

test('el avatar contiene las expresiones faciales necesarias, no depende de archivos remotos y su descarga es menor a 7 MiB', async () => {
  const compressed = await readFile('assets/guide.glb.gz');
  assert.ok(compressed.length < 7 * 1024 * 1024, 'Mantener acotada la descarga del modelo');
  const glb = gunzipSync(compressed);
  assert.equal(glb.subarray(0, 4).toString(), 'glTF');
  const model = JSON.parse(glb.subarray(20, 20 + glb.readUInt32LE(12)).toString());
  const shapes = new Set(model.meshes.flatMap(mesh => mesh.extras?.targetNames || []));
  for (const name of ['viseme_aa', 'viseme_E', 'viseme_O', 'viseme_PP', 'eyeBlinkLeft', 'eyeBlinkRight']) assert.ok(shapes.has(name), name);
  assert.ok(model.nodes.some(node => node.name === 'Head'));
  assert.ok(model.images.every(image => !image.uri && image.bufferView !== undefined));
  assert.ok(model.buffers.every(buffer => !buffer.uri));
  assert.match(model.asset.copyright, /CC0/);
});
