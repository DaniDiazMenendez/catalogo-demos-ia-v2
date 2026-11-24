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

test('el rig nuevo separa los labios y comprime los párpados sin cambiar la geometría del cuerpo', async () => {
  const glb = gunzipSync(await readFile('assets/guide.glb.gz'));
  const jsonLength = glb.readUInt32LE(12);
  const model = JSON.parse(glb.subarray(20, 20 + jsonLength).toString());
  const start = 28 + jsonLength;
  const mesh = model.meshes[0];
  const primitive = mesh.primitives[0];
  const position = model.accessors[primitive.attributes.POSITION];
  const positionOffset = start + model.bufferViews[position.bufferView].byteOffset;
  function expression(name) {
    const accessor = model.accessors[primitive.targets[mesh.extras.targetNames.indexOf(name)].POSITION];
    const indices = start + model.bufferViews[accessor.sparse.indices.bufferView].byteOffset;
    const values = start + model.bufferViews[accessor.sparse.values.bufferView].byteOffset;
    const deltas = new Map();
    for (let index = 0; index < accessor.sparse.count; index++) {
      deltas.set(glb.readUInt32LE(indices + index * 4), [0, 1, 2].map(axis => glb.readFloatLE(values + index * 12 + axis * 4)));
    }
    return deltas;
  }
  const jaw = expression('viseme_aa');
  const blink = expression('eyeBlinkLeft');
  let upperLip = 0;
  let lowerLip = 0;
  let eyeBefore = 0;
  let eyeAfter = 0;
  for (let index = 0; index < position.count; index++) {
    const [x, y, z] = [0, 1, 2].map(axis => glb.readFloatLE(positionOffset + index * 12 + axis * 4));
    if (y < 1.4) {
      assert.equal(jaw.has(index), false);
      assert.equal(blink.has(index), false);
    }
    if (Math.abs(x) < 0.006 && z > 0.09) {
      if (y > 1.486 && y < 1.491) upperLip = Math.max(upperLip, jaw.get(index)?.[1] || 0);
      if (y > 1.477 && y < 1.482) lowerLip = Math.min(lowerLip, jaw.get(index)?.[1] || 0);
    }
    if (Math.abs(x - 0.0414) < 0.008 && Math.abs(y - 1.551) < 0.015 && z > 0.08) {
      eyeBefore += Math.abs(y - 1.551);
      eyeAfter += Math.abs(y + (blink.get(index)?.[1] || 0) - 1.551);
    }
  }
  assert.ok(upperLip - lowerLip > 0.005, 'La articulación debe abrir los labios');
  assert.ok(eyeBefore > 0 && eyeAfter / eyeBefore < 0.15, 'El parpadeo debe cerrar visualmente los ojos');
});
