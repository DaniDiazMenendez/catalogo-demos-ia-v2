import {
  ACESFilmicToneMapping, Color, DirectionalLight, Euler, HemisphereLight,
  MathUtils, MeshPhysicalMaterial, PCFSoftShadowMap, PerspectiveCamera,
  PMREMGenerator, Quaternion, Scene, Vector3, WebGLRenderer
} from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { createSpeechMotion } from './speech-motion.js';

export async function initAvatar3D(container) {
  const renderer = new WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(Math.max(window.devicePixelRatio || 1, 1.5), 2));
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = PCFSoftShadowMap;
  const scene = new Scene();
  scene.background = new Color('#edf0f3');
  scene.add(new HemisphereLight(0xfff3e7, 0x93a0b0, 0.5));
  const key = new DirectionalLight(0xffe6d3, 2.4);
  scene.add(key);
  const fill = new DirectionalLight(0xe4eeff, 0.7);
  scene.add(fill);
  const rim = new DirectionalLight(0xffffff, 1.8);
  scene.add(rim);

  let model;
  try {
    const response = await fetch(new URL('./assets/guide.glb.gz', import.meta.url));
    if (!response.ok) throw new Error(`No se pudo descargar el avatar: HTTP ${response.status}`);
    const compressed = await response.arrayBuffer();
    const stream = new Blob([compressed]).stream().pipeThrough(new DecompressionStream('gzip'));
    const data = await new Response(stream).arrayBuffer();
    model = (await new GLTFLoader().parseAsync(data, '')).scene;
  } catch (error) {
    renderer.dispose();
    throw error;
  }
  scene.add(model);
  const head = model.getObjectByName('Head');
  if (!head) {
    renderer.dispose();
    throw new Error('El modelo no tiene el hueso de cabeza esperado.');
  }
  const morphMeshes = [];
  model.traverse(object => {
    if (object.morphTargetDictionary) morphMeshes.push(object);
    if (object.isMesh) {
      for (const material of Array.isArray(object.material) ? object.material : [object.material]) {
        material.metalness = 0;
        if (material.name === 'Human.body') material.roughness = 0.5;
        if (/eyebrows|eyelashes/.test(material.name)) material.color.set('#49322b');
        if (/eyebrows/.test(material.name)) {
          material.transparent = true;
          material.opacity = 0.7;
          material.depthWrite = false;
        }
        if (material.name === 'Human.female_casualsuit01') {
          material.map = null;
          material.color.set('#24445c');
        }
        if (/ponytail/.test(material.name)) material.alphaToCoverage = true;
      }
      object.castShadow = !/eyebrows|eyelashes|high-poly/.test(object.name);
      object.receiveShadow = true;
      if (object.material.name === 'Human.high-poly') {
        const original = object.material;
        object.material = new MeshPhysicalMaterial({
          name: original.name, map: original.map, color: original.color,
          side: original.side, alphaTest: original.alphaTest, alphaToCoverage: true,
          roughness: 0.18, clearcoat: 1, clearcoatRoughness: 0.08, ior: 1.38
        });
        original.dispose();
      }
    }
  });
  const environmentGenerator = new PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const environment = environmentGenerator.fromScene(room, 0.04);
  scene.environment = environment.texture;
  scene.environmentIntensity = 0.3;
  room.dispose();
  environmentGenerator.dispose();
  model.updateMatrixWorld(true);
  const focus = head.getWorldPosition(new Vector3());
  focus.y += 0.04;
  key.position.copy(focus).add(new Vector3(-0.8, 1.2, 1.8));
  fill.position.copy(focus).add(new Vector3(1, 0.3, 1.2));
  rim.position.copy(focus).add(new Vector3(0.5, 0.7, -0.8));
  for (const light of [key, fill, rim]) {
    light.target.position.copy(focus);
    scene.add(light.target);
  }
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  Object.assign(key.shadow.camera, { left: -0.45, right: 0.45, top: 0.45, bottom: -0.45, near: 0.1, far: 5 });
  key.shadow.normalBias = 0.0015;
  key.shadow.bias = -0.00015;
  const camera = new PerspectiveCamera(24, 1, 0.1, 10);
  camera.position.copy(focus).add(new Vector3(0.02, 0.015, 1.12));
  camera.lookAt(focus);
  const rest = head.quaternion.clone();
  const turn = new Quaternion();
  const angles = new Euler();
  const eyes = ['LeftEye', 'RightEye'].map(name => model.getObjectByName(name)).filter(Boolean)
    .map(bone => ({ bone, rest: bone.quaternion.clone() }));
  renderer.domElement.setAttribute('aria-hidden', 'true');
  container.append(renderer.domElement);
  const resize = new ResizeObserver(() => {
    const { width, height } = container.getBoundingClientRect();
    if (!width || !height) return;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
  });
  resize.observe(container);

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let speaking = false;
  let speechMotion;
  let lastFrame = 0;
  let nextBlink = performance.now() + 1800;
  let blinkStart = -Infinity;
  let nextGaze = 0;
  let gazeX = 0;
  let gazeY = 0;
  let eyeX = 0;
  let eyeY = 0;
  let emphasisTime = -Infinity;
  let visible = true;
  const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; });
  observer.observe(container);
  const mouthShapes = [...new Set(morphMeshes.flatMap(mesh => Object.keys(mesh.morphTargetDictionary).filter(name => name.startsWith('viseme_'))))];

  function setMorph(name, value) {
    for (const mesh of morphMeshes) {
      const index = mesh.morphTargetDictionary[name];
      if (index !== undefined) mesh.morphTargetInfluences[index] = value;
    }
  }
  function resetMouth() {
    for (const name of mouthShapes) setMorph(name, 0);
  }
  function blendMorph(name, target, delta) {
    for (const mesh of morphMeshes) {
      const index = mesh.morphTargetDictionary[name];
      if (index !== undefined) mesh.morphTargetInfluences[index] = MathUtils.damp(mesh.morphTargetInfluences[index], target, 24, delta);
    }
  }

  renderer.setAnimationLoop(now => {
    if (!visible || document.hidden || now - lastFrame < 33) return;
    const delta = Math.min((now - lastFrame) / 1000, 0.1);
    lastFrame = now;
    const time = now / 1000;
    if (now >= nextBlink) {
      blinkStart = now;
      nextBlink = now + 2800 + Math.random() * 3200;
    }
    const blinkPhase = (now - blinkStart) / 180;
    const blink = reducedMotion.matches || blinkPhase > 1 ? 0 : blinkPhase < 0.35
      ? MathUtils.smoothstep(blinkPhase, 0, 0.35) : 1 - MathUtils.smoothstep(blinkPhase, 0.35, 1);
    setMorph('eyeBlinkLeft', blink);
    setMorph('eyeBlinkRight', blink);
    blendMorph('mouthSmileLeft', speaking ? 0.045 : 0.19, delta);
    blendMorph('mouthSmileRight', speaking ? 0.04 : 0.17, delta);
    const nodPhase = (now - emphasisTime) / 750;
    const nod = speaking && nodPhase < 1 ? Math.sin(nodPhase * Math.PI) * 0.018 : 0;
    blendMorph('browInnerUp', nod * 4, delta);
    if (!reducedMotion.matches) {
      angles.set(0.01 + nod + Math.sin(time * 0.7) * 0.003, -0.075 + Math.sin(time * 0.4) * 0.008, -0.012);
      head.quaternion.copy(rest).multiply(turn.setFromEuler(angles));
      if (now >= nextGaze) {
        gazeX = (Math.random() - 0.5) * 0.016;
        gazeY = (Math.random() - 0.5) * 0.025;
        nextGaze = now + 1900 + Math.random() * 2600;
      }
      eyeX = MathUtils.damp(eyeX, gazeX, 14, delta);
      eyeY = MathUtils.damp(eyeY, gazeY, 14, delta);
      for (const eye of eyes) eye.bone.quaternion.copy(eye.rest).premultiply(turn.setFromEuler(angles.set(eyeX, 0.065 + eyeY, 0)));
    } else {
      head.quaternion.copy(rest);
      for (const eye of eyes) eye.bone.quaternion.copy(eye.rest);
    }
    const weights = speaking ? speechMotion?.sample(now) || {} : {};
    for (const shape of mouthShapes) blendMorph(shape, weights[shape] || 0, delta);
    renderer.render(scene, camera);
  });
  container.dataset.ready = 'true';
  return {
    setSpeaking(value, text = '') {
      speaking = value;
      if (value) {
        speechMotion = createSpeechMotion(text);
        speechMotion.start(performance.now());
      } else {
        speechMotion?.stop();
        resetMouth();
      }
    },
    setWord(value, index) {
      const now = performance.now();
      speechMotion?.syncWord(index, now);
      if (/experiencia|encontrarlas|aplicación|arquitectura|originales/i.test(value)) emphasisTime = now;
    },
    dispose() {
      observer.disconnect();
      resize.disconnect();
      renderer.setAnimationLoop(null);
      environment.dispose();
      key.shadow.dispose();
      model.traverse(object => {
        object.geometry?.dispose();
        if (!object.material) return;
        for (const material of Array.isArray(object.material) ? object.material : [object.material]) {
          for (const value of Object.values(material)) if (value?.isTexture) value.dispose();
          material.dispose();
        }
      });
      renderer.dispose();
      renderer.domElement.remove();
    }
  };
}
