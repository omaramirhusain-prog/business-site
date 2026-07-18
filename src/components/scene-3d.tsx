"use client";

import { Environment, Float, RoundedBox } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import type { MotionValue } from "motion/react";
import { Suspense, useRef } from "react";
import type { Group, Mesh, MeshStandardMaterial } from "three";
import { MathUtils } from "three";

type Scene3DProps = {
  progress?: MotionValue<number>;
  processMode?: boolean;
};

const wheelPositions: [number, number, number][] = [
  [-1.05, -0.42, 0.72],
  [1.05, -0.42, 0.72],
  [-1.05, -0.42, -0.72],
  [1.05, -0.42, -0.72],
];

const foamPositions: [number, number, number, number][] = [
  [-1.15, 0.1, 0.62, 0.22],
  [-0.75, 0.48, 0.58, 0.18],
  [-0.25, 0.82, 0.5, 0.2],
  [0.3, 0.9, 0.48, 0.16],
  [0.85, 0.45, 0.62, 0.23],
  [1.25, 0.06, 0.58, 0.16],
  [-0.9, 0.05, -0.62, 0.18],
  [0.1, 0.75, -0.54, 0.2],
  [0.95, 0.2, -0.62, 0.2],
];

function Wheel({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh rotation={[0, Math.PI / 2, 0]}>
        <torusGeometry args={[0.34, 0.13, 16, 36]} />
        <meshStandardMaterial color="#090b0c" roughness={0.75} />
      </mesh>
      <mesh rotation={[0, Math.PI / 2, 0]}>
        <cylinderGeometry args={[0.22, 0.22, 0.08, 24]} />
        <meshStandardMaterial color="#aeb8bd" metalness={0.92} roughness={0.2} />
      </mesh>
      <mesh rotation={[0, Math.PI / 2, 0]}>
        <cylinderGeometry args={[0.07, 0.07, 0.09, 18]} />
        <meshStandardMaterial color="#d9ff55" metalness={0.4} roughness={0.25} />
      </mesh>
    </group>
  );
}

