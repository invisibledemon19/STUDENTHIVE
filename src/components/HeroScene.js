'use client';
import { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, MeshDistortMaterial, MeshWobbleMaterial } from '@react-three/drei';
import * as THREE from 'three';

/* ── Particle Field with slow drift ── */
function ParticleField({ count = 600 }) {
  const mesh = useRef();
  const [positions] = useState(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 24;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 24;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 24;
    }
    return arr;
  });

  const [colors] = useState(() => {
    const arr = new Float32Array(count * 3);
    const amber = new THREE.Color('#FFC107');
    const indigo = new THREE.Color('#5C6BC0');
    const white = new THREE.Color('#FFFFFF');
    for (let i = 0; i < count; i++) {
      const r = Math.random();
      const c = r > 0.6 ? amber : r > 0.3 ? indigo : white;
      arr[i * 3] = c.r;
      arr[i * 3 + 1] = c.g;
      arr[i * 3 + 2] = c.b;
    }
    return arr;
  });

  useFrame(({ clock }) => {
    if (mesh.current) {
      mesh.current.rotation.y = clock.getElapsedTime() * 0.02;
      mesh.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.015) * 0.08;
    }
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-color" count={count} array={colors} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.035} vertexColors transparent opacity={0.65} sizeAttenuation />
    </points>
  );
}

/* ── Main hero sphere with distort ── */
function HiveSphere() {
  const mesh = useRef();
  useFrame(({ clock }) => {
    if (mesh.current) {
      mesh.current.rotation.y = clock.getElapsedTime() * 0.12;
      mesh.current.rotation.z = Math.sin(clock.getElapsedTime() * 0.08) * 0.12;
    }
  });
  return (
    <Float speed={1.8} rotationIntensity={0.2} floatIntensity={0.4}>
      <mesh ref={mesh} position={[2.8, 0.2, 0]}>
        <icosahedronGeometry args={[1.8, 2]} />
        <MeshDistortMaterial
          color="#FFC107"
          emissive="#FF8F00"
          emissiveIntensity={0.12}
          roughness={0.25}
          metalness={0.85}
          wireframe
          distort={0.12}
          speed={1.5}
        />
      </mesh>
    </Float>
  );
}

/* ── Floating rings ── */
function FloatingRings() {
  const mesh1 = useRef();
  const mesh2 = useRef();

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (mesh1.current) {
      mesh1.current.rotation.x = t * 0.18;
      mesh1.current.rotation.z = t * 0.08;
    }
    if (mesh2.current) {
      mesh2.current.rotation.y = t * 0.15;
      mesh2.current.rotation.x = t * 0.1;
    }
  });

  return (
    <>
      <Float speed={1.2} rotationIntensity={0.4} floatIntensity={0.6}>
        <mesh ref={mesh1} position={[-3.2, 0.5, -1]}>
          <torusGeometry args={[1.3, 0.03, 16, 64]} />
          <MeshWobbleMaterial
            color="#5C6BC0"
            emissive="#1A237E"
            emissiveIntensity={0.5}
            roughness={0.15}
            metalness={0.95}
            factor={0.2}
            speed={0.8}
          />
        </mesh>
      </Float>
      <Float speed={0.8} rotationIntensity={0.3} floatIntensity={0.4}>
        <mesh ref={mesh2} position={[-1.5, -2, 1]}>
          <torusGeometry args={[0.8, 0.02, 16, 48]} />
          <meshStandardMaterial
            color="#FFA000"
            emissive="#FF6F00"
            emissiveIntensity={0.3}
            roughness={0.2}
            metalness={0.9}
            transparent
            opacity={0.7}
          />
        </mesh>
      </Float>
    </>
  );
}

/* ── Orbiting small spheres ── */
function SmallOrbs() {
  const group = useRef();
  const orbData = useMemo(() => [
    { pos: [-1.2, 2.2, 1], size: 0.08, color: '#FFC107', emissive: '#FF8F00' },
    { pos: [3.5, -1.8, 0.5], size: 0.1, color: '#5C6BC0', emissive: '#3F51B5' },
    { pos: [-2.8, -1.2, 2], size: 0.06, color: '#FFC107', emissive: '#FFA000' },
    { pos: [1.2, 1.8, -2], size: 0.09, color: '#7986CB', emissive: '#5C6BC0' },
    { pos: [0.5, -2.5, 1.5], size: 0.07, color: '#FFD54F', emissive: '#FFB300' },
    { pos: [-0.5, 3, -0.5], size: 0.05, color: '#9FA8DA', emissive: '#3949AB' },
    { pos: [2, 2, -1], size: 0.04, color: '#FFCA28', emissive: '#FF8F00' },
  ], []);

  useFrame(({ clock }) => {
    if (group.current) group.current.rotation.y = clock.getElapsedTime() * 0.03;
  });

  return (
    <group ref={group}>
      {orbData.map((orb, i) => (
        <Float key={i} speed={1 + i * 0.2} floatIntensity={0.6}>
          <mesh position={orb.pos}>
            <sphereGeometry args={[orb.size, 16, 16]} />
            <meshStandardMaterial
              color={orb.color}
              emissive={orb.emissive}
              emissiveIntensity={0.8}
            />
          </mesh>
        </Float>
      ))}
    </group>
  );
}

/* ── Connecting lines between orbs ── */
function ConnectionLines() {
  const ref = useRef();

  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.y = clock.getElapsedTime() * 0.01;
      ref.current.material.opacity = 0.08 + Math.sin(clock.getElapsedTime() * 0.5) * 0.04;
    }
  });

  const linePositions = useMemo(() => {
    const points = [
      [-1.2, 2.2, 1], [3.5, -1.8, 0.5],
      [3.5, -1.8, 0.5], [-2.8, -1.2, 2],
      [-2.8, -1.2, 2], [1.2, 1.8, -2],
      [1.2, 1.8, -2], [-1.2, 2.2, 1],
    ];
    return new Float32Array(points.flat());
  }, []);

  return (
    <lineSegments ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={8} array={linePositions} itemSize={3} />
      </bufferGeometry>
      <lineBasicMaterial color="#5C6BC0" transparent opacity={0.1} />
    </lineSegments>
  );
}

/* ── Mouse reactive light ── */
function MouseLight() {
  const light = useRef();
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMove = (e) => {
      mouse.current.x = (e.clientX / window.innerWidth - 0.5) * 10;
      mouse.current.y = -(e.clientY / window.innerHeight - 0.5) * 6;
    };
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);

  useFrame(() => {
    if (light.current) {
      light.current.position.x += (mouse.current.x - light.current.position.x) * 0.02;
      light.current.position.y += (mouse.current.y - light.current.position.y) * 0.02;
    }
  });

  return <pointLight ref={light} position={[0, 0, 4]} intensity={0.4} color="#FFC107" distance={15} />;
}

export default function HeroScene() {
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
      <Canvas
        camera={{ position: [0, 0, 7], fov: 55 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
        dpr={[1, 1.5]}
      >
        <ambientLight intensity={0.25} />
        <pointLight position={[6, 5, 5]} intensity={0.4} color="#FFC107" />
        <pointLight position={[-6, -4, 3]} intensity={0.25} color="#3F51B5" />
        <directionalLight position={[0, 5, 5]} intensity={0.3} />
        <MouseLight />
        <ParticleField />
        <HiveSphere />
        <FloatingRings />
        <SmallOrbs />
        <ConnectionLines />
      </Canvas>
    </div>
  );
}
