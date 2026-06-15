"use client";

import { Canvas } from "@react-three/fiber";
import {
  Float,
  MeshDistortMaterial,
  Environment,
  Sphere,
} from "@react-three/drei";
import { Suspense } from "react";

function Blob() {
  return (
    <Float speed={1.4} rotationIntensity={1.1} floatIntensity={1.6}>
      <Sphere args={[1.35, 128, 128]}>
        <MeshDistortMaterial
          color="#7c5cff"
          attach="material"
          distort={0.45}
          speed={1.8}
          roughness={0.12}
          metalness={0.65}
        />
      </Sphere>
    </Float>
  );
}

export default function Scene3D() {
  return (
    <Canvas
      camera={{ position: [0, 0, 4.2], fov: 45 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
    >
      <Suspense fallback={null}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[3, 3, 3]} intensity={2.2} color="#21d4fd" />
        <directionalLight
          position={[-3, -2, -2]}
          intensity={1.4}
          color="#7c5cff"
        />
        <Blob />
        <Environment preset="city" />
      </Suspense>
    </Canvas>
  );
}
