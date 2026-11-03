'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import IconSprite from './IconSprite';

/* 5. Data (verbatim) */
const DINOS = [
  {
    id: 'phoenix', no: 'MA-001', era: [-800, -430], eraLabel: 'Herodotus, 430 BC', scale: '1 m',
    name: 'Phoenix', latin: 'Phoenix ignis', family: 'Fire birds',
    image: 'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20261031_020340_4815bb8d-68c3-48c4-ad05-6307d085e896.png&w=900&q=85',
    model: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20261031_015714_12c0e407-828a-4b1f-957c-2efe1fe83be1.glb',
    yaw: 3.9, pitch: 0.1,
    tags: ['Immortal', 'Solitary', 'Fire-born'],
    lede: 'A bird the size of an eagle in crimson and gold, said to live five hundred years before building a nest of frankincense and myrrh, setting it alight and rising again from the ash. Herodotus heard the story in Egypt and admitted he did not quite believe it. Every age since has told it anyway.',
    traits: [
      ['t-wing', 'Wingspan', '4 m'],
      ['t-time', 'Lifespan', '500 years, then again'],
      ['t-diet', 'Diet', 'Frankincense and myrrh'],
      ['t-range', 'Reported', 'Heliopolis, Egypt'],
    ],
    habitat: 'Temple roofs, desert dawns and the pages of Herodotus.',
    caption: 'Burns once a lifetime. Never twice the same.',
    closeup: 'Each tail plume ends in a pale gold tip, the only part said to survive the fire.',
    lens: '55% 25%',
    feature: ['A fire you can outlive.', 'Crimson, gold and patient. The bird that refuses to end.'],
  },
  {
    id: 'kraken', no: 'MA-002', era: [1180, 1752], eraLabel: 'Pontoppidan, 1752', scale: '10 m',
    name: 'Kraken', latin: 'Architeuthis mythos', family: 'Sea monsters',
    image: 'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20261031_020342_3e375b40-2c06-4189-995a-acbc21f06142.png&w=900&q=85',
    model: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20261031_013537_0dc2c71f-4f11-4a86-ab93-91a59535d5b7.glb',
    yaw: 0.75, pitch: 0.12,
    tags: ['Abyssal', 'Ship-taker', 'Norse'],
    lede: 'Norwegian sailors described an island that was not there the day before, then the whirlpool it left when it sank. Bishop Pontoppidan wrote it up in 1752 as the largest creature in the world. The giant squid, hauled up a century later, turned out to be the smaller, truer version of the same story.',
    traits: [
      ['t-ruler', 'Length', 'A mile across, by oath'],
      ['t-depth', 'Depth', 'Norwegian Sea floor'],
      ['t-diet', 'Diet', 'Fish, whales and ships'],
      ['t-range', 'Reported', 'Off Bergen, Norway'],
    ],
    habitat: 'Cold deep water between Norway and Iceland.',
    caption: 'The island breathed, and the crew stopped rowing.',
    closeup: 'Suckers the width of a barrel lid, each ringed with a horn like a saw.',
    lens: '30% 45%',
    feature: ['An island with an appetite.', 'Eight arms, two tentacles and a thousand years of sailors’ tales.'],
  },
];

const LIGHT_PRESETS = {
  day:  { env: 0.95, key: 1.6, rim: 0.5, keyColor: 0xfff4e2, exposure: 1.05 },
  dusk: { env: 0.28, key: 2.6, rim: 1.9, keyColor: 0xffc98a, exposure: 1.0 }
};

function inCubic(t) { return t * t * t; }
function outCubic(t) { return 1 - Math.pow(1 - t, 3); }
function outBack(t) { return 1 + 2.2 * Math.pow(t - 1, 3) + 1.2 * Math.pow(t - 1, 2); }
function clamp01(v) { return Math.max(0, Math.min(1, v)); }

