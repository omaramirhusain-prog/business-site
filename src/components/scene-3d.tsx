"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import {
  Environment,
  Float,
  MeshDistortMaterial,
  Sphere,
} from "@react-three/drei";
import { useReducedMotion } from "motion/react";
import { Suspense, useMemo, useRef } from "react";
import * as THREE from "three";
import { useSceneControls } from "@/components/scene-context";

function Blob({
  color,
  distort,
  speed,
  floatIntensity,
  reducedMotion,
}: {
  color: string;
  distort: number;
  speed: number;
  floatIntensity: number;
  reducedMotion: boolean;
}) {
  return (
    <Float
      speed={reducedMotion ? 0 : speed}
      rotationIntensity={reducedMotion ? 0 : speed * 0.8}
      floatIntensity={reducedMotion ? 0 : floatIntensity}
    >
      <Sphere args={[1.28, 96, 96]}>
        <MeshDistortMaterial
          color={color}
          attach="material"
          distort={reducedMotion ? 0.12 : distort}
          speed={reducedMotion ? 0 : speed * 1.2}
          roughness={0.08}
          metalness={0.72}
          clearcoat={1}
          clearcoatRoughness={0.12}
        />
      </Sphere>
    </Float>
  );
}

function ParticleField() {
  const positions = useMemo(() => {
    const count = 80;
    const points = new Float32Array(count * 3);

    for (let index = 0; index < count; index += 1) {
      const radius = 2.1 + ((index * 37) % 100) / 48;
      const angle = index * 2.39996;
      const height = ((index * 53) % 100) / 20 - 2.5;
      points[index * 3] = Math.cos(angle) * radius;
      points[index * 3 + 1] = height;
      points[index * 3 + 2] = Math.sin(angle) * radius;
    }

    return points;
  }, []);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#b8f1ff"
        size={0.025}
        sizeAttenuation
        transparent
        opacity={0.72}
      />
    </points>
  );
}

const fragments = [
  [-2.25, 1.35, -0.8, 0.14],
  [2.15, 1.7, -0.4, 0.1],
  [-2.45, -1.2, 0.2, 0.09],
  [2.35, -1.45, -0.2, 0.15],
  [0.75, 2.2, -1.2, 0.08],
] as const;

function SceneContent({ reducedMotion }: { reducedMotion: boolean }) {
  const { controls } = useSceneControls();
  const rigRef = useRef<THREE.Group>(null);
  const ringsRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (!rigRef.current || !ringsRef.current || reducedMotion) return;

    const scroll = window.scrollY / Math.max(window.innerHeight, 1);
    const targetX = state.pointer.y * 0.2 + scroll * 0.22;
    const targetY = state.pointer.x * 0.3 + scroll * 0.45;

    rigRef.current.rotation.x = THREE.MathUtils.damp(
      rigRef.current.rotation.x,
      targetX,
      3.5,
      delta
    );
    rigRef.current.rotation.y = THREE.MathUtils.damp(
      rigRef.current.rotation.y,
      targetY,
      3.5,
      delta
    );
    ringsRef.current.rotation.z += delta * controls.spinSpeed * 0.08;
    ringsRef.current.rotation.y -= delta * controls.spinSpeed * 0.05;
  });

  return (
    <>
      <ambientLight intensity={0.45} />
      <directionalLight position={[3, 3, 3]} intensity={2.8} color="#21d4fd" />
      <directionalLight
        position={[-3, -2, -2]}
        intensity={1.8}
        color={controls.color}
      />
      <pointLight position={[0, 0, 2.4]} intensity={7} color="#ffffff" />

      <group ref={rigRef}>
        <Blob
          color={controls.color}
          distort={controls.distort}
          speed={controls.spinSpeed}
          floatIntensity={controls.floatIntensity}
          reducedMotion={reducedMotion}
        />

        <group ref={ringsRef} rotation={[0.8, 0.2, 0.15]}>
          <mesh>
            <torusGeometry args={[1.78, 0.012, 12, 180]} />
            <meshBasicMaterial color="#21d4fd" transparent opacity={0.55} />
          </mesh>
          <mesh rotation={[1.1, 0.35, 0.5]}>
            <torusGeometry args={[2.08, 0.008, 10, 180]} />
            <meshBasicMaterial color={controls.color} transparent opacity={0.38} />
          </mesh>
        </group>

        {fragments.map(([x, y, z, scale], index) => (
          <Float
            key={`${x}-${y}`}
            speed={reducedMotion ? 0 : 1 + index * 0.12}
            rotationIntensity={reducedMotion ? 0 : 1.4}
            floatIntensity={reducedMotion ? 0 : 1.2}
          >
            <mesh position={[x, y, z]} scale={scale}>
              <icosahedronGeometry args={[1, 0]} />
              <meshStandardMaterial
                color={index % 2 ? "#21d4fd" : controls.color}
                metalness={0.8}
                roughness={0.2}
                transparent
                opacity={0.78}
              />
            </mesh>
          </Float>
        ))}

        <ParticleField />
      </group>
      <Environment preset="city" />
    </>
  );
}

export default function Scene3D() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <Canvas
      camera={{ position: [0, 0, 4.2], fov: 45 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      aria-label="Interactive 3D hero scene"
    >
      <Suspense fallback={null}>
        <SceneContent reducedMotion={Boolean(prefersReducedMotion)} />
      </Suspense>
    </Canvas>
  );
}
