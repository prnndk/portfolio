/**
 * Pixel art for the "pixel pal": every function draws straight onto a 2D canvas in logical pixels
 * (the canvas is scaled up with `image-rendering: pixelated`), so there are no image assets to load.
 *
 * Character space: 16 wide, 23 tall, origin at the feet (x centred, y = ground line).
 */

export type PalPose = 'stand' | 'walk' | 'run' | 'sit-code' | 'sit-read' | 'water' | 'sleep' | 'wave' | 'climb' | 'sit-edge' | 'point' | 'cheer';

export interface PalDraw {
    x: number;
    groundY: number;
    dir: 1 | -1;
    pose: PalPose;
    /** Milliseconds, drives every animation cycle. */
    t: number;
}

const C = {
    hair: '#15151A',
    hairHi: '#3C3C48',
    skin: '#F2C9A5',
    skinShade: '#DDA67E',
    shirt: '#34343F',
    shirtHi: '#4B4B5A',
    pants: '#C9B58F',
    pantsShade: '#A99772',
    shoe: '#3B2A22',
    blush: '#F09A86',
    mouth: '#8A4A3A',
    eye: '#15151A',
    white: '#FFFFFF',
    orange: '#FF6A2B',
    wood: '#8A5A3A',
    woodDark: '#6A4228',
    metal: '#8A8A98',
    metalDark: '#5A5A68',
    screen: '#7CD7FF',
    green: '#4FA85A',
    greenDark: '#2F7A3E',
    water: '#6EC1FF',
    pot: '#C4694A',
    potDark: '#9A4A32',
    paper: '#F4EFE2',
    book: '#6C5CE7',
};

type Ctx = CanvasRenderingContext2D;

const px = (ctx: Ctx, color: string, x: number, y: number, w = 1, h = 1) => {
    ctx.fillStyle = color;
    ctx.fillRect(Math.round(x), Math.round(y), w, h);
};

interface BodyOpts {
    /** Which leg frame: 0 stand, 1/3 stride, 2 stand mid-step. `sit` bends the legs onto a stool. */
    legs: 0 | 1 | 2 | 3 | 'sit';
    /** Upper body vertical offset (negative = up). */
    up?: number;
    armL?: number;
    armR?: number;
    /** Right arm raised in a wave (0/1 = frame). */
    wave?: 0 | 1;
    eyesClosed?: boolean;
    mouth?: 'smile' | 'open' | 'flat';
    /** Both hands out in front (typing / holding something). */
    handsFront?: number;
    /** Dangling shins swing for sitting on a ledge. */
    swing?: number;
    /** Right arm points down and forward. */
    point?: boolean;
    /** Both arms thrown up. */
    cheer?: boolean;
}

