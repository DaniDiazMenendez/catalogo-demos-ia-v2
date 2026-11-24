import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';

const sourcePath = process.argv[2];
if (!sourcePath) throw new Error('Uso: node scripts/prepare-avatar.mjs <woman-rigged.glb>');
const source = await readFile(sourcePath);
const jsonLength = source.readUInt32LE(12);
const model = JSON.parse(source.subarray(20, 20 + jsonLength).toString());
const binary = source.subarray(28 + jsonLength);
const components = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4, MAT4: 16 };
const types = { 5121: Uint8Array, 5123: Uint16Array, 5125: Uint32Array, 5126: Float32Array };
function readAccessor(index) {
  const accessor = model.accessors[index];
  if (accessor.sparse) throw new Error('El modelo de origen debe contener atributos densos.');
  const view = model.bufferViews[accessor.bufferView];
  const Type = types[accessor.componentType];
  const size = components[accessor.type];
  const result = new Type(accessor.count * size);
  const stride = view.byteStride || size * Type.BYTES_PER_ELEMENT;
  for (let item = 0; item < accessor.count; item++) {
    const offset = (view.byteOffset || 0) + (accessor.byteOffset || 0) + item * stride;
    result.set(new Type(binary.buffer, binary.byteOffset + offset, size), item * size);
  }
  return { values: result, type: accessor.type, componentType: accessor.componentType, normalized: accessor.normalized };
}
if (model.meshes.length !== 1 || model.meshes[0].primitives.length !== 1) throw new Error('No es el personaje Woman rigged esperado.');
const primitive = model.meshes[0].primitives[0];
const attributes = Object.fromEntries(Object.entries(primitive.attributes).map(([name, index]) => [name, readAccessor(index)]));
const originalIndices = readAccessor(primitive.indices).values;
const inverseBinds = model.skins.map(skin => readAccessor(skin.inverseBindMatrices));
const images = model.images.map(image => {
  const view = model.bufferViews[image.bufferView];
  return binary.subarray(view.byteOffset || 0, (view.byteOffset || 0) + view.byteLength);
});
const keptIndices = [];
for (let index = 0; index < originalIndices.length; index += 3) {
  const triangle = originalIndices.subarray(index, index + 3);
  if (triangle.every(vertex => attributes.POSITION.values[vertex * 3 + 1] >= 1.1)) keptIndices.push(...triangle);
}
const vertices = [...new Set(keptIndices)].sort((a, b) => a - b);
const remap = new Map(vertices.map((old, index) => [old, index]));
const parts = [];
let offset = 0;
model.bufferViews = [];
model.accessors = [];
delete model.animations;
function appendView(values) {
  const data = Buffer.isBuffer(values) ? values : Buffer.from(values.buffer, values.byteOffset, values.byteLength);
  const index = model.bufferViews.length;
  model.bufferViews.push({ buffer: 0, byteOffset: offset, byteLength: data.length });
  const padding = Buffer.alloc((-data.length) & 3);
  parts.push(data, padding);
  offset += data.length + padding.length;
  return index;
}
function appendAccessor(attribute) {
  const index = model.accessors.length;
  model.accessors.push({
    bufferView: appendView(attribute.values),
    componentType: attribute.componentType, type: attribute.type,
    count: attribute.values.length / components[attribute.type],
    ...(attribute.normalized === undefined ? {} : { normalized: attribute.normalized })
  });
  return index;
}
for (const [name, attribute] of Object.entries(attributes)) {
  const size = components[attribute.type];
  const values = new attribute.values.constructor(vertices.length * size);
  vertices.forEach((old, index) => values.set(attribute.values.subarray(old * size, (old + 1) * size), index * size));
  attribute.values = values;
  primitive.attributes[name] = appendAccessor(attribute);
}
const positions = attributes.POSITION.values;
const min = [Infinity, Infinity, Infinity];
const max = [-Infinity, -Infinity, -Infinity];
for (let index = 0; index < positions.length; index++) {
  min[index % 3] = Math.min(min[index % 3], positions[index]);
  max[index % 3] = Math.max(max[index % 3], positions[index]);
}
Object.assign(model.accessors[primitive.attributes.POSITION], { min, max });
primitive.indices = appendAccessor({ values: Uint32Array.from(keptIndices, index => remap.get(index)), componentType: 5125, type: 'SCALAR' });
model.skins.forEach((skin, index) => { skin.inverseBindMatrices = appendAccessor(inverseBinds[index]); });
model.images.forEach((image, index) => { image.bufferView = appendView(images[index]); });

