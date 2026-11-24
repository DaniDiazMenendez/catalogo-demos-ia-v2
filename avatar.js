import {
  ACESFilmicToneMapping, Color, DirectionalLight, Euler, HemisphereLight,
  OrthographicCamera, Quaternion, Scene, Vector3, WebGLRenderer
} from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export async function initAvatar3D(container) {
  const renderer = new WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1;
  const scene = new Scene();
  scene.background = new Color('#e7eff8');
  scene.add(new HemisphereLight(0xfff5ec, 0x7c96b6, 1.8));
  const key = new DirectionalLight(0xfff2e3, 2);
  key.position.set(1, 2, 3);
  scene.add(key);
  const fill = new DirectionalLight(0xe2edff, 0.9);
  fill.position.set(-2, 1, 2);
  scene.add(fill);

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
        material.roughness = Math.max(material.roughness, 0.6);
      }
    }
  });
  model.updateMatrixWorld(true);
  const focus = head.getWorldPosition(new Vector3());
  focus.y += 0.04;
  const halfHeight = 0.24;
  const camera = new OrthographicCamera(-0.2, 0.2, halfHeight, -halfHeight, 0.01, 20);
  camera.position.set(focus.x, focus.y, focus.z + 3);
  camera.lookAt(focus);
  const rest = head.quaternion.clone();
  const turn = new Quaternion();
  const angles = new Euler();
  renderer.domElement.setAttribute('aria-hidden', 'true');
  container.append(renderer.domElement);
  const resize = new ResizeObserver(() => {
    const { width, height } = container.getBoundingClientRect();
    if (!width || !height) return;
    camera.left = -halfHeight * width / height;
    camera.right = halfHeight * width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
  });
  resize.observe(container);

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let speaking = false;
  let word = '';
  let wordTime = 0;
  let lastFrame = 0;
  let visible = true;
  const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; });
  observer.observe(container);
  const vowels = { a: 'viseme_aa', e: 'viseme_E', i: 'viseme_I', o: 'viseme_O', u: 'viseme_U' };

  function setMorph(name, value) {
    for (const mesh of morphMeshes) {
      const index = mesh.morphTargetDictionary[name];
      if (index !== undefined) mesh.morphTargetInfluences[index] = value;
    }
  }
  function resetMouth() {
    for (const name of ['viseme_aa', 'viseme_E', 'viseme_I', 'viseme_O', 'viseme_U', 'viseme_PP']) setMorph(name, 0);
  }

  renderer.setAnimationLoop(now => {
    if (!visible || document.hidden || now - lastFrame < 33) return;
    lastFrame = now;
    const time = now / 1000;
    const blinkPhase = time % 4.7;
    const blink = reducedMotion.matches ? 0 : Math.max(0, 1 - Math.abs(blinkPhase - 0.12) / 0.1);
    setMorph('eyeBlinkLeft', blink);
    setMorph('eyeBlinkRight', blink);
    setMorph('mouthSmileLeft', speaking ? 0.04 : 0.1);
    setMorph('mouthSmileRight', speaking ? 0.04 : 0.1);
    if (!reducedMotion.matches) {
      angles.set(Math.sin(time * 0.8) * 0.018, Math.sin(time * 0.55) * 0.035, Math.sin(time * 0.7) * 0.012);
      head.quaternion.copy(rest).multiply(turn.setFromEuler(angles));
    } else {
      head.quaternion.copy(rest);
    }
    resetMouth();
    if (speaking) {
      const character = word[Math.floor((now - wordTime) / 95) % Math.max(word.length, 1)] || 'a';
      const closed = /[mbp]/.test(character);
      const opening = 0.12 + Math.abs(Math.sin(time * 13)) * 0.45;
      setMorph(closed ? 'viseme_PP' : (vowels[character] || 'viseme_aa'), closed ? 0.45 : opening);
    }
    renderer.render(scene, camera);
  });
  container.dataset.ready = 'true';
  return {
    setSpeaking(value) {
      speaking = value;
      if (!value) {
        word = '';
        resetMouth();
      }
    },
    setWord(value) {
      word = value.toLocaleLowerCase('es').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      wordTime = performance.now();
    },
    dispose() {
      observer.disconnect();
      resize.disconnect();
      renderer.setAnimationLoop(null);
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