/** Draws the character with feet on y=0, facing +x. */
function body(ctx: Ctx, o: BodyOpts) {
    const up = o.up ?? 0;
    const y = (n: number) => n + up;

    // legs (rows 19-22)
    const legs = o.legs;
    if (legs === 'sit') {
        px(ctx, C.pants, -3, -5, 8, 2); // thighs, rows 18-19
        px(ctx, C.pantsShade, -3, -3, 0, 0);
        px(ctx, C.pants, 3 + (o.swing ?? 0), -3, 2, 3); // shins
        px(ctx, C.shoe, 3 + (o.swing ?? 0), -1, 3, 1);
    } else if (o.cheer) {
        px(ctx, C.pants, -4, -4, 3, 3);
        px(ctx, C.pants, 1, -4, 3, 3);
        px(ctx, C.shoe, -4, -1, 3, 1);
        px(ctx, C.shoe, 1, -1, 3, 1);
    } else {
        const lift = (side: 'l' | 'r') => (legs === 1 && side === 'l') || (legs === 3 && side === 'r');
        px(ctx, C.pants, -3, -4, 3, lift('l') ? 2 : 3);
        px(ctx, C.pants, 0, -4, 3, lift('r') ? 2 : 3);
        px(ctx, C.pantsShade, -1, -4, 1, 1);
        px(ctx, C.shoe, -3, lift('l') ? -2 : -1, 3, 1);
        px(ctx, C.shoe, 0, lift('r') ? -2 : -1, 3, 1);
    }

    // torso (rows 11-17)
    px(ctx, C.pants, -3, y(-6), 6, 2); // belt/hips
    px(ctx, C.shirt, -4, y(-12), 8, 6);
    px(ctx, C.shirtHi, -3, y(-12), 2, 1);
    px(ctx, C.shirtHi, 1, y(-11), 1, 3); // placket
    px(ctx, C.skinShade, -1, y(-13), 2, 1); // neck

    // arms
    const front = o.handsFront;
    if (o.cheer) {
        px(ctx, C.shirt, -6, y(-17), 2, 6);
        px(ctx, C.skin, -6, y(-19), 2, 2);
        px(ctx, C.shirt, 4, y(-17), 2, 6);
        px(ctx, C.skin, 4, y(-19), 2, 2);
    } else if (front !== undefined) {
        px(ctx, C.shirt, 3, y(-11) + front, 4, 2);
        px(ctx, C.skin, 7, y(-11) + front, 1, 2);
        px(ctx, C.shirt, -6, y(-11), 2, 3);
        px(ctx, C.skin, -6, y(-8), 2, 1);
    } else {
        const aL = o.armL ?? 0;
        const aR = o.armR ?? 0;
        px(ctx, C.shirt, -6, y(-12) + aL, 2, 4);
        px(ctx, C.skin, -6, y(-8) + aL, 2, 2);
        if (o.point) {
            px(ctx, C.shirt, 4, y(-12), 2, 3);
            px(ctx, C.shirt, 6, y(-10), 2, 3);
            px(ctx, C.skin, 7, y(-7), 2, 2);
        } else if (o.wave !== undefined) {
            const sx = o.wave ? 1 : 0;
            px(ctx, C.shirt, 4, y(-12), 2, 2);
            px(ctx, C.shirt, 6, y(-15), 2, 4);
            px(ctx, C.shirt, 6 + sx, y(-18), 2, 3);
            px(ctx, C.skin, 6 + sx, y(-20), 2, 2);
        } else {
            px(ctx, C.shirt, 4, y(-12) + aR, 2, 4);
            px(ctx, C.skin, 4, y(-8) + aR, 2, 2);
        }
    }

    // head (rows 0-10): swept hair, cowlick, face
    px(ctx, C.hair, 1, y(-23), 2, 1); // cowlick
    px(ctx, C.hair, -4, y(-22), 8, 3);
    px(ctx, C.hairHi, -2, y(-22), 3, 1);
    px(ctx, C.hair, -5, y(-20), 1, 3);
    px(ctx, C.hair, 4, y(-20), 1, 3);
    px(ctx, C.skin, -4, y(-19), 8, 6);
    px(ctx, C.hair, -4, y(-19), 5, 1); // fringe
    px(ctx, C.skin, 4, y(-18), 1, 3);
    if (o.eyesClosed) {
        px(ctx, C.eye, 0, y(-16), 2, 1);
        px(ctx, C.eye, 3, y(-16), 1, 1);
    } else {
        px(ctx, C.eye, 1, y(-17), 1, 2);
        px(ctx, C.eye, 3, y(-17), 1, 2);
    }
    px(ctx, C.blush, 0, y(-15), 1, 1);
    const m = o.mouth ?? 'smile';
    if (m === 'open') px(ctx, C.mouth, 2, y(-14), 2, 1);
    else if (m === 'smile') {
        px(ctx, C.mouth, 1, y(-14), 3, 1);
        px(ctx, C.skin, 1, y(-14), 0, 0);
    } else px(ctx, C.mouth, 2, y(-14), 1, 1);
}

