"use client";

import { Canvas } from "@react-three/fiber";
import {
  Float,
  MeshDistortMaterial,
  Environment,
  Sphere,
} from "@react-three/drei";
import { Suspense } from "react";
import { useSceneControls } from "@/components/scene-context";

function Blob({
  color,
  distort,
  speed,
  floatIntensity,
}: {
  color: string;
  distort: number;
  speed: number;
  floatIntensity: number;
}) {
  return (
    <Float
      speed={speed}
      rotationIntensity={speed * 0.8}
      floatIntensity={floatIntensity}
    >
      <Sphere args={[1.35, 128, 128]}>
        <MeshDistortMaterial
          color={color}
          attach="material"
          distort={distort}
          speed={speed * 1.2}
          roughness={0.12}
          metalness={0.65}
        />
      </Sphere>
    </Float>
  );
}

function SceneContent() {
  const { controls } = useSceneControls();
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 3, 3]} intensity={2.2} color="#21d4fd" />
      <directionalLight
        position={[-3, -2, -2]}
        intensity={1.4}
        color={controls.color}
      />
      <Blob
        color={controls.color}
        distort={controls.distort}
        speed={controls.spinSpeed}
        floatIntensity={controls.floatIntensity}
      />
      <Environment preset="city" />
    </>
  );
}

export default function Scene3D() {
  return (
    <Canvas
      camera={{ position: [0, 0, 4.2], fov: 45 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      aria-label="Interactive 3D hero scene"
    >
      <Suspense fallback={null}>
        <SceneContent />
      </Suspense>
    </Canvas>
  );
}