function Car({
  progress,
  processMode = false,
}: Scene3DProps) {
  const car = useRef<Group>(null);
  const wheels = useRef<Group>(null);
  const foam = useRef<Group>(null);
  const foamMaterial = useRef<MeshStandardMaterial>(null);
  const shine = useRef<Mesh>(null);

  useFrame(({ clock }, delta) => {
    if (!car.current || !wheels.current || !foam.current || !shine.current) return;

    const p = progress?.get() ?? 0;
    const targetRotation = processMode
      ? -0.42 + p * Math.PI * 1.9
      : -0.45 + Math.sin(clock.elapsedTime * 0.35) * 0.12;
    car.current.rotation.y = MathUtils.damp(
      car.current.rotation.y,
      targetRotation,
      4,
      delta
    );
    car.current.position.y = processMode
      ? Math.sin(p * Math.PI * 4) * 0.06
      : Math.sin(clock.elapsedTime * 1.1) * 0.08;
    car.current.position.x = processMode
      ? Math.sin(p * Math.PI * 2) * 0.22
      : 0;

    wheels.current.children.forEach((wheel) => {
      wheel.rotation.z = processMode
        ? -p * Math.PI * 18
        : -clock.elapsedTime * 0.5;
    });

    const washPulse = processMode
      ? Math.max(0, 1 - Math.abs(p - 0.34) * 7)
      : 0;
    foam.current.scale.setScalar(MathUtils.damp(foam.current.scale.x, washPulse, 5, delta));
    if (foamMaterial.current) foamMaterial.current.opacity = washPulse * 0.9;

    const shinePulse = processMode
      ? Math.max(0, 1 - Math.abs(p - 0.84) * 5)
      : 0.25;
    shine.current.scale.setScalar(0.65 + shinePulse * 1.35);
    shine.current.rotation.z = clock.elapsedTime * 0.5;
  });

  return (
    <group ref={car} rotation={[0.02, -0.45, 0]}>
      <group ref={wheels}>
        {wheelPositions.map((position) => (
          <Wheel key={position.join("-")} position={position} />
        ))}
      </group>

      <RoundedBox args={[3.1, 0.58, 1.34]} radius={0.2} smoothness={6}>
        <meshPhysicalMaterial
          color="#c7d2d0"
          metalness={0.72}
          roughness={0.16}
          clearcoat={1}
          clearcoatRoughness={0.08}
        />
      </RoundedBox>
      <RoundedBox
        args={[1.7, 0.72, 1.16]}
        radius={0.22}
        smoothness={6}
        position={[0.18, 0.56, 0]}
      >
        <meshPhysicalMaterial
          color="#18262b"
          metalness={0.65}
          roughness={0.12}
          transmission={0.12}
        />
      </RoundedBox>
      <mesh position={[-0.72, 0.55, 0.59]} rotation={[0, 0, -0.18]}>
        <planeGeometry args={[0.82, 0.45]} />
        <meshStandardMaterial color="#5d7a83" metalness={0.7} roughness={0.12} />
      </mesh>
      <mesh position={[0.71, 0.55, 0.59]} rotation={[0, 0, 0.16]}>
        <planeGeometry args={[0.72, 0.45]} />
        <meshStandardMaterial color="#5d7a83" metalness={0.7} roughness={0.12} />
      </mesh>
      <mesh position={[-1.56, 0.02, 0.43]}>
        <boxGeometry args={[0.06, 0.18, 0.34]} />
        <meshStandardMaterial color="#f7ffcf" emissive="#eaff87" emissiveIntensity={3} />
      </mesh>
      <mesh position={[1.56, 0.02, 0.43]}>
        <boxGeometry args={[0.06, 0.2, 0.32]} />
        <meshStandardMaterial color="#ff4a32" emissive="#ff2b20" emissiveIntensity={2} />
      </mesh>
      <mesh position={[-0.15, 0.28, 0.681]}>
        <boxGeometry args={[0.7, 0.018, 0.018]} />
        <meshStandardMaterial color="#d9ff55" emissive="#baff2f" emissiveIntensity={1.8} />
      </mesh>

      <group ref={foam} scale={0}>
        {foamPositions.map(([x, y, z, size], index) => (
          <mesh key={`${x}-${z}`} position={[x, y, z]}>
            <sphereGeometry args={[size, 18, 18]} />
            <meshStandardMaterial
              ref={index === 0 ? foamMaterial : undefined}
              color="#d8faff"
              transparent
              opacity={0.9}
              roughness={0.25}
            />
          </mesh>
        ))}
      </group>

      <mesh ref={shine} position={[-0.35, 1.25, 0.72]}>
        <octahedronGeometry args={[0.16, 0]} />
        <meshBasicMaterial color="#ecff98" transparent opacity={0.9} />
      </mesh>
    </group>
  );
}

function SceneContent(props: Scene3DProps) {
  return (
    <>
      <ambientLight intensity={0.9} />
      <directionalLight position={[4, 6, 3]} intensity={4} color="#f1ffd0" />
      <directionalLight position={[-4, 2, -4]} intensity={3} color="#72d7ff" />
      <spotLight
        position={[0, 6, 0]}
        angle={0.55}
        penumbra={0.8}
        intensity={5}
        color="#ffffff"
      />
      <Float
        speed={props.processMode ? 0 : 1.4}
        rotationIntensity={props.processMode ? 0 : 0.08}
        floatIntensity={props.processMode ? 0 : 0.18}
      >
        <Car {...props} />
      </Float>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.76, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#080c0e" metalness={0.45} roughness={0.3} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.745, 0]}>
        <ringGeometry args={[2.1, 2.14, 96]} />
        <meshBasicMaterial color="#bfff42" transparent opacity={0.35} />
      </mesh>
      <Environment preset="city" />
    </>
  );
}

export default function Scene3D(props: Scene3DProps) {
  return (
    <Canvas
      camera={{ position: [4.5, 2.5, 5.5], fov: 42 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      aria-label={
        props.processMode
          ? "A 3D car transforming through the detailing process as you scroll"
          : "A polished 3D sports car"
      }
    >
      <Suspense fallback={null}>
        <SceneContent {...props} />
      </Suspense>
    </Canvas>
  );
}