/** Back view for climbing: hands up on the rungs, legs alternating. */
function bodyBack(ctx: Ctx, frame: 0 | 1) {
    const a = frame === 0;
    px(ctx, C.pants, -3, -6, 6, 2);
    px(ctx, C.pants, -3, a ? -5 : -4, 3, a ? 4 : 3);
    px(ctx, C.pants, 0, -4 - (a ? 0 : 1), 3, a ? 3 : 4);
    px(ctx, C.shoe, -3, a ? -1 : -2, 3, 1);
    px(ctx, C.shoe, 0, a ? -2 : -1, 3, 1);
    px(ctx, C.shirt, -4, -12, 8, 6);
    px(ctx, C.shirtHi, -1, -11, 2, 1);
    px(ctx, C.skinShade, -1, -13, 2, 1);
    // arms: one high, one low, swapping each frame
    px(ctx, C.shirt, -6, a ? -17 : -14, 2, a ? 5 : 3);
    px(ctx, C.skin, -6, a ? -19 : -16, 2, 2);
    px(ctx, C.shirt, 4, a ? -14 : -17, 2, a ? 3 : 5);
    px(ctx, C.skin, 4, a ? -16 : -19, 2, 2);
    // head from behind: all hair
    px(ctx, C.hair, 1, -23, 2, 1);
    px(ctx, C.hair, -4, -22, 8, 7);
    px(ctx, C.hair, -5, -20, 1, 3);
    px(ctx, C.hair, 4, -20, 1, 3);
    px(ctx, C.hairHi, -2, -22, 3, 1);
    px(ctx, C.hairHi, -3, -18, 1, 2);
    px(ctx, C.skin, -3, -15, 6, 2);
}

function zzz(ctx: Ctx, x: number, y: number, t: number) {
    const letters = [
        { dx: 0, dy: 0, s: 3 },
        { dx: 4, dy: -6, s: 4 },
        { dx: 9, dy: -13, s: 5 },
    ];
    letters.forEach((l, i) => {
        const phase = ((t / 1400 + i * 0.33) % 1) as number;
        const ox = l.dx + phase * 2;
        const oy = l.dy - phase * 4;
        ctx.globalAlpha = 1 - phase * 0.8;
        const ax = Math.round(x + ox);
        const ay = Math.round(y + oy);
        px(ctx, C.white, ax, ay, l.s, 1);
        px(ctx, C.white, ax, ay + l.s - 1, l.s, 1);
        for (let r = 1; r < l.s - 1; r++) px(ctx, C.white, ax + l.s - 1 - r, ay + r, 1, 1);
    });
    ctx.globalAlpha = 1;
}

/** Draws the character for a pose. */
export function drawPal(ctx: Ctx, { x, groundY, dir, pose, t }: PalDraw) {
    ctx.save();
    ctx.translate(Math.round(x), groundY);
    ctx.scale(dir, 1);

    const blink = t % 3600 > 3450;
    const breathe = Math.floor(t / 650) % 2 === 0 ? 0 : 1;

    switch (pose) {
        case 'walk':
        case 'run': {
            const speed = pose === 'run' ? 90 : 150;
            const f = (Math.floor(t / speed) % 4) as 0 | 1 | 2 | 3;
            const swing = [0, 1, 0, -1][f];
            body(ctx, { legs: f, up: f % 2 === 1 ? -1 : 0, armL: swing, armR: -swing, eyesClosed: blink });
            break;
        }
        case 'sit-code': {
            const typing = Math.floor(t / 140) % 2;
            body(ctx, { legs: 'sit', handsFront: typing, eyesClosed: blink, mouth: 'flat' });
            break;
        }
        case 'sit-read': {
            body(ctx, { legs: 'sit', handsFront: 1, eyesClosed: blink, mouth: 'flat' });
            break;
        }
        case 'water': {
            body(ctx, { legs: 0, handsFront: 0, eyesClosed: blink });
            break;
        }
        case 'climb': {
            bodyBack(ctx, (Math.floor(t / 230) % 2) as 0 | 1);
            break;
        }
        case 'sit-edge': {
            const swing = Math.floor(t / 420) % 2;
            body(ctx, { legs: 'sit', swing, eyesClosed: blink, mouth: 'smile', armL: 1, armR: 1 });
            break;
        }
        case 'point': {
            body(ctx, { legs: 0, point: true, mouth: 'open', eyesClosed: false });
            break;
        }
        case 'cheer': {
            const hop = Math.floor(t / 180) % 2 ? -2 : 0;
            ctx.translate(0, hop);
            body(ctx, { legs: 0, cheer: true, mouth: 'open', eyesClosed: false });
            break;
        }
        case 'wave': {
            body(ctx, { legs: 0, wave: (Math.floor(t / 200) % 2) as 0 | 1, mouth: 'open', eyesClosed: false });
            break;
        }
        case 'sleep': {
            ctx.restore();
            ctx.save();
            ctx.translate(Math.round(x) + 9 * dir, groundY - 9);
            ctx.rotate(dir > 0 ? -Math.PI / 2 : Math.PI / 2);
            ctx.scale(dir, 1);
            body(ctx, { legs: 0, eyesClosed: true, mouth: 'flat', up: breathe ? 0 : 0 });
            ctx.restore();
            zzz(ctx, Math.round(x) - 14 * dir, groundY - 26, t);
            return;
        }
        default:
            body(ctx, { legs: 0, up: -breathe, eyesClosed: blink, armL: breathe, armR: breathe });
    }

    ctx.restore();
}

