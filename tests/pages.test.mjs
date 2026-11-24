import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const workflow = await readFile('.github/workflows/pages.yml', 'utf8');
const source = workflow.split(/ {10}script: \|\r?\n/)[1].replace(/^ {12}/gm, '');
const execute = new (Object.getPrototypeOf(async function () {}).constructor)('core', 'github', 'context', 'process', 'setTimeout', source);

function setup(statuses) {
  const requests = [];
  const outputs = {};
  const core = { getIDToken: async () => 'test-oidc', info() {}, setOutput: (key, value) => { outputs[key] = value; } };
  const github = {
    async request(route, payload) {
      requests.push({ route, payload });
      if (route.endsWith('/cancel')) return { data: {} };
      if (route.startsWith('POST')) return { data: { id: 'deployment-1', page_url: 'https://example.test/catalog/' } };
      return { data: { status: statuses.length > 1 ? statuses.shift() : statuses[0] } };
    }
  };
  return {
    requests, outputs,
    run: id => execute(core, github, { repo: { owner: 'demo', repo: 'catalog' }, sha: 'revision' }, { env: { PAGES_ARTIFACT_ID: id } }, callback => callback())
  };
}

test('Pages publica el ID exacto devuelto por la carga y espera la confirmación', async () => {
  const state = setup(['deploying', 'succeed']);
  await state.run('123');
  assert.equal(state.requests[0].payload.artifact_id, 123);
  assert.equal(state.requests[0].payload.pages_build_version, 'revision');
  assert.equal(state.requests[0].payload.oidc_token, 'test-oidc');
  assert.equal(state.requests[1].payload.deployment_id, 'deployment-1');
  assert.equal(state.outputs.page_url, 'https://example.test/catalog/');
  assert.equal(state.requests.length, 3);
});

test('Pages no informa éxito si el artefacto falta o el despliegue falla', async () => {
  const missing = setup(['succeed']);
  await assert.rejects(missing.run(''), /identificador/);
  assert.equal(missing.requests.length, 0);
  const failed = setup(['deployment_content_failed']);
  await assert.rejects(failed.run('123'), /deployment_content_failed/);
  assert.deepEqual(failed.outputs, {});
});

test('Pages cancela un despliegue que excede el tiempo de espera', async () => {
  const state = setup(['deploying']);
  await assert.rejects(state.run('123'), /fue cancelada/);
  assert.ok(state.requests.at(-1).route.endsWith('/cancel'));
  assert.deepEqual(state.outputs, {});
});
