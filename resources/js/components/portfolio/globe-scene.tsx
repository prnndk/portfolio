import { Canvas, useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';

const ORANGE = '#FF6A2B';
const LILAC = '#C9C3FF';
const reduceMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const R = 1.6;
const rad = (d: number) => (d * Math.PI) / 180;

const toVec = (lat: number, lon: number, r: number) =>
    new THREE.Vector3(r * Math.cos(rad(lat)) * Math.sin(rad(lon)), r * Math.sin(rad(lat)), r * Math.cos(rad(lat)) * Math.cos(rad(lon)));

// Home: Bandung-ish. Destinations the arcs fly to.
const HOME = { lat: -6.9, lon: 107.6 };
const CITIES = [
    { lat: 1.35, lon: 103.8 }, // Singapore
    { lat: 35.7, lon: 139.7 }, // Tokyo
    { lat: -33.9, lon: 151.2 }, // Sydney
    { lat: 25.2, lon: 55.3 }, // Dubai
    { lat: 51.5, lon: -0.1 }, // London
    { lat: 37.8, lon: -122.4 }, // San Francisco
    { lat: -23.5, lon: -46.6 }, // Sao Paulo
];

/** Real land dots: rasterise world-atlas land polygons to a small mask, then keep sphere points that fall on land. */
async function buildLandPoints(): Promise<Float32Array> {
    const [{ feature }, { default: topo }] = await Promise.all([import('topojson-client'), import('world-atlas/land-110m.json')]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const geo = feature(topo as any, (topo as any).objects.land) as any;
    const W = 720;
    const H = 360;
    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
    ctx.fillStyle = '#fff';
    const geoms = geo.type === 'FeatureCollection' ? geo.features.map((f: { geometry: unknown }) => f.geometry) : [geo.geometry ?? geo];
    for (const g of geoms as { type: string; coordinates: number[][][] | number[][][][] }[]) {
        const polys = g.type === 'Polygon' ? [g.coordinates as number[][][]] : (g.coordinates as number[][][][]);
        for (const poly of polys) {
            ctx.beginPath();
            for (const ring of poly) {
                ring.forEach(([lon, lat], i) => {
                    const x = ((lon + 180) / 360) * W;
                    const y = ((90 - lat) / 180) * H;
                    if (i === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                });
                ctx.closePath();
            }
            ctx.fill('evenodd');
        }
    }
    const data = ctx.getImageData(0, 0, W, H).data;

    const count = 9000;
    const golden = Math.PI * (3 - Math.sqrt(5));
    const out: number[] = [];
    for (let i = 0; i < count; i++) {
        const y = 1 - (i / (count - 1)) * 2;
        const r = Math.sqrt(1 - y * y);
        const theta = golden * i;
        const x = Math.cos(theta) * r;
        const z = Math.sin(theta) * r;
        const lat = (Math.asin(y) * 180) / Math.PI;
        const lon = (Math.atan2(x, z) * 180) / Math.PI;
        const px = Math.min(W - 1, Math.floor(((lon + 180) / 360) * W));
        const py = Math.min(H - 1, Math.floor(((90 - lat) / 180) * H));
        if (data[(py * W + px) * 4] > 128) out.push(x * R, y * R, z * R);
    }
    return new Float32Array(out);
}

/** Great-circle arc lifted off the surface; draws itself, then a bright bead rides it to the destination. */
function Arc({ to, phase }: { to: { lat: number; lon: number }; phase: number }) {
    const bead = useRef<THREE.Mesh>(null);
    const dest = useRef<THREE.Mesh>(null);
    const SEG = 64;

    const { line, curve } = useMemo(() => {
        const a = toVec(HOME.lat, HOME.lon, 1);
        const b = toVec(to.lat, to.lon, 1);
        const angle = a.angleTo(b);
        const pts: THREE.Vector3[] = [];
        for (let i = 0; i <= SEG; i++) {
            const t = i / SEG;
            const p = a.clone().lerp(b, t).normalize();
            pts.push(p.multiplyScalar(R * (1.005 + Math.sin(Math.PI * t) * 0.18 * Math.min(1, angle))));
        }
        const geometry = new THREE.BufferGeometry().setFromPoints(pts);
        const material = new THREE.LineBasicMaterial({ color: ORANGE, transparent: true, opacity: 0.9 });
        return { line: new THREE.Line(geometry, material), curve: pts };
    }, [to]);

    useFrame((state) => {
        const t = reduceMotion ? 0.99 : (state.clock.elapsedTime * 0.18 + phase) % 1.4;
        const draw = Math.min(1, t / 0.9);
        line.geometry.setDrawRange(0, Math.floor(draw * (SEG + 1)));
        (line.material as THREE.LineBasicMaterial).opacity = t > 1.1 ? Math.max(0, 1 - (t - 1.1) / 0.3) : 0.9;
        if (bead.current) {
            const p = curve[Math.min(SEG, Math.floor(draw * SEG))];
            bead.current.position.copy(p);
            bead.current.visible = t < 1.1;
        }
        if (dest.current) {
            const k = Math.max(0, Math.min(1, (t - 0.9) / 0.4));
            dest.current.scale.setScalar(0.2 + k * 3);
            (dest.current.material as THREE.MeshBasicMaterial).opacity = draw >= 1 ? (1 - k) * 0.8 : 0;
        }
    });

    const destPos = useMemo(() => toVec(to.lat, to.lon, R * 1.012), [to]);

    return (
        <group>
            <primitive object={line} />
            <mesh ref={bead}>
                <sphereGeometry args={[0.035, 8, 8]} />
                <meshBasicMaterial color="#fff" />
            </mesh>
            <mesh ref={dest} position={destPos} onUpdate={(m) => m.lookAt(destPos.clone().multiplyScalar(2))}>
                <ringGeometry args={[0.04, 0.055, 24]} />
                <meshBasicMaterial color={ORANGE} transparent side={THREE.DoubleSide} />
            </mesh>
        </group>
    );
}

function Globe() {
    const group = useRef<THREE.Group>(null);
    const pulse = useRef<THREE.Mesh>(null);
    const [land, setLand] = useState<Float32Array | null>(null);

    useEffect(() => {
        let alive = true;
        buildLandPoints().then((p) => alive && setLand(p));
        return () => {
            alive = false;
        };
    }, []);

    const home = useMemo(() => toVec(HOME.lat, HOME.lon, R * 1.012), []);
    const spin = useRef(rad(-HOME.lon));

    useFrame((state, delta) => {
        if (!group.current) return;
        const { x, y } = state.pointer;
        if (!reduceMotion) spin.current += delta * 0.22;
        group.current.rotation.y = spin.current + x * 0.35;
        group.current.rotation.x = THREE.MathUtils.damp(group.current.rotation.x, -y * 0.3 + 0.28, 3, delta);
        if (pulse.current) {
            const k = (state.clock.elapsedTime * 0.8) % 1;
            pulse.current.scale.setScalar(1 + k * 3);
            (pulse.current.material as THREE.MeshBasicMaterial).opacity = (1 - k) * 0.7;
        }
    });

    return (
        <group ref={group}>
            <mesh>
                <sphereGeometry args={[R * 0.99, 48, 48]} />
                <meshBasicMaterial color="#101014" />
            </mesh>
            {land && (
                <points>
                    <bufferGeometry>
                        <bufferAttribute attach="attributes-position" args={[land, 3]} />
                    </bufferGeometry>
                    <pointsMaterial size={0.03} color={LILAC} sizeAttenuation transparent opacity={0.95} />
                </points>
            )}
            <mesh>
                <sphereGeometry args={[R * 1.06, 48, 48]} />
                <meshBasicMaterial color={LILAC} transparent opacity={0.05} side={THREE.BackSide} />
            </mesh>

            <group position={home} onUpdate={(g) => g.lookAt(home.clone().multiplyScalar(2))}>
                <mesh>
                    <sphereGeometry args={[0.065, 16, 16]} />
                    <meshBasicMaterial color={ORANGE} />
                </mesh>
                <mesh ref={pulse}>
                    <ringGeometry args={[0.08, 0.1, 32]} />
                    <meshBasicMaterial color={ORANGE} transparent side={THREE.DoubleSide} />
                </mesh>
            </group>

            {CITIES.map((c, i) => (
                <Arc key={i} to={c} phase={i * 0.2} />
            ))}
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
