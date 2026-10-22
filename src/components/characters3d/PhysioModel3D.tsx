import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import type { JointRotationAxis, ExercisePosition, JointAngleConfig } from '../../types/character.types';
import { getExercisePreset } from '../../data/exercisePresets';

export interface PhysioModel3DProps {
  jointAngles?: Partial<Record<string, number>>;
  /** Mapa de articulaciones y su eje de movimiento 3D. */
  jointAxes?: Partial<Record<string, JointRotationAxis>>;
  statusColor?: string;
  autoAnimate?: boolean;
  className?: string;
  /** Posición corporal del ejercicio. Por defecto 'pie' (de pie). */
  position?: ExercisePosition;
  /** Nombre del ejercicio: la animación automática se deriva de su preset clínico. */
  exerciseName?: string;
  /** Articulación principal ('hombro' | 'codo' | 'rodilla' | 'cadera' | 'tobillo' | 'cervical'). */
  articulacion?: string;
}

const JOINT_LIMITS: Record<string, { min: number; max: number }> = {
  cabeza: { min: -45, max: 45 },
  cuello: { min: -45, max: 45 },
  hombro_izquierdo: { min: -180, max: 180 },
  hombro_derecho: { min: -180, max: 180 },
  codo_izquierdo: { min: -150, max: 0 },
  codo_derecho: { min: -150, max: 0 },
  muñeca_izquierda: { min: -80, max: 80 },
  muñeca_derecha: { min: -80, max: 80 },
  cadera_izquierda: { min: -120, max: 120 },
  cadera_derecha: { min: -120, max: 120 },
  rodilla_izquierda: { min: 0, max: 135 },
  rodilla_derecha: { min: 0, max: 135 },
  tobillo_izquierdo: { min: -40, max: 30 },
  tobillo_derecho: { min: -40, max: 30 },
};

const clampAngle = (joint: string, deg: number): number => {
  const limit = JOINT_LIMITS[joint];
  if (!limit) return deg;
  return Math.max(limit.min, Math.min(limit.max, deg));
};

/**
 * Las extremidades cuelgan del pivote en -Y, por lo que una flexión anatómica
 * positiva (muslo/brazo hacia adelante, +Z) exige rotación NEGATIVA en X.
 * Sin esto la sentadilla y la elevación de brazo se mostraban al revés.
 */
const FLEXION_FORWARD_JOINTS = ['codo_', 'cadera_', 'hombro_'];

const toSignedRotation = (joint: string, deg: number, axis: JointRotationAxis): number => {
  const clamped = clampAngle(joint, deg);
  let rad = THREE.MathUtils.degToRad(clamped);
  if (axis === 'x' && deg > 0 && FLEXION_FORWARD_JOINTS.some((p) => joint.startsWith(p))) {
    rad = -rad;
  }
  // Abducción (eje Z): el lado derecho del paciente se dibuja en -X.
  if (axis === 'z' && (joint.includes('derecho') || joint.includes('derecha'))) {
    rad = -rad;
  }
  return rad;
};

const POSITION_TARGETS: Record<ExercisePosition, { rotX: number; rotY: number; rotZ: number; posY: number }> = {
  pie: { rotX: 0, rotY: 0, rotZ: 0, posY: 0 },
  sentado: { rotX: 0, rotY: 0, rotZ: 0, posY: -0.18 },
  acostado: { rotX: -Math.PI / 2, rotY: 0, rotZ: 0, posY: -0.55 },
  decubito_lateral: { rotX: 0, rotY: 0, rotZ: Math.PI / 2, posY: -0.55 },
};

