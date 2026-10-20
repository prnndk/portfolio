import { Canvas, useFrame } from '@react-three/fiber';
import { useMemo, useRef, useState } from 'react';
import * as THREE from 'three';

const ORANGE = '#FF6A2B';
const LILAC = '#C9C3FF';
const MINT = '#7CFFB2';
const SKIN = '#F2C9A5';
const HAIR = '#141418';
const SHIRT = '#1F1F24';

const reduceMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Low-poly 3D take on the mascot, built from primitives. Turns toward the pointer; click to make it hop. */
function MascotHead() {
    const root = useRef<THREE.Group>(null);
    const head = useRef<THREE.Group>(null);
    const hop = useRef(0);

    useFrame((state, delta) => {
        if (!root.current || !head.current) return;
        const { x, y } = state.pointer;
        head.current.rotation.y = THREE.MathUtils.damp(head.current.rotation.y, x * 0.6, 4, delta);
        head.current.rotation.x = THREE.MathUtils.damp(head.current.rotation.x, -y * 0.35, 4, delta);
        hop.current = Math.max(0, hop.current - delta * 2.2);
        const bob = reduceMotion ? 0 : Math.sin(state.clock.elapsedTime * 1.6) * 0.05;
        root.current.position.y = bob + Math.sin(hop.current * Math.PI) * 0.45;
    });

    const skin = <meshStandardMaterial color={SKIN} flatShading roughness={0.8} />;
    const hair = <meshStandardMaterial color={HAIR} flatShading roughness={0.6} />;

    return (
        <group
            ref={root}
            onClick={() => (hop.current = 1)}
            onPointerOver={() => (document.body.style.cursor = 'pointer')}
            onPointerOut={() => (document.body.style.cursor = '')}
        >
            {/* Shirt */}
            <mesh position={[0, -1.85, 0]} scale={[1.35, 1, 0.9]}>
                <capsuleGeometry args={[0.75, 0.5, 6, 12]} />
                <meshStandardMaterial color={SHIRT} flatShading roughness={0.9} />
            </mesh>
            <mesh position={[0, -1.02, 0.1]}>
                <cylinderGeometry args={[0.24, 0.28, 0.4, 10]} />
                {skin}
            </mesh>

            <group ref={head}>
                <mesh scale={[1, 1.08, 0.95]}>
                    <icosahedronGeometry args={[1, 2]} />
                    {skin}
                </mesh>
                {[-1, 1].map((s) => (
                    <mesh key={s} position={[s * 0.98, -0.02, 0]} scale={[0.16, 0.24, 0.14]}>
                        <icosahedronGeometry args={[1, 1]} />
                        {skin}
                    </mesh>
                ))}

                {/* Hair cap, front swoop and the signature cowlick */}
                <mesh rotation={[-0.35, 0, 0]} scale={[1.04, 1.1, 1]}>
                    <sphereGeometry args={[1.05, 16, 10, 0, Math.PI * 2, 0, Math.PI * 0.42]} />
                    {hair}
                </mesh>
                {[
                    [-0.45, 0.82, 0.55, 0.32],
                    [0.05, 0.92, 0.6, 0.36],
                    [0.5, 0.8, 0.5, 0.3],
                ].map(([x, y, z, r], i) => (
                    <mesh key={i} position={[x, y, z]} scale={[1.2, 0.7, 0.9]}>
                        <icosahedronGeometry args={[r, 0]} />
                        {hair}
                    </mesh>
                ))}
                <mesh position={[0.15, 1.2, 0.1]} rotation={[0.3, 0, -0.6]}>
                    <coneGeometry args={[0.16, 0.5, 5]} />
                    {hair}
                </mesh>

                {/* Face */}
                {[-1, 1].map((s) => (
                    <group key={s}>
                        <mesh position={[s * 0.33, 0.02, 0.9]}>
                            <sphereGeometry args={[0.09, 12, 12]} />
                            <meshStandardMaterial color={HAIR} roughness={0.2} />
                        </mesh>
                        <mesh position={[s * 0.33 + 0.03, 0.05, 0.98]}>
                            <sphereGeometry args={[0.025, 8, 8]} />
                            <meshBasicMaterial color="#ffffff" />
                        </mesh>
                        <mesh position={[s * 0.34, 0.25, 0.88]} rotation={[0, 0, s * -0.08]}>
                            <boxGeometry args={[0.26, 0.05, 0.05]} />
                            {hair}
                        </mesh>
                        <mesh position={[s * 0.55, -0.22, 0.8]}>
                            <sphereGeometry args={[0.1, 10, 10]} />
                            <meshStandardMaterial color="#F09A86" transparent opacity={0.55} />
                        </mesh>
                    </group>
                ))}
                <mesh position={[0, -0.3, 0.9]} rotation={[0.2, 0, Math.PI]}>
                    <torusGeometry args={[0.2, 0.03, 8, 20, Math.PI]} />
                    <meshStandardMaterial color="#7A3B2E" />
                </mesh>
            </group>
        </group>
    );
}

