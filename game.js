const EPS = 1e-6;
const NEAR_CLIPPING_PLANE = 0.1;
const FAR_CLIPPING_PLANE = 10;
const FOV = Math.PI / 2;
const COS_HALF_FOV = Math.cos(FOV / 2);
const PLAYER_RADIUS = 0.5;
const ITEM_FREQ = 1;
const ITEM_AMP = 0.03;
const MINIMAP_ENABLED = false;
const MINIMAP_SPRITES = true;
const MINIMAP_SCALE = 0.03;
const MINIMAP_PLAYER_SIZE = 0.5;
const MINIMAP_SPRITE_SIZE = 0.3;
const PLAYER_SPEED = 2;
Math.clamp = (x, min, max) => {
    return Math.max(min, Math.min(max, x));
};
CanvasRenderingContext2D.prototype.strokeLine = function (x1, y1, x2, y2) {
    this.beginPath();
    this.moveTo(x1, y1);
    this.lineTo(x2, y2);
    this.stroke();
};
CanvasRenderingContext2D.prototype.fillCircle = function (x, y, radius) {
    this.beginPath();
    this.arc(x, y, radius, 0, 2 * Math.PI);
    this.fill();
};
export var Vec2;
(function (Vec2) {
    Vec2.create = (x = 0, y = x) => ({ x, y });
    Vec2.isVec2 = (object) => {
        return typeof object === 'object' && 'x' in object && 'y' in object;
    };
    Vec2.array = (v) => [v.x, v.y];
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
export var Vec3;
(function (Vec3) {
    Vec3.create = (x = 0, y = x, z = y) => ({ x, y, z });
    Vec3.isVec3 = (object) => {
        return typeof object === 'object' && 'x' in object && 'y' in object && 'z' in object;
    };
    Vec3.clone2 = (v) => {
        return Vec2.create(v.x, v.y);
    };
    Vec3.copy2 = (a, b, z) => {
        a.x = b.x;
        a.y = b.y;
        a.z = z;
        return a;
    };
    Vec3.mul = (v, x, y, z) => {
        if (Vec3.isVec3(x)) {
            v.x *= x.x;
            v.y *= x.y;
            v.z *= x.z;
        }
        else {
            v.x *= x;
            v.y *= y ?? x;
            v.z *= z ?? y ?? x;
        }
        return v;
    };
    Vec3.sqrLen = (v) => {
        return v.x * v.x + v.y * v.y + v.z * v.z;
    };
    Vec3.len = (v) => {
        return Math.sqrt(Vec3.sqrLen(v));
    };
})(Vec3 || (Vec3 = {}));
export var RGBA;
(function (RGBA) {
    RGBA.create = (r = 0, g = 0, b = 0, a = 0) => ({ r, g, b, a });
    RGBA.black = RGBA.create(0, 0, 0, 1);
    RGBA.white = RGBA.create(1, 1, 1, 1);
    RGBA.red = RGBA.create(1, 0, 0, 1);
    RGBA.green = RGBA.create(0, 1, 0, 1);
    RGBA.blue = RGBA.create(0, 0, 1, 1);
    RGBA.cyan = RGBA.create(0, 1, 1, 1);
    RGBA.magenta = RGBA.create(1, 0, 1, 1);
    RGBA.yellow = RGBA.create(1, 1, 0, 1);
    RGBA.toString = (color, brightness = 1) => {
        return `rgba(${Math.floor(color.r * brightness * 255)}, ${Math.floor(color.g * brightness * 255)}, ${Math.floor(color.b * brightness * 255)}, ${color.a})`;
    };
})(RGBA || (RGBA = {}));
export var Display;
(function (Display) {
    Display.create = (ctx, backCtx, backImageData) => ({
        ctx,
        backCtx,
        backImageData,
        zBuffer: new Array(backImageData.width).fill(0),
    });
    Display.swapBuffers = ({ ctx, backCtx, backImageData }) => {
        backCtx.putImageData(backImageData, 0, 0);
        ctx.drawImage(backCtx.canvas, 0, 0, ctx.canvas.width, ctx.canvas.height);
    };
})(Display || (Display = {}));
export var Tile;
(function (Tile) {
    Tile.empty = { kind: 'empty' };
    Tile.color = (color) => ({ kind: 'color', color });
    Tile.texture = (texture) => ({ kind: 'texture', texture });
    function throwBad(tile) {
        throw new Error(`Unknown tile kind: ${tile.kind}`);
    }
    Tile.throwBad = throwBad;
    ;
})(Tile || (Tile = {}));
export var Scene;
(function (Scene) {
    Scene.create = (walls, floors, ceilings, items) => {
        return {
            walls: walls.flat(),
            floors: floors.flat(),
            ceilings: ceilings.flat(),
            spritePool: { items: [], count: 0 },
            visibleSprites: [],
            items,
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
    Scene.pushSprite = ({ spritePool }, texture, pos, z, scale) => {
        if (spritePool.items.length <= spritePool.count) {
            spritePool.items.push({
                texture,
                pos,
                z,
                scale,
                pDist: 0,
                t: 0,
            });
        }
        else {
            spritePool.items[spritePool.count].texture = texture;
            spritePool.items[spritePool.count].pos = pos;
            spritePool.items[spritePool.count].z = z;
            spritePool.items[spritePool.count].scale = scale;
        }
        spritePool.count++;
    };
})(Scene || (Scene = {}));
export var Player;
(function (Player) {
    Player.create = (x, y, dir) => ({ pos: Vec2.create(x, y), dir, velocity: Vec2.create() });
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
export const update = ({ scene, player, time, keyPressed }, deltaTime) => {
    Vec2.copy(player.velocity, 0);
    let angularVelocity = 0;
    if (keyPressed('ArrowUp', false)) {
        Vec2.add(player.velocity, Vec2.fromAngle(player.dir, PLAYER_SPEED));
    }
    if (keyPressed('ArrowDown', false)) {
        Vec2.sub(player.velocity, Vec2.fromAngle(player.dir, PLAYER_SPEED));
    }
    if (keyPressed('ArrowLeft', false)) {
        angularVelocity -= Math.PI / 2;
    }
    if (keyPressed('ArrowRight', false)) {
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
    for (let item of scene.items) {
        if (item.alive) {
            if (Vec2.sqrDist(player.pos, item.pos) < PLAYER_RADIUS * PLAYER_RADIUS) {
                item.pickupAudio.currentTime = 0;
                item.pickupAudio.play();
                item.alive = false;
            }
        }
    }
    scene.spritePool.count = 0;
    for (let item of scene.items) {
        if (item.alive) {
            Scene.pushSprite(scene, item.texture, item.pos, 0.4 + ITEM_AMP - ITEM_AMP * Math.sin(ITEM_FREQ * Math.PI * time + item.pos.x + item.pos.y), 0.4);
        }
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
        const colorShadow = Vec2.dist(player.pos, t) * 255;
        const textureShadow = Math.min(1 / Vec2.dist(player.pos, t) * 2, 1);
        for (let x = 0; x < backImageData.width; x++) {
            Vec2.lerp(Vec2.copy(t, t1), t2, x / backImageData.width);
            let floor = Scene.getFloor(scene, t);
            if (floor !== null) {
                switch (floor.kind) {
                    case 'empty':
                        floor = Tile.color(RGBA.black);
                    case 'color':
                        {
                            const destP = (y * backImageData.width + x) * 4;
                            // @ts-ignore
                            backImageData.data[destP + 0] = floor.color.r * colorShadow;
                            // @ts-ignore
                            backImageData.data[destP + 1] = floor.color.g * colorShadow;
                            // @ts-ignore
                            backImageData.data[destP + 2] = floor.color.b * colorShadow;
                        }
                        break;
                    case 'texture':
                        {
                            const sx = Math.floor((t.x - Math.floor(t.x)) * floor.texture.width);
                            const sy = Math.floor((t.y - Math.floor(t.y)) * floor.texture.height);
                            const destP = (y * backImageData.width + x) * 4;
                            const srcP = (sy * floor.texture.width + sx) * 4;
                            backImageData.data[destP + 0] = floor.texture.data[srcP + 0] * textureShadow;
                            backImageData.data[destP + 1] = floor.texture.data[srcP + 1] * textureShadow;
                            backImageData.data[destP + 2] = floor.texture.data[srcP + 2] * textureShadow;
                        }
                        break;
                    default: Tile.throwBad(floor);
                }
            }
            let ceiling = Scene.getCeiling(scene, t);
            if (ceiling !== null) {
                switch (ceiling.kind) {
                    case 'empty':
                        ceiling = Tile.color(RGBA.black);
                    case 'color':
                        {
                            const destP = (sz * backImageData.width + x) * 4;
                            // @ts-ignore
                            backImageData.data[destP + 0] = ceiling.color.r * colorShadow;
                            // @ts-ignore
                            backImageData.data[destP + 1] = ceiling.color.g * colorShadow;
                            // @ts-ignore
                            backImageData.data[destP + 2] = ceiling.color.b * colorShadow;
                        }
                        break;
                    case 'texture':
                        {
                            const sx = Math.floor((t.x - Math.floor(t.x)) * ceiling.texture.width);
                            const sy = Math.floor((t.y - Math.floor(t.y)) * ceiling.texture.height);
                            const destP = (sz * backImageData.width + x) * 4;
                            const srcP = (sy * ceiling.texture.width + sx) * 4;
                            backImageData.data[destP + 0] = ceiling.texture.data[srcP + 0] * textureShadow;
                            backImageData.data[destP + 1] = ceiling.texture.data[srcP + 1] * textureShadow;
                            backImageData.data[destP + 2] = ceiling.texture.data[srcP + 2] * textureShadow;
                        }
                        break;
                    default: Tile.throwBad(ceiling);
                }
            }
        }
    }
};
const renderWalls = ({ display: { backImageData, zBuffer }, scene, player }) => {
    const [p1, p2] = Player.fovRange(player);
    const d = Vec2.fromAngle(player.dir);
    for (let x = 0; x < backImageData.width; x++) {
        const p = rayCast(scene, player.pos, Vec2.lerp(Vec2.clone(p1), p2, x / backImageData.width));
        const c = hittingCell(player.pos, p);
        let wall = Scene.getWall(scene, c);
        if (wall !== null) {
            const v = Vec2.sub(Vec2.clone(p), player.pos);
            zBuffer[x] = Vec2.dot(v, d);
            const stripeHeight = backImageData.height / zBuffer[x];
            switch (wall.kind) {
                case 'empty':
                    wall = Tile.color(RGBA.black);
                case 'color':
                    {
                        const shadow = 1 / zBuffer[x] * 2;
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
                case 'texture':
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
                        const tx = Math.floor(u * wall.texture.width);
                        const sh = (1 / Math.ceil(stripeHeight)) * wall.texture.height;
                        const shadow = Math.min(1 / zBuffer[x] * 2, 1);
                        for (let y = by1; y <= by2; ++y) {
                            const ty = Math.floor((y - y1) * sh);
                            const destP = (y * backImageData.width + x) * 4;
                            const srcP = (ty * wall.texture.width + tx) * 4;
                            backImageData.data[destP + 0] = wall.texture.data[srcP + 0] * shadow;
                            backImageData.data[destP + 1] = wall.texture.data[srcP + 1] * shadow;
                            backImageData.data[destP + 2] = wall.texture.data[srcP + 2] * shadow;
                        }
                    }
                    break;
                default: Tile.throwBad(wall);
            }
        }
    }
};
const renderSprites = ({ display: { backImageData, zBuffer }, scene, player }) => {
    const sp = Vec2.create();
    const d = Vec2.fromAngle(player.dir);
    const [p1, p2] = Player.fovRange(player);
    const fov = Vec2.sub(Vec2.clone(p2), p1);
    scene.visibleSprites.length = 0;
    for (let i = 0; i < scene.spritePool.count; i++) {
        const sprite = scene.spritePool.items[i];
        Vec2.sub(Vec2.copy(sp, sprite.pos), player.pos);
        const spl = Vec2.len(sp);
        if (spl <= NEAR_CLIPPING_PLANE || spl >= FAR_CLIPPING_PLANE)
            continue;
        const cos = Vec2.dot(sp, d) / spl;
        if (cos < 0)
            continue;
        const dist = NEAR_CLIPPING_PLANE / cos;
        Vec2.sub(Vec2.add(Vec2.mul(Vec2.norm(sp), dist), player.pos), p1);
        sprite.t = Vec2.len(sp) / Vec2.len(fov) * Math.sign(Vec2.dot(sp, fov));
        sprite.pDist = Vec2.dot(Vec2.sub(Vec2.clone(sprite.pos), player.pos), d);
        scene.visibleSprites.push(sprite);
    }
    scene.visibleSprites.sort((a, b) => b.pDist - a.pDist);
    for (let sprite of scene.visibleSprites) {
        const shadow = 1 - sprite.pDist / FAR_CLIPPING_PLANE;
        const cx = Math.floor(backImageData.width * sprite.t);
        const cy = Math.floor(backImageData.height / 2);
        const maxSpriteSize = backImageData.height / sprite.pDist;
        const spriteSize = maxSpriteSize * sprite.scale;
        const x1 = Math.floor(cx - spriteSize / 2);
        const x2 = Math.floor(x1 + spriteSize - 1);
        const bx1 = Math.max(0, x1);
        const bx2 = Math.min(backImageData.width - 1, x2);
        const y1 = Math.floor(cy + maxSpriteSize / 2 - maxSpriteSize * sprite.z);
        const y2 = Math.floor(y1 + spriteSize - 1);
        const by1 = Math.max(0, y1);
        const by2 = Math.min(backImageData.height - 1, y2);
        for (let x = bx1; x < bx2; x++) {
            if (sprite.pDist < zBuffer[x]) {
                for (let y = by1; y < by2; y++) {
                    const tx = Math.floor((x - x1) / spriteSize * sprite.texture.width);
                    const ty = Math.floor((y - y1) / spriteSize * sprite.texture.height);
                    const destP = (y * backImageData.width + x) * 4;
                    const srcP = (ty * sprite.texture.width + tx) * 4;
                    const alpha = sprite.texture.data[srcP + 3] / 255;
                    backImageData.data[destP + 0] = backImageData.data[destP + 0] * (1 - alpha) + sprite.texture.data[srcP + 0] * shadow * alpha;
                    backImageData.data[destP + 1] = backImageData.data[destP + 1] * (1 - alpha) + sprite.texture.data[srcP + 1] * shadow * alpha;
                    backImageData.data[destP + 2] = backImageData.data[destP + 2] * (1 - alpha) + sprite.texture.data[srcP + 2] * shadow * alpha;
                }
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
    if (MINIMAP_SPRITES) {
        ctx.fillStyle = '#9d0006';
        ctx.strokeStyle = '#b57614';
        const sp = Vec2.create();
        const d = Vec2.fromAngle(player.dir);
        ctx.strokeLine(player.pos.x, player.pos.y, ...Vec2.array(Vec2.add(Vec2.clone(player.pos), d)));
        for (let i = 0; i < scene.spritePool.count; i++) {
            const sprite = scene.spritePool.items[i];
            ctx.fillRect(sprite.pos.x - MINIMAP_SPRITE_SIZE / 2, sprite.pos.y - MINIMAP_SPRITE_SIZE / 2, MINIMAP_SPRITE_SIZE, MINIMAP_SPRITE_SIZE);
            Vec2.sub(Vec2.copy(sp, sprite.pos), player.pos);
            ctx.strokeLine(player.pos.x, player.pos.y, ...Vec2.array(Vec2.add(Vec2.clone(player.pos), sp)));
            const spl = Vec2.len(sp);
            if (spl === 0)
                continue;
            const dot = Vec2.dot(sp, d) / spl;
            if (!(COS_HALF_FOV <= dot && dot <= 1))
                continue;
            const dist = NEAR_CLIPPING_PLANE / dot;
            Vec2.add(Vec2.mul(Vec2.norm(sp), dist), player.pos);
            ctx.fillRect(sp.x - MINIMAP_SPRITE_SIZE / 2, sp.y - MINIMAP_SPRITE_SIZE / 2, MINIMAP_SPRITE_SIZE, MINIMAP_SPRITE_SIZE);
        }
    }
    ctx.restore();
};
const renderFPS = ({ display: { ctx }, fps }) => {
    ctx.fillStyle = 'white';
    ctx.font = '32px Arial';
    ctx.fillText(`FPS: ${fps}`, 15, 40);
};
export const render = (game) => {
    renderFloorAndCeiling(game);
    renderWalls(game);
    renderSprites(game);
    Display.swapBuffers(game.display);
    if (MINIMAP_ENABLED) {
        renderMinimap(game);
    }
    renderFPS(game);
};
//# sourceMappingURL=game.js.map