export const PhysioModel3D: React.FC<PhysioModel3DProps> = ({
  jointAngles = {},
  jointAxes = {},
  statusColor,
  autoAnimate = false,
  className = 'w-full h-full min-h-[320px]',
  position = 'pie',
  exerciseName,
  articulacion,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const jointsRef = useRef<Record<string, THREE.Group>>({});
  const statusMeshesRef = useRef<THREE.Mesh[]>([]);
  const anglesRef = useRef(jointAngles);
  const axesRef = useRef(jointAxes);
  const statusColorRef = useRef(statusColor);
  const autoAnimateRef = useRef(autoAnimate);
  const positionRef = useRef(position);
  const animJointsRef = useRef<JointAngleConfig[]>([]);
  const poseRef = useRef({ rotX: 0, rotY: 0, rotZ: 0, posY: 0 });
  const poseGroupRef = useRef<THREE.Group | null>(null);
  const lastElapsedRef = useRef(0);

  useEffect(() => {
    anglesRef.current = jointAngles;
    axesRef.current = jointAxes;
    statusColorRef.current = statusColor;
    autoAnimateRef.current = autoAnimate;
    positionRef.current = position;
    const preset = getExercisePreset(exerciseName ?? '', articulacion);
    animJointsRef.current = preset.targetJoints;
  }, [jointAngles, jointAxes, statusColor, autoAnimate, position, exerciseName, articulacion]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const width = container.clientWidth || 300;
    const height = container.clientHeight || 400;
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 1.45, 4.4);
    camera.lookAt(0, 1.15, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.85));
    const mainLight = new THREE.DirectionalLight(0xfffaed, 0.85);
    mainLight.position.set(4, 8, 5);
    mainLight.castShadow = true;
    scene.add(mainLight);
    const fillLight = new THREE.DirectionalLight(0x90b5d8, 0.35);
    fillLight.position.set(-4, 4, -3);
    scene.add(fillLight);

    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(8, 8),
      new THREE.ShadowMaterial({ opacity: 0.14 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    const matSkin = new THREE.MeshLambertMaterial({ color: 0xFEDBC5 });
    const matHair = new THREE.MeshLambertMaterial({ color: 0x613626 });
    const matScrub = new THREE.MeshLambertMaterial({ color: 0x206E54 });
    const matPants = new THREE.MeshLambertMaterial({ color: 0x134E39 });
    const matBadge = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
    const matShoe = new THREE.MeshLambertMaterial({ color: 0x1E293B });
    const matEyes = new THREE.MeshBasicMaterial({ color: 0x24150E });
    const matJointPivot = new THREE.MeshStandardMaterial({ color: 0x2C6351, roughness: 0.35, metalness: 0.4 });

    const joints: Record<string, THREE.Group> = {};
    const statusMeshes: THREE.Mesh[] = [];

    const createPivotMesh = (r = 0.045) => {
      const pivotGroup = new THREE.Group();
      const mesh = new THREE.Mesh(new THREE.SphereGeometry(r, 16, 16), matJointPivot);
      mesh.castShadow = true;
      pivotGroup.add(mesh);
      const statusIndicator = new THREE.Mesh(
        new THREE.SphereGeometry(r * 1.5, 14, 14),
        new THREE.MeshBasicMaterial({ color: 0x10B981, transparent: true, opacity: 0, wireframe: true })
      );
      pivotGroup.add(statusIndicator);
      statusMeshes.push(statusIndicator);
      return pivotGroup;
    };

    const orbitGroup = new THREE.Group();
    scene.add(orbitGroup);

    let targetRotY = 0;
    let targetRotX = 0;
    let isDragging = false;
    let startX = 0;
    let startY = 0;

    const onPointerDown = (e: PointerEvent) => {
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      container.setPointerCapture(e.pointerId);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      startX = e.clientX;
      startY = e.clientY;
      targetRotY += dx * 0.01;
      targetRotX = Math.max(-0.4, Math.min(0.6, targetRotX + dy * 0.006));
    };

    const onPointerUp = (e: PointerEvent) => {
      isDragging = false;
      try {
        container.releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
    };

    container.addEventListener('pointerdown', onPointerDown);
    container.addEventListener('pointermove', onPointerMove);
    container.addEventListener('pointerup', onPointerUp);
    container.addEventListener('pointercancel', onPointerUp);

    const poseGroup = new THREE.Group();
    orbitGroup.add(poseGroup);
    poseGroupRef.current = poseGroup;

    const pelvis = new THREE.Group();
    pelvis.position.set(0, 1.15, 0);
    poseGroup.add(pelvis);
    joints['tronco_pelvis'] = pelvis;
    const pMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.17, 0.15, 16), matPants);
    pMesh.castShadow = true;
    pelvis.add(pMesh);

    const abdomen = new THREE.Group();
    abdomen.position.set(0, 0.11, 0);
    pelvis.add(abdomen);
    joints['tronco_abdomen'] = abdomen;
    const abMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.21, 0.19, 0.17, 16), matScrub);
    abMesh.position.y = 0.085;
    abMesh.castShadow = true;
    abdomen.add(abMesh);

    const torax = new THREE.Group();
    torax.position.set(0, 0.17, 0);
    abdomen.add(torax);
    joints['tronco_torax'] = torax;
    const txMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.21, 0.25, 16), matScrub);
    txMesh.position.y = 0.125;
    txMesh.castShadow = true;
    torax.add(txMesh);
    const badge = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.08, 0.01), matBadge);
    badge.position.set(0.11, 0.15, 0.22);
    torax.add(badge);

    const cuello = new THREE.Group();
    cuello.position.set(0, 0.25, 0);
    torax.add(cuello);
    joints['cuello'] = cuello;

    const cabeza = new THREE.Group();
    cabeza.position.set(0, 0.08, 0);
    cuello.add(cabeza);
    joints['cabeza'] = cabeza;
    const headMesh = new THREE.Mesh(new THREE.SphereGeometry(0.2, 24, 24), matSkin);
    headMesh.position.y = 0.17;
    headMesh.castShadow = true;
    cabeza.add(headMesh);
    const hairCap = new THREE.Mesh(new THREE.SphereGeometry(0.218, 16, 16), matHair);
    hairCap.position.set(0, 0.2, -0.03);
    cabeza.add(hairCap);

    const curlsCoords: [number, number, number][] = [
      [-0.12, 0.31, 0.08], [0, 0.35, 0.1], [0.12, 0.31, 0.08],
      [-0.15, 0.25, 0.12], [0.15, 0.25, 0.12], [-0.08, 0.36, 0.02],
      [0.08, 0.36, 0.02], [-0.17, 0.18, 0.04], [0.17, 0.18, 0.04],
    ];
    curlsCoords.forEach(([x, y, z]) => {
      const curl = new THREE.Mesh(new THREE.DodecahedronGeometry(0.075), matHair);
      curl.position.set(x, y, z);
      cabeza.add(curl);
    });

    const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.017, 12, 12), matEyes);
    eyeL.position.set(-0.065, 0.17, 0.185);
    const eyeR = eyeL.clone();
    eyeR.position.x = 0.065;
    cabeza.add(eyeL, eyeR);

    const addArm = (side: number) => {
      const p = side === 1 ? 'izquierdo' : 'derecho';
      const sp = side === 1 ? 'izquierda' : 'derecha';
      const sh = new THREE.Group();
      sh.position.set(side * 0.28, 0.22, 0);
      torax.add(sh);
      sh.add(createPivotMesh(0.048));
      joints[`hombro_${p}`] = sh;
      const arm = new THREE.Group();
      sh.add(arm);
      joints[`hueso_brazo_${p}`] = arm;
      const sleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.058, 0.052, 0.11, 14), matScrub);
      sleeve.position.y = -0.055;
      sleeve.castShadow = true;
      arm.add(sleeve);
      const skinArm = new THREE.Mesh(new THREE.CylinderGeometry(0.048, 0.042, 0.16, 14), matSkin);
      skinArm.position.y = -0.18;
      skinArm.castShadow = true;
      arm.add(skinArm);
      const el = new THREE.Group();
      el.position.set(0, -0.26, 0);
      arm.add(el);
      el.add(createPivotMesh(0.04));
      joints[`codo_${p}`] = el;
      const fa = new THREE.Group();
      el.add(fa);
      joints[`hueso_antebrazo_${p}`] = fa;
      const faMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.044, 0.036, 0.23, 14), matSkin);
      faMesh.position.y = -0.115;
      faMesh.castShadow = true;
      fa.add(faMesh);
      const wr = new THREE.Group();
      wr.position.set(0, -0.23, 0);
      fa.add(wr);
      wr.add(createPivotMesh(0.032));
      joints[`muñeca_${sp}`] = wr;
      const hand = new THREE.Group();
      wr.add(hand);
      joints[`mano_${sp}`] = hand;
      const hMesh = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.08, 0.03), matSkin);
      hMesh.position.y = -0.04;
      hMesh.castShadow = true;
      hand.add(hMesh);
    };
    addArm(1);
    addArm(-1);

    const addLeg = (side: number) => {
      const p = side === 1 ? 'izquierdo' : 'derecho';
      const sp = side === 1 ? 'izquierda' : 'derecha';
      const hp = new THREE.Group();
      hp.position.set(side * 0.12, -0.07, 0);
      pelvis.add(hp);
      hp.add(createPivotMesh(0.052));
      joints[`cadera_${sp}`] = hp;
      const th = new THREE.Group();
      hp.add(th);
      joints[`hueso_muslo_${p}`] = th;
      const thMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.065, 0.42, 16), matPants);
      thMesh.position.y = -0.21;
      thMesh.castShadow = true;
      th.add(thMesh);
      const kn = new THREE.Group();
      kn.position.set(0, -0.42, 0);
      th.add(kn);
      kn.add(createPivotMesh(0.046));
      joints[`rodilla_${sp}`] = kn;
      const shn = new THREE.Group();
      kn.add(shn);
      joints[`hueso_pantorrilla_${sp}`] = shn;
      const shnMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.052, 0.4, 16), matPants);
      shnMesh.position.y = -0.2;
      shnMesh.castShadow = true;
      shn.add(shnMesh);
      const ank = new THREE.Group();
      ank.position.set(0, -0.4, 0);
      shn.add(ank);
      ank.add(createPivotMesh(0.038));
      joints[`tobillo_${p}`] = ank;
      const ft = new THREE.Group();
      ank.add(ft);
      joints[`pie_${p}`] = ft;
      const ftMesh = new THREE.Mesh(new THREE.BoxGeometry(0.085, 0.055, 0.18), matShoe);
      ftMesh.position.set(0, -0.027, 0.04);
      ftMesh.castShadow = true;
      ft.add(ftMesh);
    };
    addLeg(1);
    addLeg(-1);

    jointsRef.current = joints;
    statusMeshesRef.current = statusMeshes;

    const clock = new THREE.Clock();
    let animationFrameId: number;

    const renderLoop = () => {
      animationFrameId = requestAnimationFrame(renderLoop);
      const currentAngles = anglesRef.current;
      const hasManualAngles = Object.keys(currentAngles).length > 0;
      const currentColor = statusColorRef.current;

      statusMeshes.forEach((mesh) => {
        const mat = mesh.material as THREE.MeshBasicMaterial;
        if (currentColor && hasManualAngles) {
          mat.color.setStyle(currentColor);
          mat.opacity = 0.45;
        } else {
          mat.opacity = 0;
        }
      });

      if (hasManualAngles) {
        const currentAxes = axesRef.current;
        Object.values(joints).forEach((grp) => {
          grp.rotation.set(0, 0, 0);
        });
        Object.entries(currentAngles).forEach(([jointName, degAngle]) => {
          if (joints[jointName] && typeof degAngle === 'number') {
            const axis: JointRotationAxis = currentAxes[jointName] ?? 'x';
            joints[jointName].rotation[axis] = toSignedRotation(jointName, degAngle, axis);
          }
        });
      } else if (autoAnimateRef.current) {
        // Ciclo clínico derivado del preset del ejercicio (sentadilla, hombro, codo…).
        // Oscila entre neutralAngle y targetAngle con easing coseno: nunca inventa rangos.
        const t = clock.getElapsedTime();
        const phase = (1 - Math.cos(t * 2.0)) / 2;
        Object.values(joints).forEach((grp) => {
          grp.rotation.set(0, 0, 0);
        });
        animJointsRef.current.forEach(({ joint, targetAngle, neutralAngle, axis }) => {
          const grp = joints[joint];
          if (!grp) return;
          const ax: JointRotationAxis = axis ?? 'x';
          const neutral = neutralAngle ?? 0;
          const deg = neutral + (targetAngle - neutral) * phase;
          grp.rotation[ax] = toSignedRotation(joint, deg, ax);
        });
      }

      // Posición corporal (de pie / sentado / acostado / decúbito lateral)
      const poseGroup = poseGroupRef.current;
      if (poseGroup) {
        const elapsed = clock.getElapsedTime();
        const delta = Math.min(0.05, Math.max(0, elapsed - lastElapsedRef.current));
        lastElapsedRef.current = elapsed;
        const target = POSITION_TARGETS[positionRef.current];
        const k = 1 - Math.pow(0.001, delta / 0.4);
        const pose = poseRef.current;
        pose.rotX += (target.rotX - pose.rotX) * k;
        pose.rotY += (target.rotY - pose.rotY) * k;
        pose.rotZ += (target.rotZ - pose.rotZ) * k;
        pose.posY += (target.posY - pose.posY) * k;
        poseGroup.rotation.set(pose.rotX, pose.rotY, pose.rotZ);
        poseGroup.position.y = pose.posY;
      }

      // Suavizado inercial de la rotación orbital
      orbitGroup.rotation.y += (targetRotY - orbitGroup.rotation.y) * 0.12;
      orbitGroup.rotation.x += (targetRotX - orbitGroup.rotation.x) * 0.12;

      renderer.render(scene, camera);
    };
    renderLoop();

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: newWidth, height: newHeight } = entry.contentRect;
        if (newWidth > 0 && newHeight > 0) {
          camera.aspect = newWidth / newHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(newWidth, newHeight);
        }
      }
    });
    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      container.removeEventListener('pointerdown', onPointerDown);
      container.removeEventListener('pointermove', onPointerMove);
      container.removeEventListener('pointerup', onPointerUp);
      container.removeEventListener('pointercancel', onPointerUp);
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
      renderer.dispose();
      poseGroupRef.current = null;
      scene.clear();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`cursor-grab active:cursor-grabbing touch-none select-none ${className}`}
      title="Arrastra para rotar la vista 3D en 360°"
    />
  );
};
