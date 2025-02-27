const EPS = 1e-6;
const NEAR_CLIPPING_PLANE = 0.1;
const FAR_CLIPPING_PLANE = 10;
const FOV = Math.PI / 2;
const MINIMAP_ENABLED = false;
const MINIMAP_SCALE = 0.03;
const MINIMAP_PLAYER_SIZE = 0.5;
const PLAYER_SPEED = 2;
export var Vec2;
(function (Vec2) {
    Vec2.create = (x = 0, y = x) => ({ x, y });
    Vec2.isVec2 = (object) => {
        return typeof object === 'object' && 'x' in object && 'y' in object;
    };
    Vec2.fromAngle = (angle, len = 1) => {
        return Vec2.create(Math.cos(angle) * len, Math.sin(angle) * len);
    };
    Vec2.clone = (v) => {
        return Vec2.create(v.x, v.y);
    };
    Vec2.copy = (v, x, y) => {
        if (Vec2.isVec2(x)) {
            v.x = x.x;
            v.y = x.y;
        }
        else {
            v.x = x;
            v.y = y ?? x;
        }
        return v;
    };
    Vec2.add = (v, x, y) => {
        if (Vec2.isVec2(x)) {
            v.x += x.x;
            v.y += x.y;
        }
        else {
            v.x += x;
            v.y += y ?? x;
        }
        return v;
    };
    Vec2.sub = (v, x, y) => {
        if (Vec2.isVec2(x)) {
            v.x -= x.x;
            v.y -= x.y;
        }
        else {
            v.x -= x;
            v.y -= y ?? x;
        }
        return v;
    };
    Vec2.mul = (v, x, y) => {
        if (Vec2.isVec2(x)) {
            v.x *= x.x;
            v.y *= x.y;
        }
        else {
            v.x *= x;
            v.y *= y ?? x;
        }
        return v;
    };
    Vec2.div = (v, x, y) => {
        if (Vec2.isVec2(x)) {
            v.x /= x.x;
            v.y /= x.y;
        }
        else {
            v.x /= x;
            v.y /= y ?? x;
        }
        return v;
    };
    Vec2.sqrDist = (v, x, y) => {
        if (Vec2.isVec2(x)) {
            const dx = x.x - v.x;
            const dy = x.y - v.y;
            return dx * dx + dy * dy;
        }
        else {
            const dx = x - v.x;
            const dy = (y ?? x) - v.y;
            return dx * dx + dy * dy;
        }
    };
    Vec2.dist = (v, x, y) => {
        return Math.sqrt(Vec2.sqrDist(v, x, y));
    };
    Vec2.rot90 = (v) => {
        const oldX = v.x;
        v.x = -v.y;
        v.y = oldX;
        return v;
    };
    Vec2.sqrLen = (v) => {
        return v.x * v.x + v.y * v.y;
    };
    Vec2.len = (v) => {
        return Math.sqrt(Vec2.sqrLen(v));
    };
    Vec2.norm = (v) => {
        const l = Vec2.len(v);
        return l === 0 ? v : Vec2.mul(v, 1 / l);
    };
    Vec2.lerp = (a, b, t) => {
        a.x += (b.x - a.x) * t;
        a.y += (b.y - a.y) * t;
        return a;
    };
    Vec2.dot = (a, b) => {
        return a.x * b.x + a.y * b.y;
    };
})(Vec2 || (Vec2 = {}));
;
export var RGBA;
(function (RGBA) {
    RGBA.create = (r = 0, g = 0, b = 0, a = 0) => ({ r, g, b, a });
    RGBA.red = RGBA.create(1, 0, 0, 1);
    RGBA.green = RGBA.create(0, 1, 0, 1);
    RGBA.blue = RGBA.create(0, 0, 1, 1);
    RGBA.purple = RGBA.create(1, 0, 1, 1);
    RGBA.toString = (color, brightness = 1) => {
        return `rgba(${Math.floor(color.r * brightness * 255)}, ${Math.floor(color.g * brightness * 255)}, ${Math.floor(color.b * brightness * 255)}, ${color.a})`;
    };
})(RGBA || (RGBA = {}));
export var Display;
(function (Display) {
    Display.swapBack = ({ ctx, backCtx, backImageData }) => {
        backCtx.putImageData(backImageData, 0, 0);
        ctx.drawImage(backCtx.canvas, 0, 0, ctx.canvas.width, ctx.canvas.height);
    };
})(Display || (Display = {}));
export var Tile;
(function (Tile) {
    Tile.empty = { kind: 'empty' };
    Tile.color = (color) => ({ kind: 'color', color });
    Tile.image = (image) => ({ kind: 'image', image });
    function throwBad(tile) {
        throw new Error(`Unknown tile kind: ${tile.kind}`);
    }
    Tile.throwBad = throwBad;
    ;
})(Tile || (Tile = {}));
export var Scene;
(function (Scene) {
    Scene.create = (walls, floors, ceilings) => {
        return {
            walls: walls.flat(),
            floors: floors.flat(),
            ceilings: ceilings.flat(),
            width: walls[0].length,
            height: walls.length,
        };
    };
    Scene.contains = (scene, x, y) => {
        if (Vec2.isVec2(x)) {
            return 0 <= x.x && x.x < scene.width && 0 <= x.y && x.y < scene.height;
        }
        else {
            return 0 <= x && x < scene.width && 0 <= y && y < scene.height;
        }
    };
    Scene.getWall = (scene, x, y) => {
        if (!Scene.contains(scene, x, y))
            return null;
        if (Vec2.isVec2(x)) {
            return scene.walls[Math.floor(x.y * scene.width + x.x)];
        }
        else {
            return scene.walls[Math.floor(y * scene.width + x)];
        }
    };
    Scene.getFloor = (scene, x, y) => {
        if (Vec2.isVec2(x)) {
            if (!Scene.contains(scene, Math.floor(x.x), Math.floor(x.y)))
                return null;
            return scene.floors[Math.floor(x.y) * scene.width + Math.floor(x.x)];
        }
        else {
            if (!Scene.contains(scene, Math.floor(x), Math.floor(y)))
                return null;
            return scene.floors[Math.floor(y) * scene.width + Math.floor(x)];
        }
    };
    Scene.getCeiling = (scene, x, y) => {
        if (Vec2.isVec2(x)) {
            if (!Scene.contains(scene, Math.floor(x.x), Math.floor(x.y)))
                return null;
            return scene.ceilings[Math.floor(x.y) * scene.width + Math.floor(x.x)];
        }
        else {
            if (!Scene.contains(scene, Math.floor(x), Math.floor(y)))
                return null;
            return scene.ceilings[Math.floor(y) * scene.width + Math.floor(x)];
        }
    };
    Scene.isWall = (scene, x, y) => {
        const wall = Scene.getWall(scene, x, y);
        return wall !== null && wall.kind !== 'empty';
    };
    Scene.rectFits = (scene, px, py, sx, sy) => {
        const x1 = Math.floor(px - sx / 2);
        const x2 = Math.floor(px + sx / 2);
        const y1 = Math.floor(py - sy / 2);
        const y2 = Math.floor(py + sy / 2);
        for (let x = x1; x <= x2; x++) {
            for (let y = y1; y <= y2; y++) {
                if (Scene.isWall(scene, x, y)) {
                    return false;
                }
            }
        }
        return true;
    };
})(Scene || (Scene = {}));
export var Player;
(function (Player) {
    Player.create = (pos, dir) => ({ pos, dir, velocity: Vec2.create() });
    Player.fovRange = (player) => {
        const l = Math.tan(FOV / 2) * NEAR_CLIPPING_PLANE;
        const p = Vec2.add(Vec2.fromAngle(player.dir, NEAR_CLIPPING_PLANE), player.pos);
        const wing = Vec2.mul(Vec2.norm(Vec2.rot90(Vec2.sub(Vec2.clone(p), player.pos))), l);
        const p1 = Vec2.sub(Vec2.clone(p), wing);
        const p2 = Vec2.add(Vec2.clone(p), wing);
        return [p1, p2];
    };
})(Player || (Player = {}));
const hittingCell = (p1, p2) => {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    return Vec2.create(Math.floor(p2.x + Math.sign(dx) * EPS), Math.floor(p2.y + Math.sign(dy) * EPS));
};
const snap = (x, dx) => {
    if (dx > 0)
        return Math.ceil(x + Math.sign(dx) * EPS);
    if (dx < 0)
        return Math.floor(x + Math.sign(dx) * EPS);
    return x;
};
const rayStep = (p1, p2) => {
    let p3 = Vec2.clone(p2);
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    if (dx !== 0) {
        const m = dy / dx;
        const p = p1.y - m * p1.x;
        {
            const x3 = snap(p2.x, dx);
            const y3 = m * x3 + p;
            Vec2.copy(p3, x3, y3);
        }
        if (m !== 0) {
            const y3 = snap(p2.y, dy);
            const x3 = (y3 - p) / m;
            if (Vec2.sqrDist(p2, x3, y3) < Vec2.sqrDist(p2, p3)) {
                Vec2.copy(p3, x3, y3);
            }
        }
    }
    else {
        const y3 = snap(p2.y, dy);
        const x3 = p2.x;
        Vec2.copy(p3, x3, y3);
    }
    return p3;
};
const rayCast = (scene, p1, p2) => {
    let start = p1;
    while (Vec2.sqrDist(start, p1) < FAR_CLIPPING_PLANE * FAR_CLIPPING_PLANE) {
        const c = hittingCell(p1, p2);
        if (Scene.isWall(scene, c))
            break;
        const p3 = rayStep(p1, p2);
        p1 = p2;
        p2 = p3;
    }
    return p2;
};
export const update = ({ scene, player, keyPressed }, deltaTime) => {
    Vec2.copy(player.velocity, 0);
    let angularVelocity = 0;
    if (keyPressed('ArrowUp')) {
        Vec2.add(player.velocity, Vec2.fromAngle(player.dir, PLAYER_SPEED));
    }
    if (keyPressed('ArrowDown')) {
        Vec2.sub(player.velocity, Vec2.fromAngle(player.dir, PLAYER_SPEED));
    }
    if (keyPressed('ArrowLeft')) {
        angularVelocity -= Math.PI / 2;
    }
    if (keyPressed('ArrowRight')) {
        angularVelocity += Math.PI / 2;
    }
    player.dir += angularVelocity * deltaTime;
    const nx = player.pos.x + player.velocity.x * deltaTime;
    if (Scene.rectFits(scene, nx, player.pos.y, MINIMAP_PLAYER_SIZE, MINIMAP_PLAYER_SIZE)) {
        player.pos.x = nx;
    }
    const ny = player.pos.y + player.velocity.y * deltaTime;
    if (Scene.rectFits(scene, player.pos.x, ny, MINIMAP_PLAYER_SIZE, MINIMAP_PLAYER_SIZE)) {
        player.pos.y = ny;
    }
};
const renderFloorAndCeiling = ({ display: { backImageData }, scene, player }) => {
    const pz = backImageData.height / 2;
    const [p1, p2] = Player.fovRange(player);
    const t = Vec2.create();
    const t1 = Vec2.create();
    const t2 = Vec2.create();
    const bp = Vec2.len(Vec2.sub(Vec2.copy(t1, p1), player.pos));
    for (let y = Math.floor(backImageData.height / 2); y < backImageData.height; y++) {
        const sz = backImageData.height - y - 1;
        const ap = pz - sz;
        const b = bp / ap * pz / NEAR_CLIPPING_PLANE;
        Vec2.add(Vec2.mul(Vec2.norm(Vec2.sub(Vec2.copy(t1, p1), player.pos)), b), player.pos);
        Vec2.add(Vec2.mul(Vec2.norm(Vec2.sub(Vec2.copy(t2, p2), player.pos)), b), player.pos);
        for (let x = 0; x < backImageData.width; x++) {
            Vec2.lerp(Vec2.copy(t, t1), t2, x / backImageData.width);
            let floor = Scene.getFloor(scene, t);
            if (floor !== null) {
                switch (floor.kind) {
                    case 'empty':
                        floor = Tile.color(RGBA.create(0, 0, 0, 1));
                    case 'color':
                        {
                            const shadow = Vec2.dist(player.pos, t) * 255;
                            const destP = (y * backImageData.width + x) * 4;
                            // @ts-ignore
                            backImageData.data[destP + 0] = floor.color.r * shadow;
                            // @ts-ignore
                            backImageData.data[destP + 1] = floor.color.g * shadow;
                            // @ts-ignore
                            backImageData.data[destP + 2] = floor.color.b * shadow;
                        }
                        break;
                    case 'image':
                        {
                            const shadow = Math.min(1 / Vec2.dist(player.pos, t) * 2, 1);
                            const sx = Math.floor((t.x - Math.floor(t.x)) * floor.image.width);
                            const sy = Math.floor((t.y - Math.floor(t.y)) * floor.image.height);
                            const destP = (y * backImageData.width + x) * 4;
                            const srcP = (sy * floor.image.width + sx) * 4;
                            backImageData.data[destP + 0] = floor.image.data[srcP + 0] * shadow;
                            backImageData.data[destP + 1] = floor.image.data[srcP + 1] * shadow;
                            backImageData.data[destP + 2] = floor.image.data[srcP + 2] * shadow;
                        }
                        break;
                    default: Tile.throwBad(floor);
                }
            }
            let ceiling = Scene.getCeiling(scene, t);
            if (ceiling !== null) {
                switch (ceiling.kind) {
                    case 'empty':
                        ceiling = Tile.color(RGBA.create(0, 0, 0, 1));
                    case 'color':
                        {
                            const shadow = Vec2.dist(player.pos, t) * 255;
                            const destP = (sz * backImageData.width + x) * 4;
                            // @ts-ignore
                            backImageData.data[destP + 0] = ceiling.color.r * shadow;
                            // @ts-ignore
                            backImageData.data[destP + 1] = ceiling.color.g * shadow;
                            // @ts-ignore
                            backImageData.data[destP + 2] = ceiling.color.b * shadow;
                        }
                        break;
                    case 'image':
                        {
                            const shadow = Math.min(1 / Vec2.dist(player.pos, t) * 2, 1);
                            const sx = Math.floor((t.x - Math.floor(t.x)) * ceiling.image.width);
                            const sy = Math.floor((t.y - Math.floor(t.y)) * ceiling.image.height);
                            const destP = (sz * backImageData.width + x) * 4;
                            const srcP = (sy * ceiling.image.width + sx) * 4;
                            backImageData.data[destP + 0] = ceiling.image.data[srcP + 0] * shadow;
                            backImageData.data[destP + 1] = ceiling.image.data[srcP + 1] * shadow;
                            backImageData.data[destP + 2] = ceiling.image.data[srcP + 2] * shadow;
                        }
                        break;
                    default: Tile.throwBad(ceiling);
                }
            }
        }
    }
};
const renderWalls = ({ display: { backImageData }, scene, player }) => {
    const [p1, p2] = Player.fovRange(player);
    const d = Vec2.fromAngle(player.dir);
    for (let x = 0; x < backImageData.width; x++) {
        const p = rayCast(scene, player.pos, Vec2.lerp(Vec2.clone(p1), p2, x / backImageData.width));
        const c = hittingCell(player.pos, p);
        let wall = Scene.getWall(scene, c);
        if (wall !== null) {
            const v = Vec2.sub(Vec2.clone(p), player.pos);
            const dot = Vec2.dot(v, d);
            const stripeHeight = backImageData.height / dot;
            switch (wall.kind) {
                case 'empty':
                    wall = Tile.color(RGBA.create(0, 0, 0, 1));
                case 'color':
                    {
                        const shadow = 1 / dot * 2;
                        for (let dy = 0; dy < Math.ceil(stripeHeight); ++dy) {
                            const y = Math.floor((backImageData.height - stripeHeight) * 0.5) + dy;
                            const destP = (y * backImageData.width + x) * 4;
                            // @ts-ignore
                            backImageData.data[destP + 0] = wall.color.r * shadow * 255;
                            // @ts-ignore
                            backImageData.data[destP + 1] = wall.color.g * shadow * 255;
                            // @ts-ignore
                            backImageData.data[destP + 2] = wall.color.b * shadow * 255;
                        }
                    }
                    break;
                case 'image':
                    {
                        const t = Vec2.sub(Vec2.clone(p), c);
                        let u = 0;
                        if (Math.abs(t.x) < EPS && t.y > 0) {
                            u = t.y;
                        }
                        else if (Math.abs(t.x - 1) < EPS && t.y > 0) {
                            u = 1 - t.y;
                        }
                        else if (Math.abs(t.y) < EPS && t.x > 0) {
                            u = 1 - t.x;
                        }
                        else {
                            u = t.x;
                        }
                        const y1 = Math.floor((backImageData.height - stripeHeight) / 2);
                        const y2 = Math.floor(y1 + stripeHeight);
                        const by1 = Math.max(0, y1);
                        const by2 = Math.min(backImageData.height - 1, y2);
                        const tx = Math.floor(u * wall.image.width);
                        const sh = (1 / Math.ceil(stripeHeight)) * wall.image.height;
                        const shadow = Math.min(1 / dot * 2, 1);
                        for (let y = by1; y <= by2; ++y) {
                            const ty = Math.floor((y - y1) * sh);
                            const destP = (y * backImageData.width + x) * 4;
                            const srcP = (ty * wall.image.width + tx) * 4;
                            backImageData.data[destP + 0] = wall.image.data[srcP + 0] * shadow;
                            backImageData.data[destP + 1] = wall.image.data[srcP + 1] * shadow;
                            backImageData.data[destP + 2] = wall.image.data[srcP + 2] * shadow;
                        }
                    }
                    break;
                default: Tile.throwBad(wall);
            }
        }
    }
};
const renderMinimap = ({ display: { ctx }, scene, player }) => {
    ctx.save();
    ctx.translate(ctx.canvas.width * 0.02, ctx.canvas.width * 0.02);
    ctx.scale(ctx.canvas.width * MINIMAP_SCALE, ctx.canvas.width * MINIMAP_SCALE);
    ctx.fillStyle = '#fbf1c7';
    ctx.fillRect(0, 0, scene.width, scene.height);
    for (let y = 0; y < scene.height; y++) {
        for (let x = 0; x < scene.width; x++) {
            if (Scene.isWall(scene, x, y)) {
                ctx.fillStyle = '#3c3836';
                ctx.fillRect(x, y, 1, 1);
            }
        }
    }
    ctx.lineWidth = 0.02;
    ctx.strokeStyle = '#3c3836';
    for (let y = 0; y <= scene.height; y++) {
        ctx.strokeLine(0, y, scene.width, y);
    }
    for (let x = 0; x <= scene.width; x++) {
        ctx.strokeLine(x, 0, x, scene.height);
    }
    ctx.lineWidth = 0.05;
    ctx.strokeStyle = '#8f3f71';
    ctx.strokeRect(player.pos.x - MINIMAP_PLAYER_SIZE / 2, player.pos.y - MINIMAP_PLAYER_SIZE / 2, MINIMAP_PLAYER_SIZE, MINIMAP_PLAYER_SIZE);
    const [p1, p2] = Player.fovRange(player);
    ctx.strokeLine(player.pos.x, player.pos.y, p1.x, p1.y);
    ctx.strokeLine(player.pos.x, player.pos.y, p2.x, p2.y);
    ctx.strokeLine(p1.x, p1.y, p2.x, p2.y);
    ctx.restore();
};
export const render = (game) => {
    const { display: { ctx } } = game;
    renderFloorAndCeiling(game);
    renderWalls(game);
    Display.swapBack(game.display);
    if (MINIMAP_ENABLED) {
        renderMinimap(game);
    }
    ctx.fillStyle = 'white';
    ctx.font = '32px Arial';
    ctx.fillText(`FPS: ${game.fps}`, 15, 40);
};
//# sourceMappingURL=game.js.map