/* ───────────────────────── props ───────────────────────── */

/** Desk with a laptop. `x` is the desk's left edge, drawn to the right; the character sits at x - 8. */
export function drawDesk(ctx: Ctx, x: number, groundY: number, t: number, active: boolean) {
    px(ctx, C.wood, x, groundY - 6, 14, 1);
    px(ctx, C.woodDark, x + 1, groundY - 5, 1, 5);
    px(ctx, C.woodDark, x + 12, groundY - 5, 1, 5);
    // laptop
    px(ctx, C.metal, x + 2, groundY - 7, 7, 1);
    px(ctx, C.metalDark, x + 8, groundY - 13, 1, 6);
    px(ctx, active ? C.screen : C.metalDark, x + 7, groundY - 12, 1, 4);
    if (active) {
        px(ctx, C.white, x + 7, groundY - 12 + (Math.floor(t / 220) % 4), 1, 1);
    }
    // stool the character sits on
    px(ctx, C.woodDark, x - 12, groundY - 3, 6, 1);
    px(ctx, C.woodDark, x - 11, groundY - 2, 1, 2);
    px(ctx, C.woodDark, x - 7, groundY - 2, 1, 2);
}

/** Bench. `x` is the centre; the character sits on its left half. */
export function drawBench(ctx: Ctx, x: number, groundY: number) {
    px(ctx, C.wood, x - 8, groundY - 4, 12, 1);
    px(ctx, C.woodDark, x - 7, groundY - 3, 1, 3);
    px(ctx, C.woodDark, x + 2, groundY - 3, 1, 3);
    px(ctx, C.wood, x - 8, groundY - 10, 1, 6);
}

/** Open book in the hands while reading. */
export function drawBook(ctx: Ctx, x: number, groundY: number, dir: 1 | -1, t: number) {
    const flip = Math.floor(t / 1500) % 2;
    const bx = x + 6 * dir;
    px(ctx, C.book, bx - (dir < 0 ? 4 : 0), groundY - 11, 5, 4);
    px(ctx, C.paper, bx - (dir < 0 ? 4 : 0) + 1, groundY - 10, 3, 2);
    if (flip) px(ctx, C.white, bx - (dir < 0 ? 4 : 0) + 2, groundY - 11, 1, 1);
}

/** Plant pot with a flower that grows over `stage` 0-3. */
export function drawPlant(ctx: Ctx, x: number, groundY: number, stage: number, t: number) {
    px(ctx, C.pot, x - 3, groundY - 5, 7, 5);
    px(ctx, C.potDark, x - 3, groundY - 5, 7, 1);
    px(ctx, C.woodDark, x - 2, groundY - 6, 5, 1); // soil
    const sway = stage >= 2 ? Math.round(Math.sin(t / 700)) : 0;
    if (stage >= 1) {
        px(ctx, C.green, x, groundY - 8, 1, 2);
    }
    if (stage >= 2) {
        px(ctx, C.green, x, groundY - 11, 1, 5);
        px(ctx, C.greenDark, x - 2, groundY - 9, 2, 1);
        px(ctx, C.greenDark, x + 1, groundY - 8, 2, 1);
    }
    if (stage >= 3) {
        const fx = x + sway;
        px(ctx, C.orange, fx - 1, groundY - 14, 3, 3);
        px(ctx, C.white, fx, groundY - 13, 1, 1);
    } else if (stage >= 2) {
        px(ctx, C.green, x - 1 + sway, groundY - 13, 3, 2);
    }
}

