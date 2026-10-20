import { Canvas, useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

const ORANGE = '#FF6A2B';
const reduceMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Bandung-ish: lat -6.9, lon 107.6
const LAT = (-6.9 * Math.PI) / 180;
const LON = (107.6 * Math.PI) / 180;
const R = 1.6;

const toVec = (lat: number, lon: number, r: number) =>
    new THREE.Vector3(r * Math.cos(lat) * Math.sin(lon), r * Math.sin(lat), r * Math.cos(lat) * Math.cos(lon));

/** Dotted globe that sweeps back and forth around a glowing marker; tilts toward the pointer and spins faster when dragged over. */
function Globe() {
    const group = useRef<THREE.Group>(null);
    const pulse = useRef<THREE.Mesh>(null);

    const positions = useMemo(() => {
        const count = 1400;
        const arr = new Float32Array(count * 3);
        const golden = Math.PI * (3 - Math.sqrt(5));
        for (let i = 0; i < count; i++) {
            const y = 1 - (i / (count - 1)) * 2;
            const radius = Math.sqrt(1 - y * y);
            const theta = golden * i;
            arr[i * 3] = Math.cos(theta) * radius * R;
            arr[i * 3 + 1] = y * R;
            arr[i * 3 + 2] = Math.sin(theta) * radius * R;
        }
        return arr;
    }, []);

    const marker = useMemo(() => toVec(LAT, LON, R * 1.01), []);

    useFrame((state, delta) => {
        if (!group.current) return;
        const t = reduceMotion ? 0 : state.clock.elapsedTime;
        const { x, y } = state.pointer;
        group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, -LON + Math.sin(t * 0.35) * 1.0 + x * 0.5, 3, delta);
        group.current.rotation.x = THREE.MathUtils.damp(group.current.rotation.x, -y * 0.3 - LAT * 0.6, 3, delta);
        if (pulse.current) {
            const k = (t * 0.8) % 1;
            pulse.current.scale.setScalar(1 + k * 3);
            (pulse.current.material as THREE.MeshBasicMaterial).opacity = (1 - k) * 0.7;
        }
    });

    return (
        <group ref={group}>
            <points>
                <bufferGeometry>
                    <bufferAttribute attach="attributes-position" args={[positions, 3]} />
                </bufferGeometry>
                <pointsMaterial size={0.035} color="#C9C3FF" sizeAttenuation transparent opacity={0.85} />
            </points>
            <mesh>
                <sphereGeometry args={[R * 0.985, 32, 32]} />
                <meshBasicMaterial color="#0D0D0F" transparent opacity={0.85} />
            </mesh>
            <group position={marker} onUpdate={(g) => g.lookAt(marker.clone().multiplyScalar(2))}>
                <mesh>
                    <sphereGeometry args={[0.07, 16, 16]} />
                    <meshBasicMaterial color={ORANGE} />
                </mesh>
                <mesh ref={pulse}>
                    <ringGeometry args={[0.08, 0.1, 32]} />
                    <meshBasicMaterial color={ORANGE} transparent side={THREE.DoubleSide} />
                </mesh>
            </group>
        </group>
    );
}

export default function GlobeScene() {
    return (
        <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 5.2], fov: 38 }} gl={{ antialias: true, alpha: true }} aria-hidden="true">
            <Globe />
        </Canvas>
    );
}
