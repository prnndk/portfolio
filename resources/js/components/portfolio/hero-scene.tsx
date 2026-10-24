import { drawPal, type PalPose } from '@/components/pixel-pal/sprites';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { type MutableRefObject, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';

const ORANGE = '#FF6A2B';
const LILAC = '#C9C3FF';
const MINT = '#7CFFB2';
const MONO = "600 54px 'JetBrains Mono', ui-monospace, monospace";

const reduceMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

type Pointer = MutableRefObject<{ x: number; y: number }>;

/** Pointer position in -1..1 across the whole window, so the character keeps facing you outside the canvas too. */
function useWindowPointer() {
    const pointer = useRef({ x: 0, y: 0 });
    useEffect(() => {
        const move = (e: PointerEvent) => {
            pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
            pointer.current.y = -((e.clientY / window.innerHeight) * 2 - 1);
        };
        window.addEventListener('pointermove', move);
        return () => window.removeEventListener('pointermove', move);
    }, []);
    return pointer;
}

// The part of the scene that must always be in shot. The camera backs off until this box fits the canvas,
// so the character and its orbits are framed the same on a phone, a tablet and a wide desktop column.
const FRAME = { cy: -0.3, halfW: 2.75, halfH: 2.25 };

function FitCamera() {
    const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
    const size = useThree((s) => s.size);
    useEffect(() => {
        const t = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
        const d = Math.max(FRAME.halfH / t, FRAME.halfW / (t * (size.width / size.height)));
        // + margin: the near side of the orbits sits ~2 units in front of the frame plane
        camera.position.set(0, FRAME.cy, d + 1);
        camera.lookAt(0, FRAME.cy, 0);
    }, [camera, size]);
    return null;
}

// Sprite canvas in logical pixels; the character's feet sit on SPRITE_GROUND.
const SPRITE = 32;
const SPRITE_GROUND = 29;
/** World units per sprite pixel. */
const PIXEL = 0.15;

/**
 * The same pixel-art Gading that lives on the contact cards, drawn every frame onto a tiny canvas and
 * shown on a flat plane in the middle of the orbits. Faces the pointer, waves now and then, cheers when clicked.
 */
function PixelPlayer({ cheer, pointer }: { cheer: MutableRefObject<number>; pointer: Pointer }) {
    const root = useRef<THREE.Group>(null);
    const { canvas, ctx, texture } = useMemo(() => {
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = SPRITE;
        const texture = new THREE.CanvasTexture(canvas);
        texture.magFilter = texture.minFilter = THREE.NearestFilter;
        texture.generateMipmaps = false;
        texture.colorSpace = THREE.SRGBColorSpace;
        return { canvas, ctx: canvas.getContext('2d')!, texture };
    }, []);
    const dir = useRef<1 | -1>(1);
    const nextWave = useRef(4000);

    useEffect(() => () => texture.dispose(), [texture]);

    useFrame((state, delta) => {
        const t = state.clock.elapsedTime * 1000;
        if (Math.abs(pointer.current.x) > 0.08) dir.current = pointer.current.x > 0 ? 1 : -1;
        cheer.current = Math.max(0, cheer.current - delta);

        let pose: PalPose = 'stand';
        if (cheer.current > 0) pose = 'cheer';
        else if (!reduceMotion && t > nextWave.current) {
            pose = 'wave';
            if (t > nextWave.current + 1800) nextWave.current = t + 6000 + Math.random() * 6000;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'rgba(0,0,0,0.2)'; // contact shadow
        ctx.fillRect(SPRITE / 2 - 6, SPRITE_GROUND, 12, 1);
        ctx.fillRect(SPRITE / 2 - 4, SPRITE_GROUND + 1, 8, 1);
        drawPal(ctx, { x: SPRITE / 2, groundY: SPRITE_GROUND, dir: dir.current, pose, t: reduceMotion ? 0 : t });
        texture.needsUpdate = true;

        if (root.current) root.current.position.y = reduceMotion ? 0 : Math.round(Math.sin(t / 600) * 1.5) * PIXEL * 0.5;
    });

    return (
        <group ref={root}>
            <mesh
                // feet row lands at y = -2.2
                position={[0, -2.2 + (SPRITE_GROUND - SPRITE / 2) * PIXEL, 0]}
                onClick={() => (cheer.current = 1.4)}
                onPointerOver={() => (document.body.style.cursor = 'pointer')}
                onPointerOut={() => (document.body.style.cursor = '')}
            >
                <planeGeometry args={[SPRITE * PIXEL, SPRITE * PIXEL]} />
                <meshBasicMaterial map={texture} transparent alphaTest={0.1} toneMapped={false} />
            </mesh>
        </group>
    );
}

/** Rounded glyph tile drawn on a canvas, used as a sprite texture. */
function glyphTexture(glyph: string, color: string) {
    const c = document.createElement('canvas');
    c.width = c.height = 128;
    const ctx = c.getContext('2d')!;
    ctx.fillStyle = 'rgba(16,16,20,0.88)';
    ctx.strokeStyle = color;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.roundRect(8, 8, 112, 112, 26);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = color;
    ctx.font = MONO;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(glyph, 64, 68, 96);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    return tex;
}

const ICONS: [string, string][] = [
    ['</>', ORANGE],
    ['{ }', LILAC],
    ['>_', MINT],
    ['λ', ORANGE],
    ['AI', LILAC],
    ['git', MINT],
    ['01', ORANGE],
    ['#', LILAC],
];

/** Code glyph tiles on a tilted orbit around the head; hover one to enlarge it. */
function IconOrbit({ fontsReady }: { fontsReady: boolean }) {
    const group = useRef<THREE.Group>(null);
    const sprites = useRef<(THREE.Sprite | null)[]>([]);
    const [hovered, setHovered] = useState(-1);
    const textures = useMemo(() => ICONS.map(([g, c]) => glyphTexture(g, c)), [fontsReady]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => () => textures.forEach((t) => t.dispose()), [textures]);

    useFrame((state, delta) => {
        const t = reduceMotion ? 0 : state.clock.elapsedTime * 0.25;
        sprites.current.forEach((s, i) => {
            if (!s) return;
            const a = t + (i / ICONS.length) * Math.PI * 2;
            s.position.set(Math.cos(a) * 2.3, Math.sin(a * 2 + i) * 0.08, Math.sin(a) * 2.3);
            const k = THREE.MathUtils.damp(s.scale.x, hovered === i ? 0.68 : 0.42, 8, delta);
            s.scale.setScalar(k);
        });
        if (group.current) group.current.rotation.z = Math.sin((reduceMotion ? 0 : state.clock.elapsedTime) * 0.3) * 0.05 - 0.14;
    });

    return (
        <group ref={group} position={[0, 0.45, 0]} rotation={[0.5, 0, -0.14]}>
            {textures.map((map, i) => (
                <sprite
                    key={i}
                    ref={(s) => {
                        sprites.current[i] = s;
                    }}
                    scale={0.42}
                    onPointerOver={() => setHovered(i)}
                    onPointerOut={() => setHovered(-1)}
                >
                    <spriteMaterial map={map} transparent />
                </sprite>
            ))}
        </group>
    );
}

/** Name band wrapped around the shoulders like a holographic ring. */
function SignatureRing({ fontsReady }: { fontsReady: boolean }) {
    const ring = useRef<THREE.Group>(null);
    const texture = useMemo(() => {
        const c = document.createElement('canvas');
        c.width = 2048;
        c.height = 96;
        const ctx = c.getContext('2d')!;
        ctx.fillStyle = ORANGE;
        ctx.fillRect(0, 4, c.width, 3);
        ctx.fillRect(0, c.height - 7, c.width, 3);
        ctx.font = "700 46px 'JetBrains Mono', ui-monospace, monospace";
        ctx.textBaseline = 'middle';
        const text = 'ARYA GADING PRINANDIKA  ✦  SOFTWARE ENGINEER  ✦  CODE TO CLOUD  ✦  ';
        const w = ctx.measureText(text).width;
        // squeeze to fit the canvas exactly so the band repeats seamlessly
        ctx.setTransform(c.width / w, 0, 0, 1, 0, 0);
        ctx.fillText(text, 0, c.height / 2 + 2);
        const tex = new THREE.CanvasTexture(c);
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.wrapS = THREE.RepeatWrapping;
        tex.repeat.x = 2;
        tex.anisotropy = 8;
        return tex;
    }, [fontsReady]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => () => texture.dispose(), [texture]);

    useFrame((_, delta) => {
        if (ring.current && !reduceMotion) ring.current.rotation.y -= delta * 0.18;
    });

    return (
        <group position={[0, -0.95, 0]} rotation={[0.22, 0, 0.1]}>
            <group ref={ring}>
                {/* front faces solid, inside faint so the far half reads as depth */}
                <mesh>
                    <cylinderGeometry args={[2.05, 2.05, 0.22, 128, 1, true]} />
                    <meshBasicMaterial map={texture} transparent side={THREE.FrontSide} depthWrite={false} toneMapped={false} />
                </mesh>
                <mesh>
                    <cylinderGeometry args={[2.05, 2.05, 0.22, 128, 1, true]} />
                    <meshBasicMaterial map={texture} transparent opacity={0.22} side={THREE.BackSide} depthWrite={false} toneMapped={false} />
                </mesh>
            </group>
        </group>
    );
}

/** A thin band of data dust following the signature ring, plus a sparse halo behind the head. */
function DataDust() {
    const ref = useRef<THREE.Points>(null);
    const { positions, colors } = useMemo(() => {
        const palette = [new THREE.Color(LILAC), new THREE.Color(ORANGE), new THREE.Color('#F2F0EA')];
        const pos: number[] = [];
        const col: number[] = [];
        let seed = 3;
        const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
        for (let i = 0; i < 1800; i++) {
            const a = rand() * Math.PI * 2;
            if (i < 1300) {
                const r = 1.75 + Math.pow(rand(), 1.6) * 1.2;
                pos.push(Math.cos(a) * r, (rand() - 0.5) * 0.18, Math.sin(a) * r);
            } else {
                // halo shell kept behind / beside the face so it never covers it
                const y = rand() * 2 - 1;
                const r = 2.6 + rand() * 0.6;
                const x = Math.cos(a) * Math.sqrt(1 - y * y) * r;
                const z = -Math.abs(Math.sin(a) * Math.sqrt(1 - y * y) * r);
                pos.push(x, y * r * 0.8 + 0.9, z);
            }
            const c = palette[i % 7 === 0 ? 1 : i % 5 === 0 ? 2 : 0];
            col.push(c.r, c.g, c.b);
        }
        return { positions: new Float32Array(pos), colors: new Float32Array(col) };
    }, []);

    useFrame((_, delta) => {
        if (ref.current && !reduceMotion) ref.current.rotation.y += delta * 0.05;
    });

    return (
        <group position={[0, -0.95, 0]} rotation={[0.22, 0, 0.1]}>
            <points ref={ref}>
                <bufferGeometry>
                    <bufferAttribute attach="attributes-position" args={[positions, 3]} />
                    <bufferAttribute attach="attributes-color" args={[colors, 3]} />
                </bufferGeometry>
                <pointsMaterial size={0.028} vertexColors sizeAttenuation transparent opacity={0.85} depthWrite={false} />
            </points>
        </group>
    );
}

export default function HeroScene() {
    const cheer = useRef(0);
    const pointer = useWindowPointer();
    // canvas text needs the webfont loaded first, otherwise the tiles bake in the fallback font
    const [fontsReady, setFontsReady] = useState(false);
    useEffect(() => {
        let alive = true;
        document.fonts.load(MONO).finally(() => alive && setFontsReady(true));
        return () => {
            alive = false;
        };
    }, []);

    return (
        <Canvas
            dpr={[1, 2]}
            camera={{ position: [0, 0, 9], fov: 35 }}
            gl={{ antialias: true, alpha: true }}
            // a click anywhere in the scene makes the character cheer
            onClick={() => (cheer.current = 1.4)}
            aria-hidden="true"
        >
            <FitCamera />
            <PixelPlayer cheer={cheer} pointer={pointer} />
            <IconOrbit fontsReady={fontsReady} />
            <SignatureRing fontsReady={fontsReady} />
            <DataDust />
        </Canvas>
    );
}