export default function MythAtlas() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isDusk, setIsDusk] = useState(false);
  const [isFocus, setIsFocus] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isFailed, setIsFailed] = useState(false);
  const [isTouched, setIsTouched] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);
  const [zoomGoal, setZoomGoalState] = useState(1.0);

  const heroRef = useRef(null);
  const canvasRef = useRef(null);
  const stageRef = useRef(null);
  const cardRef = useRef(null);
  const tabsRef = useRef(null);

  /* Animation and Three.js references */
  const activeIndexRef = useRef(0);
  activeIndexRef.current = activeIndex;

  const isDuskRef = useRef(false);
  isDuskRef.current = isDusk;

  const isFocusRef = useRef(false);
  isFocusRef.current = isFocus;

  const zoomRef = useRef(1.0);
  const zoomGoalRef = useRef(1.0);
  const lastTouchRef = useRef(-10000);
  const homingRef = useRef(false);
  const yawQueueRef = useRef(0);
  const velRef = useRef({ x: 0, y: 0 });
  const animRef = useRef(null);
  const switchTokenRef = useRef(0);
  const rigsRef = useRef([]);

  const viewRef = useRef({ cx: 0, cy: 0, px: 1, sw: 100 });
  const goalRef = useRef({ cx: 0, cy: 0, px: 1, sw: 100 });
  const firstMeasureRef = useRef(true);

  const pointersRef = useRef(new Map());
  const pinchDistRef = useRef(0);
  const lastPosRef = useRef({ x: 0, y: 0 });

  const touched = useCallback(() => {
    lastTouchRef.current = performance.now();
    homingRef.current = false;
    setIsTouched(true);
  }, []);

  const setZoom = useCallback((val) => {
    const clamped = Math.min(3.4, Math.max(0.55, val));
    zoomGoalRef.current = clamped;
    setZoomGoalState(clamped);
  }, []);

  const currentDino = DINOS[activeIndex];

  /* Three.js setup & main loop */
  useEffect(() => {
    const canvas = canvasRef.current;
    const hero = heroRef.current;
    const stage = stageRef.current;
    if (!canvas || !hero || !stage) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.NeutralToneMapping;
    renderer.toneMappingExposure = 1.05;

    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    pmrem.compileEquirectangularShader();
    const roomEnv = new RoomEnvironment();
    scene.environment = pmrem.fromScene(roomEnv, 0.04).texture;
    scene.environmentIntensity = 0.95;
    pmrem.dispose();

    const camera = new THREE.PerspectiveCamera(26, 1, 0.1, 100);

    const key = new THREE.DirectionalLight(0xfff4e2, 1.6);
    key.position.set(2.5, 4, 5);
    scene.add(key);

    const rim = new THREE.DirectionalLight(0xbfd8ff, 0.5);
    rim.position.set(-4, 2, -3);
    scene.add(rim);

    let curLight = { env: 0.95, key: 1.6, rim: 0.5, exposure: 1.05 };
    const curKeyColor = new THREE.Color(0xfff4e2);
    const targetKeyColor = new THREE.Color(0xfff4e2);

    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/');
    const gltfLoader = new GLTFLoader();
    gltfLoader.setDRACOLoader(dracoLoader);
    gltfLoader.setMeshoptDecoder(MeshoptDecoder);

    const rigs = DINOS.map(d => {
      const pivot = new THREE.Group();
      const spin = new THREE.Group();
      pivot.add(spin);
      scene.add(pivot);

      const home = new THREE.Quaternion().setFromEuler(
        new THREE.Euler(d.pitch, d.yaw, 0, 'YXZ')
      );
      spin.quaternion.copy(home);
      pivot.visible = false;

      return {
        pivot,
        spin,
        home,
        holder: null,
        model: null,
        loaded: false,
        failed: false,
        promise: null
      };
    });
    rigsRef.current = rigs;

    function loadCreature(idx) {
      const rig = rigs[idx];
      if (rig.promise) return rig.promise;

      rig.promise = new Promise(resolve => {
        gltfLoader.load(
          DINOS[idx].model,
          gltf => {
            const model = gltf.scene;
            const box = new THREE.Box3().setFromObject(model);
            const sphere = box.getBoundingSphere(new THREE.Sphere());
            model.position.sub(sphere.center);

            const holder = new THREE.Group();
            holder.scale.setScalar(1 / sphere.radius);
            holder.add(model);

            model.traverse(node => {
              if (node.isMesh) {
                node.frustumCulled = false;
                if (node.material) {
                  node.material.envMapIntensity = 1;
                  if (node.material.map) {
                    node.material.map.anisotropy = renderer.capabilities.getMaxAnisotropy();
                  }
                }
              }
            });

            rig.holder = holder;
            rig.model = model;
            rig.spin.add(holder);
            rig.loaded = true;
            resolve(rig);
          },
          undefined,
          err => {
            console.error('Failed to load model ' + DINOS[idx].id, err);
            rig.failed = true;
            if (activeIndexRef.current === idx) {
              setIsFailed(true);
            }
            resolve(rig);
          }
        );
      });

      return rig.promise;
    }

    function measure() {
      const focus = isFocusRef.current;
      const h = hero.getBoundingClientRect();
      const s = focus ? h : stage.getBoundingClientRect();
      const W = h.width;
      const H = h.height;
      if (W <= 0 || H <= 0) return;

      goalRef.current.cx = s.left - h.left + s.width / 2;
      goalRef.current.cy = s.top - h.top + s.height * (focus ? 0.5 : 0.44);
      goalRef.current.px = Math.min(s.width * 0.5, s.height * 0.6) * 1.16;
      goalRef.current.sw = s.width;

      renderer.setSize(W, H, false);
      camera.aspect = W / H;

      if (firstMeasureRef.current) {
        viewRef.current.cx = goalRef.current.cx;
        viewRef.current.cy = goalRef.current.cy;
        viewRef.current.px = goalRef.current.px;
        viewRef.current.sw = goalRef.current.sw;
        firstMeasureRef.current = false;
      }
    }

    const ro = new ResizeObserver(() => measure());
    ro.observe(hero);
    ro.observe(stage);
    window.addEventListener('resize', measure);
    window.addEventListener('orientationchange', measure);

    measure();

    let lastTime = performance.now();
    let animId;

    const _axisY = new THREE.Vector3(0, 1, 0);
    const _axisX = new THREE.Vector3(1, 0, 0);
    const _qY = new THREE.Quaternion();
    const _qX = new THREE.Quaternion();

    function loop(now) {
      animId = requestAnimationFrame(loop);

      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;

      function f(rate) {
        return 1 - Math.exp(-dt * rate);
      }

      /* View easing */
      viewRef.current.cx += (goalRef.current.cx - viewRef.current.cx) * f(7);
      viewRef.current.cy += (goalRef.current.cy - viewRef.current.cy) * f(7);
      viewRef.current.px += (goalRef.current.px - viewRef.current.px) * f(7);
      viewRef.current.sw += (goalRef.current.sw - viewRef.current.sw) * f(7);

      /* Zoom easing */
      zoomRef.current += (zoomGoalRef.current - zoomRef.current) * f(6);

      /* Lighting easing */
      const targetPreset = LIGHT_PRESETS[isDuskRef.current ? 'dusk' : 'day'];
      curLight.env += (targetPreset.env - curLight.env) * f(4);
      curLight.key += (targetPreset.key - curLight.key) * f(4);
      curLight.rim += (targetPreset.rim - curLight.rim) * f(4);
      curLight.exposure += (targetPreset.exposure - curLight.exposure) * f(4);
      targetKeyColor.setHex(targetPreset.keyColor);
      curKeyColor.lerp(targetKeyColor, f(4));

      scene.environmentIntensity = curLight.env;
      renderer.toneMappingExposure = curLight.exposure;
      key.intensity = curLight.key;
      key.color.copy(curKeyColor);
      rim.intensity = curLight.rim;

      /* Camera position & projection offset */
      const W = hero.clientWidth;
      const H = hero.clientHeight;
      if (W > 0 && H > 0) {
        camera.position.z = H / (2 * Math.tan(THREE.MathUtils.degToRad(26 / 2)) * viewRef.current.px * zoomRef.current);
        camera.setViewOffset(W, H, W / 2 - viewRef.current.cx, H / 2 - viewRef.current.cy, W, H);
      }

      const active = activeIndexRef.current;

      function turnBy(dyaw, dpitch) {
        if (!rigs[active]) return;
        _qY.setFromAxisAngle(_axisY, dyaw);
        _qX.setFromAxisAngle(_axisX, dpitch);
        rigs[active].spin.quaternion.premultiply(_qY).premultiply(_qX);
      }

      /* Inertia decay */
      if (pointersRef.current.size === 0 && (Math.abs(velRef.current.x) > 1e-5 || Math.abs(velRef.current.y) > 1e-5)) {
        turnBy(velRef.current.x, velRef.current.y);
        const decay = Math.exp(-dt * 4.5);
        velRef.current.x *= decay;
        velRef.current.y *= decay;
      }

      /* Yaw queue */
      if (Math.abs(yawQueueRef.current) > 1e-5) {
        const step = yawQueueRef.current * f(4.2);
        yawQueueRef.current -= step;
        turnBy(step, 0);
      }

      /* Homing */
      if (homingRef.current && rigs[active]) {
        const curQ = rigs[active].spin.quaternion;
        const homeQ = rigs[active].home;
        curQ.slerp(homeQ, f(6));
        const dot = Math.abs(Math.min(1, Math.max(-1, curQ.dot(homeQ))));
        const angle = 2 * Math.acos(dot);
        if (angle < 0.002) {
          curQ.copy(homeQ);
          homingRef.current = false;
        }
      }

      /* Animation and sway */
      const s = now / 1000;
      const idle = reducedMotion ? 0 : clamp01((now - lastTouchRef.current - 1800) / 1500);
      const slide = goalRef.current.sw * 0.95 / viewRef.current.px;
      const DUR = reducedMotion ? 1 : 780;

      const anim = animRef.current;
      if (anim) {
        if (anim.from >= 0) {
          const tOut = (now - anim.t0) / (DUR * 0.6);
          if (tOut < 1) {
            const e = inCubic(clamp01(tOut));
            const k = 1 - e;
            const x = -anim.dir * e * slide;
            const twist = -anim.dir * e * 1.4;
            const rigFrom = rigs[anim.from];
            rigFrom.pivot.visible = true;
            rigFrom.pivot.scale.setScalar(k);
            rigFrom.pivot.position.set(x, Math.sin(s * 1.3 + anim.from) * 0.028, 0);
            rigFrom.pivot.rotation.set(Math.sin(s * 0.9) * 0.03 * idle, twist + Math.sin(s * 0.55) * 0.16 * idle, 0);
          } else {
            rigs[anim.from].pivot.visible = false;
          }
        }

        if (anim.to >= 0) {
          const tIn = (now - anim.t1) / DUR;
          if (tIn < 1) {
            const e = outCubic(clamp01(tIn));
            const k = Math.max(0.0001, outBack(tIn)) * (0.25 + 0.75 * e);
            const x = anim.dir * (1 - e) * slide;
            const twist = anim.dir * (1 - e) * 1.6;
            const rigTo = rigs[anim.to];
            rigTo.pivot.visible = true;
            rigTo.pivot.scale.setScalar(k);
            rigTo.pivot.position.set(x, Math.sin(s * 1.3 + anim.to) * 0.028, 0);
            rigTo.pivot.rotation.set(Math.sin(s * 0.9) * 0.03 * idle, twist + Math.sin(s * 0.55) * 0.16 * idle, 0);
          } else {
            animRef.current = null;
          }
        }
      }

      if (!animRef.current) {
        rigs.forEach((rig, idx) => {
          if (idx === active) {
            rig.pivot.visible = true;
            rig.pivot.scale.setScalar(1);
            rig.pivot.position.set(0, Math.sin(s * 1.3 + idx) * 0.028, 0);
            rig.pivot.rotation.set(Math.sin(s * 0.9) * 0.03 * idle, Math.sin(s * 0.55) * 0.16 * idle, 0);
          } else {
            rig.pivot.visible = false;
          }
        });
      }

      renderer.render(scene, camera);
    }

    animId = requestAnimationFrame(loop);

    /* Initial model load */
    loadCreature(0).then(() => {
      setIsLoading(false);
      rigs[0].spin.quaternion.copy(rigs[0].home);
      animRef.current = { from: -1, to: 0, dir: 1, t1: performance.now() };
      loadCreature(1);
    });

    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
      window.removeEventListener('resize', measure);
      window.removeEventListener('orientationchange', measure);
      renderer.dispose();
    };
  }, []);

  /* Model selection */
  const selectCreature = useCallback((i) => {
    if (i === activeIndexRef.current) return;
    const from = activeIndexRef.current;
    const dir = Math.sign(i - from);

    setIsLeaving(true);
    setTimeout(() => {
      setActiveIndex(i);
      setIsLeaving(false);
      if (cardRef.current) cardRef.current.scrollTop = 0;
    }, 200);

    setIsSwitching(true);
    velRef.current = { x: 0, y: 0 };
    yawQueueRef.current = 0;
    setZoom(1);

    const token = ++switchTokenRef.current;
    const now = performance.now();
    animRef.current = { from, to: -1, dir, t0: now };

    const rigs = rigsRef.current;
    const targetRig = rigs[i];
    if (targetRig && !targetRig.loaded && !targetRig.failed) {
      setIsLoading(true);
    }

    if (targetRig) {
      if (!targetRig.promise) {
        // Will be loaded via loader in useEffect or triggered here
        targetRig.promise = new Promise(res => setTimeout(res, 50));
      }
      targetRig.promise.then(() => {
        if (switchTokenRef.current !== token) return;
        setIsLoading(false);
        if (targetRig.failed) {
          setIsFailed(true);
        } else {
          setIsFailed(false);
        }
        targetRig.spin.quaternion.copy(targetRig.home);
        animRef.current.to = i;
        animRef.current.t1 = performance.now();
        setIsSwitching(false);
      });
    }
  }, [setZoom]);

  /* Pointer handlers */
  const handlePointerDown = (e) => {
    if (e.target.closest('button, a, input, .rail, .turn')) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointersRef.current.size === 1) {
      setIsDragging(true);
      lastPosRef.current = { x: e.clientX, y: e.clientY };
      velRef.current = { x: 0, y: 0 };
      yawQueueRef.current = 0;
      touched();
    } else if (pointersRef.current.size === 2) {
      const pts = Array.from(pointersRef.current.values());
      pinchDistRef.current = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      setIsDragging(false);
    }
  };

  const handlePointerMove = (e) => {
    if (!pointersRef.current.has(e.pointerId)) return;
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointersRef.current.size === 1 && isDragging) {
      const dx = e.clientX - lastPosRef.current.x;
      const dy = e.clientY - lastPosRef.current.y;
      lastPosRef.current = { x: e.clientX, y: e.clientY };

      const k = Math.PI / Math.max(260, viewRef.current.px * 1.6);
      velRef.current.x = dx * k;
      velRef.current.y = dy * k;

      const active = activeIndexRef.current;
      const rig = rigsRef.current[active];
      if (rig) {
        const _axisY = new THREE.Vector3(0, 1, 0);
        const _axisX = new THREE.Vector3(1, 0, 0);
        const _qY = new THREE.Quaternion().setFromAxisAngle(_axisY, velRef.current.x);
        const _qX = new THREE.Quaternion().setFromAxisAngle(_axisX, velRef.current.y);
        rig.spin.quaternion.premultiply(_qY).premultiply(_qX);
      }
      touched();
    } else if (pointersRef.current.size === 2 && pinchDistRef.current > 0) {
      const pts = Array.from(pointersRef.current.values());
      const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      if (dist > 0) {
        const ratio = dist / pinchDistRef.current;
        setZoom(zoomGoalRef.current * ratio);
        pinchDistRef.current = dist;
        touched();
      }
    }
  };

  const handlePointerUp = (e) => {
    pointersRef.current.delete(e.pointerId);
    if (pointersRef.current.size < 2) pinchDistRef.current = 0;
    if (pointersRef.current.size === 0) {
      setIsDragging(false);
    }
  };

  const handleWheel = (e) => {
    e.preventDefault();
    touched();
    const factor = Math.exp(-e.deltaY * (e.ctrlKey ? 0.01 : 0.0016));
    setZoom(zoomGoalRef.current * factor);
  };

  const triggerReset = () => {
    touched();
    homingRef.current = true;
    yawQueueRef.current = 0;
    velRef.current = { x: 0, y: 0 };
    setZoom(1);
  };

  const handleStageKeyDown = (e) => {
    const active = activeIndexRef.current;
    const rig = rigsRef.current[active];
    const turnBy = (dyaw, dpitch) => {
      if (!rig) return;
      const _axisY = new THREE.Vector3(0, 1, 0);
      const _axisX = new THREE.Vector3(1, 0, 0);
      const _qY = new THREE.Quaternion().setFromAxisAngle(_axisY, dyaw);
      const _qX = new THREE.Quaternion().setFromAxisAngle(_axisX, dpitch);
      rig.spin.quaternion.premultiply(_qY).premultiply(_qX);
    };

    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      touched();
      turnBy(-0.18, 0);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      touched();
      turnBy(0.18, 0);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      touched();
      turnBy(0, -0.18);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      touched();
      turnBy(0, 0.18);
    } else if (e.key === '+' || e.key === '=') {
      e.preventDefault();
      touched();
      setZoom(zoomGoalRef.current * 1.2);
    } else if (e.key === '-') {
      e.preventDefault();
      touched();
      setZoom(zoomGoalRef.current / 1.2);
    } else if (e.key === '0') {
      e.preventDefault();
      triggerReset();
    }
  };

  /* Global Escape key for focus mode */
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && isFocusRef.current) {
        setIsFocus(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const toggleExpand = () => {
    setIsFocus(prev => !prev);
    touched();
  };

  const toggleLight = () => {
    setIsDusk(prev => {
      const next = !prev;
      document.body.style.background = next ? '#14170f' : '';
      return next;
    });
    touched();
  };

  const handleCloseupToggle = () => {
    touched();
    setZoom(zoomGoalRef.current > 2.2 ? 1 : 2.6);
  };

  /* Era calculation */
  const eraFrom = currentDino.era[0];
  const eraTo = currentDino.era[1];
  const pctFrom = ((eraFrom + 800) / 2700) * 100;
  const pctTo = ((eraTo + 800) / 2700) * 100;
  const widthPct = Math.max(0.6, pctTo - pctFrom);
  const isLeft = pctFrom < 50;

  return (
    <>
      <IconSprite />

      <main
        className={`hero ${isFocus ? 'focus' : ''} ${isTouched ? 'touched' : ''}`}
        id="hero"
        ref={heroRef}
        data-light={isDusk ? 'dusk' : 'day'}
      >
        <canvas id="gl" ref={canvasRef} />

        {/* 4.1 Sidebar */}
        <aside className="side" aria-label="Atlas sections">
          <div className="brand">
            Myth Atlas
            <small>Cryptozoology · Vol. I</small>
          </div>
          <ul className="nav">
            <li>
              <button className="nav-btn" type="button">
                <svg className="ico"><use href="#i-home" /></svg>
                <span className="text">Home</span>
              </button>
            </li>
            <li>
              <button className="nav-btn" type="button" aria-current="page">
                <svg className="ico"><use href="#i-star" /></svg>
                <span className="text"><b>Featured</b></span>
              </button>
            </li>
            <li>
              <button className="nav-btn" type="button" onClick={() => selectCreature(0)}>
                <svg className="ico"><use href="#i-flame" /></svg>
                <span className="text">Fire birds<small>6 legends</small></span>
              </button>
            </li>
            <li>
              <button className="nav-btn" type="button" onClick={() => selectCreature(1)}>
                <svg className="ico"><use href="#i-wave" /></svg>
                <span className="text">Sea monsters<small>14 legends</small></span>
              </button>
            </li>
            <li>
              <button className="nav-btn" type="button">
                <svg className="ico"><use href="#i-claw" /></svg>
                <span className="text">Dragons<small>22 legends</small></span>
              </button>
            </li>
            <li>
              <button className="nav-btn" type="button">
                <svg className="ico"><use href="#i-skull" /></svg>
                <span className="text">Chimeras<small>9 legends</small></span>
              </button>
            </li>
            <li>
              <button className="nav-btn" type="button">
                <svg className="ico"><use href="#i-peak" /></svg>
                <span className="text">Giants<small>11 legends</small></span>
              </button>
            </li>
            <li>
              <button className="nav-btn" type="button">
                <svg className="ico"><use href="#i-mask" /></svg>
                <span className="text">Tricksters<small>8 legends</small></span>
              </button>
            </li>
          </ul>

          <div className="feature">
            <div className="eyebrow">Featured creature</div>
            <img id="featImg" src={currentDino.image} alt={currentDino.name} width={92} height={76} />
            <h3 id="featTitle">{currentDino.feature[0]}</h3>
            <p id="featText">{currentDino.feature[1]}</p>
            <a
              href="#detail"
              onClick={(e) => {
                e.preventDefault();
                if (cardRef.current) {
                  cardRef.current.scrollIntoView({ behavior: 'smooth' });
                  cardRef.current.focus();
                }
              }}
            >
              Learn more <svg className="ico" width="14" height="14"><use href="#i-arrow" /></svg>
            </a>
          </div>
        </aside>

        {/* 4.2 Centre */}
        <section className="main">
          <div className="tabs" id="tabs" ref={tabsRef} role="tablist" aria-label="Featured creatures">
            {DINOS.map((d, idx) => (
              <button
                key={d.id}
                className="tab"
                id={`tab-${d.id}`}
                role="tab"
                data-no={String(idx + 1).padStart(2, '0')}
                aria-controls="detail"
                aria-selected={activeIndex === idx}
                tabIndex={activeIndex === idx ? 0 : -1}
                type="button"
                onClick={() => selectCreature(idx)}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                    e.preventDefault();
                    const next = (idx + 1) % DINOS.length;
                    selectCreature(next);
                    document.getElementById(`tab-${DINOS[next].id}`)?.focus();
                  } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                    e.preventDefault();
                    const prev = (idx - 1 + DINOS.length) % DINOS.length;
                    selectCreature(prev);
                    document.getElementById(`tab-${DINOS[prev].id}`)?.focus();
                  }
                }}
              >
                <img src={d.image} alt={d.name} width={58} height={52} />
                <b>{d.name}</b>
                <i>{d.latin}</i>
              </button>
            ))}
          </div>

          <div
            className={`stage ${isDragging ? 'dragging' : ''} ${isSwitching ? 'switching' : ''} ${isFailed ? 'failed' : ''}`}
            id="stage"
            ref={stageRef}
            tabIndex={0}
            role="region"
            aria-label="3D creature model. Drag to rotate, scroll or pinch to zoom, double-click to reset."
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onWheel={handleWheel}
            onDoubleClick={(e) => {
              if (e.target.closest('button, a, input, .rail, .turn')) return;
              triggerReset();
            }}
            onKeyDown={handleStageKeyDown}
          >
            <div className="plate" aria-hidden="true">
              <i className="tl" />
              <i className="tr" />
              <i className="bl" />
              <i className="br" />
            </div>

            <div className="ground" aria-hidden="true" />
            <div className="fallback" id="fallback" style={{ backgroundImage: `url('${currentDino.image}')` }} aria-hidden="true" />
            <div className={`loader ${isLoading ? 'show' : ''}`} id="loader" aria-hidden="true">
              Preparing the specimen…
            </div>

            <div className="hint" aria-hidden="true">
              <svg className="ico" width="15" height="15"><use href="#i-hand" /></svg>
              <span>Drag to turn · scroll to zoom</span>
            </div>

            <nav className="rail" aria-label="Viewer tools">
              <button
                id="zoomIn"
                className={zoomGoal >= 1 ? 'on' : ''}
                type="button"
                aria-label="Zoom in"
                onClick={() => { touched(); setZoom(zoomGoal * 1.35); }}
              >
                <svg className="ico" width="17" height="17"><use href="#i-plus" /></svg>
              </button>
              <button
                id="zoomOut"
                className={zoomGoal < 1 ? 'on' : ''}
                type="button"
                aria-label="Zoom out"
                onClick={() => { touched(); setZoom(zoomGoal / 1.35); }}
              >
                <svg className="ico" width="17" height="17"><use href="#i-search" /></svg>
              </button>
              <button
                id="expand"
                className={isFocus ? 'on' : ''}
                type="button"
                aria-label={isFocus ? 'Close expanded viewer' : 'Expand viewer'}
                aria-pressed={isFocus}
                onClick={toggleExpand}
              >
                <svg className="ico" width="17" height="17"><use href="#i-expand" /></svg>
              </button>
              <button
                id="light"
                className={isDusk ? 'on' : ''}
                type="button"
                aria-label={isDusk ? 'Switch to daylight' : 'Switch to dusk lighting'}
                aria-pressed={isDusk}
                onClick={toggleLight}
              >
                <svg className="ico" width="17" height="17"><use href="#i-sun" /></svg>
              </button>
            </nav>

            <div className="turn" aria-label="Rotate creature">
              <button
                id="turnL"
                type="button"
                aria-label="Turn left 90°"
                onClick={() => { touched(); yawQueueRef.current -= Math.PI / 2; }}
              >
                <svg className="ico" width="16" height="16"><use href="#i-ccw" /></svg>
              </button>
              <button
                id="turnFull"
                type="button"
                aria-label="Turn 360°"
                onClick={() => { touched(); yawQueueRef.current += Math.PI * 2; }}
              >
                360°
              </button>
              <button
                id="turnR"
                type="button"
                aria-label="Turn right 90°"
                onClick={() => { touched(); yawQueueRef.current += Math.PI / 2; }}
              >
                <svg className="ico" width="16" height="16"><use href="#i-cw" /></svg>
              </button>
            </div>

            <div className="scale" id="scale">{currentDino.scale}</div>
            <p className="caption" id="caption">{currentDino.caption}</p>
          </div>
        </section>

        {/* 4.3 Right */}
        <section className="info">
          <div className="top">
            <label className="search">
              <svg className="ico" width="15" height="15"><use href="#i-search" /></svg>
              <input
                type="search"
                placeholder="Search creatures, legends, or regions…"
                aria-label="Search"
                onChange={(e) => {
                  const q = e.target.value.toLowerCase().trim();
                  if (!q) return;
                  const match = DINOS.findIndex(d =>
                    d.name.toLowerCase().includes(q) ||
                    d.family.toLowerCase().includes(q) ||
                    d.tags.some(t => t.toLowerCase().includes(q)) ||
                    d.habitat.toLowerCase().includes(q)
                  );
                  if (match !== -1 && match !== activeIndex) {
                    selectCreature(match);
                  }
                }}
              />
            </label>
            <button className="iconbtn" type="button" aria-label="Notifications">
              <svg className="ico"><use href="#i-bell" /></svg>
            </button>
            <button className="iconbtn" type="button" aria-label="Account">
              <span className="avatar">
                <svg className="ico" width="15" height="15" strokeWidth="1.8"><use href="#i-user" /></svg>
              </span>
            </button>
          </div>

          <div className="card" ref={cardRef}>
            <article className={`detail ${isLeaving ? 'leaving' : ''}`} id="detail" aria-live="polite">
              <div className="eyebrow" style={{ '--i': 0 }}>
                {currentDino.family} · Specimen {currentDino.no}
              </div>
              <h1 style={{ '--i': 1 }}>
                {currentDino.name}
                <em>{currentDino.latin}</em>
              </h1>
              <div className="tags" style={{ '--i': 2 }}>
                {currentDino.tags.map(t => (
                  <span key={t}>{t}</span>
                ))}
              </div>
              <p className="lede" style={{ '--i': 3 }}>
                {currentDino.lede}
              </p>
              <div className="era" style={{ '--i': 4 }}>
                <div className="bar">
                  <b />
                  <b />
                  <b />
                  <u
                    className={isLeft ? 'l' : ''}
                    style={{ left: `${pctFrom}%`, width: `${widthPct}%` }}
                    data-l={currentDino.eraLabel}
                  />
                </div>
                <div className="lab">
                  <span>Antiquity</span>
                  <span>Medieval</span>
                  <span>Modern</span>
                </div>
              </div>
              <h2 style={{ '--i': 5 }}>Field notes</h2>
              <dl className="traits" style={{ '--i': 6 }}>
                {currentDino.traits.map(([ico, dt, dd]) => (
                  <div className="trait-row" key={dt}>
                    <svg className="ico"><use href={`#${ico}`} /></svg>
                    <dt>{dt}</dt>
                    <dd>{dd}</dd>
                  </div>
                ))}
              </dl>
              <h2 style={{ '--i': 7 }}>Haunts</h2>
              <div className="habitat" style={{ '--i': 8 }}>
                <svg className="ico"><use href="#t-reed" /></svg>
                <span>{currentDino.habitat}</span>
              </div>
              <div className="closeup-wrap" style={{ '--i': 9 }}>
                <button
                  className="closeup"
                  id="closeup"
                  aria-pressed={zoomGoal > 2.2}
                  type="button"
                  onClick={handleCloseupToggle}
                >
                  <span
                    className="lens"
                    style={{
                      backgroundImage: `url('${currentDino.image}')`,
                      backgroundPosition: currentDino.lens
                    }}
                  />
                  <span className="closeup-body">
                    <b>Close-up Detail</b>
                    <small>{currentDino.closeup}</small>
                  </span>
                  <svg className="ico chev"><use href="#i-chev" /></svg>
                </button>
              </div>
            </article>
          </div>
        </section>
      </main>
    </>
  );
}