/** Watering can plus falling drops, drawn while the character waters. */
export function drawWateringCan(ctx: Ctx, x: number, groundY: number, dir: 1 | -1, t: number) {
    const cx = x + 7 * dir;
    const left = dir > 0 ? cx : cx - 5;
    px(ctx, C.metal, left, groundY - 11, 5, 4);
    px(ctx, C.metalDark, left, groundY - 11, 5, 1);
    px(ctx, C.metal, dir > 0 ? left + 5 : left - 2, groundY - 13, 2, 1); // spout
    px(ctx, C.metal, dir > 0 ? left + 6 : left - 3, groundY - 12, 1, 2);
    // drops
    const tip = dir > 0 ? left + 7 : left - 3;
    for (let i = 0; i < 3; i++) {
        const phase = ((t / 450 + i / 3) % 1) as number;
        px(ctx, C.water, tip + dir * Math.round(phase * 2), groundY - 11 + Math.round(phase * 9), 1, 1);
    }
}

/** Speckled grass floor along the bottom edge. Seeded, so it never flickers. */
export function drawGround(ctx: Ctx, width: number, groundY: number) {
    ctx.globalAlpha = 0.9;
    px(ctx, C.greenDark, 0, groundY, width, 1);
    let seed = 7;
    const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280) as number;
    for (let x = 2; x < width; x += 5 + Math.floor(rnd() * 6)) {
        px(ctx, C.green, x, groundY - 1, 1, 1);
        px(ctx, C.green, x + 1, groundY - 2, 1, 2);
        px(ctx, C.green, x + 2, groundY - 1, 1, 1);
        if (rnd() > 0.82) px(ctx, rnd() > 0.5 ? C.orange : C.white, x + 1, groundY - 3, 1, 1);
    }
    ctx.globalAlpha = 1;
}

/** Ladder from `bottomY` up to `topY`, rails at x and x + 9. */
export function drawLadder(ctx: Ctx, x: number, topY: number, bottomY: number) {
    px(ctx, C.woodDark, x, topY, 1, bottomY - topY);
    px(ctx, C.woodDark, x + 9, topY, 1, bottomY - topY);
    for (let y = topY + 3; y < bottomY - 1; y += 4) px(ctx, C.wood, x + 1, y, 8, 1);
}

export interface Confetti {
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    color: string;
}

const CONFETTI_COLORS = [C.orange, C.screen, C.white, '#C9C3FF', '#7CFFB2'];

export function spawnConfetti(x: number, y: number, n = 28): Confetti[] {
    return Array.from({ length: n }, () => ({
        x,
        y,
        vx: (Math.random() - 0.5) * 50,
        vy: -20 - Math.random() * 40,
        life: 1.2 + Math.random() * 0.8,
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    }));
}

/** Advances and draws confetti; returns the survivors. */
export function drawConfetti(ctx: Ctx, list: Confetti[], dt: number): Confetti[] {
    return list.filter((c) => {
        c.life -= dt;
        c.vy += 70 * dt;
        c.x += c.vx * dt;
        c.y += c.vy * dt;
        if (c.life <= 0) return false;
        px(ctx, c.color, c.x, c.y, 1, 1);
        return true;
    });
}

/** Small grass patch drawn between x0 and x1. */
export function drawYard(ctx: Ctx, x0: number, x1: number, groundY: number) {
    px(ctx, C.greenDark, x0, groundY, x1 - x0, 1);
    for (let x = x0 + 1; x < x1; x += 3) {
        px(ctx, C.green, x, groundY - 1, 1, 1);
        if (x % 2 === 0) px(ctx, C.green, x + 1, groundY - 2, 1, 1);
    }
}