type TokenProps = { radius: number; speed: number; phase: number; height: number; color: string; kind: number };

/** Small shapes orbiting the mascot; hover to enlarge. */
function Token({ radius, speed, phase, height, color, kind }: TokenProps) {
    const ref = useRef<THREE.Mesh>(null);
    const [hovered, setHovered] = useState(false);

    useFrame((state, delta) => {
        if (!ref.current) return;
        const t = (reduceMotion ? 0 : state.clock.elapsedTime) * speed + phase;
        ref.current.position.set(Math.cos(t) * radius, height + Math.sin(t * 1.3) * 0.2, Math.sin(t) * radius * 0.6);
        ref.current.rotation.x += delta * 0.6;
        ref.current.rotation.y += delta * 0.4;
        const s = THREE.MathUtils.damp(ref.current.scale.x, hovered ? 1.6 : 1, 6, delta);
        ref.current.scale.setScalar(s);
    });

    const geometry = useMemo(() => {
        switch (kind) {
            case 0:
                return <torusGeometry args={[0.16, 0.06, 8, 16]} />;
            case 1:
                return <octahedronGeometry args={[0.18]} />;
            case 2:
                return <boxGeometry args={[0.24, 0.24, 0.24]} />;
            default:
                return <icosahedronGeometry args={[0.18, 0]} />;
        }
    }, [kind]);

    return (
        <mesh ref={ref} onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)}>
            {geometry}
            <meshStandardMaterial color={color} flatShading roughness={0.4} emissive={color} emissiveIntensity={hovered ? 0.6 : 0.15} />
        </mesh>
    );
}

const TOKENS = [
    { radius: 2.1, speed: 0.35, phase: 0, height: 0.6, color: ORANGE, kind: 0 },
    { radius: 2.4, speed: 0.28, phase: 1.6, height: -0.4, color: LILAC, kind: 1 },
    { radius: 1.9, speed: 0.42, phase: 3.1, height: 1.1, color: MINT, kind: 2 },
    { radius: 2.6, speed: 0.22, phase: 4.4, height: -1.1, color: '#F2F0EA', kind: 3 },
    { radius: 2.2, speed: 0.31, phase: 5.5, height: 0.1, color: ORANGE, kind: 3 },
];

export default function HeroScene() {
    return (
        // eventSource on body so the head follows the pointer anywhere on the page, not only over the canvas
        <Canvas
            dpr={[1, 2]}
            camera={{ position: [0, 0, 8], fov: 35 }}
            gl={{ antialias: true, alpha: true }}
            eventSource={document.body}
            eventPrefix="client"
            aria-hidden="true"
        >
            <ambientLight intensity={0.7} />
            <directionalLight position={[3, 4, 5]} intensity={1.6} />
            <pointLight position={[-3, 1, -2]} intensity={25} color={ORANGE} />
            <pointLight position={[3, -2, -2]} intensity={15} color={LILAC} />
            <group position={[0, 0.5, 0]} scale={0.9}>
                <MascotHead />
                {TOKENS.map((t, i) => (
                    <Token key={i} {...t} />
                ))}
            </group>
        </Canvas>
    );
}