const smooth = (a, b, value) => {
  const t = Math.max(0, Math.min(1, (value - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
const targets = [];
const names = [];
function addExpression(name, deform) {
  const indices = [];
  const values = [];
  const low = [0, 0, 0];
  const high = [0, 0, 0];
  for (let index = 0; index < vertices.length; index++) {
    const [x, y, z] = positions.subarray(index * 3, index * 3 + 3);
    const front = smooth(0.045, 0.08, z);
    if (!front || y < 1.4 || y > 1.63) continue;
    const delta = deform(x, y, z).map(value => Math.round(value * front * 1e6) / 1e6);
    if (!delta.some(value => value !== 0)) continue;
    indices.push(index);
    values.push(...delta);
    delta.forEach((value, axis) => { low[axis] = Math.min(low[axis], value); high[axis] = Math.max(high[axis], value); });
  }
  if (!indices.length) throw new Error(`La expresión ${name} no modifica el rostro.`);
  const accessor = model.accessors.length;
  model.accessors.push({
    componentType: 5126, type: 'VEC3', count: vertices.length, min: low, max: high,
    sparse: { count: indices.length, indices: { bufferView: appendView(Uint32Array.from(indices)), componentType: 5125 }, values: { bufferView: appendView(Float32Array.from(values)) } }
  });
  names.push(name);
  targets.push({ POSITION: accessor });
}
function mouth(opening, width = 0, pucker = 0, close = 0) {
  return (x, y) => {
    const mask = Math.exp(-1.5 * ((x / 0.037) ** 4 + ((y - 1.486) / 0.026) ** 4));
    const line = 1.484 + 0.006 * Math.min(1, (x / 0.028) ** 2);
    const side = Math.tanh((y - line) / 0.0015);
    const jaw = Math.exp(-((x / 0.052) ** 4 + ((y - 1.455) / 0.028) ** 4));
    return [
      x * width * mask,
      opening * (side > 0 ? side * 0.3 : side) * mask - opening * 0.2 * jaw - (y - line) * close * mask,
      pucker * 0.006 * mask
    ];
  };
}
for (const [name, parameters] of Object.entries({
  aa: [0.012], E: [0.006, 0.1], I: [0.003, 0.15], O: [0.009, -0.25, 0.8],
  U: [0.005, -0.3, 1], PP: [0, 0, 0.05, 0.6], FF: [0.002, 0, 0, 0.15],
  DD: [0.005], kk: [0.006], nn: [0.003], RR: [0.004], SS: [0.002, 0.08],
  CH: [0.004, -0.15, 0.4], TH: [0.004]
})) addExpression(`viseme_${name}`, mouth(...parameters));
addExpression('jawOpen', mouth(0.012));
for (const [name, center] of [['eyeBlinkLeft', 0.0414], ['eyeBlinkRight', -0.0368]]) {
  addExpression(name, (x, y) => {
    const mask = Math.exp(-1.5 * (((x - center) / 0.027) ** 8 + ((y - 1.551) / 0.025) ** 8));
    return [0, -(y - 1.551) * 0.96 * mask, 0];
  });
}
for (const [name, direction] of [['mouthSmileLeft', 1], ['mouthSmileRight', -1]]) {
  addExpression(name, (x, y) => {
    const mask = Math.exp(-(((x - direction * 0.025) / 0.016) ** 4 + ((y - 1.488) / 0.017) ** 4));
    return [direction * 0.002 * mask, 0.003 * mask, 0];
  });
}
addExpression('browInnerUp', (x, y) => [0, 0.004 * Math.exp(-((x / 0.05) ** 4 + ((y - 1.58) / 0.012) ** 4)), 0]);
primitive.targets = targets;
model.meshes[0].extras = { targetNames: names };
model.meshes[0].weights = names.map(() => 0);
model.asset.copyright = 'Casual Woman by Grab3D, CC0 1.0; AI-assisted source. Cropped and given a custom facial rig for this catalog.';
model.asset.extras = { source: 'https://grab3d.com/dl/woman-rigged/woman-rigged.glb', sourceSha256: createHash('sha256').update(source).digest('hex') };
model.buffers = [{ byteLength: offset }];
let json = Buffer.from(JSON.stringify(model));
json = Buffer.concat([json, Buffer.alloc((-json.length) & 3, 0x20)]);
const body = Buffer.concat(parts);
const header = Buffer.alloc(20);
header.write('glTF'); header.writeUInt32LE(2, 4); header.writeUInt32LE(28 + json.length + body.length, 8);
header.writeUInt32LE(json.length, 12); header.write('JSON', 16);
const binaryHeader = Buffer.alloc(8);
binaryHeader.writeUInt32LE(body.length); binaryHeader.write('BIN\0', 4);
const output = gzipSync(Buffer.concat([header, json, binaryHeader, body]), { level: 9 });
await writeFile('assets/guide.glb.gz', output);
console.log(`Avatar: ${vertices.length} vertices, ${keptIndices.length / 3} triangles, ${names.length} facial poses, ${output.length} bytes gzip.`);
