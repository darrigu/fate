class Vector2 {
    x;
    y;
    constructor(x = 0, y = x) {
        this.x = x;
        this.y = y;
    }
    static fromAngle(angle, len = 1) {
        return new Vector2(Math.cos(angle) * len, Math.sin(angle) * len);
    }
    clone() {
        return new Vector2(this.x, this.y);
    }
    copy(x, y) {
        if (x instanceof Vector2) {
            this.x = x.x;
            this.y = x.y;
        }
        else {
            this.x = x;
            this.y = y ?? x;
        }
        return this;
    }
    add(x, y) {
        if (x instanceof Vector2) {
            this.x += x.x;
            this.y += x.y;
        }
        else {
            this.x += x;
            this.y += y ?? x;
        }
        return this;
    }
    sub(x, y) {
        if (x instanceof Vector2) {
            this.x -= x.x;
            this.y -= x.y;
        }
        else {
            this.x -= x;
            this.y -= y ?? x;
        }
        return this;
    }
    mul(x, y) {
        if (x instanceof Vector2) {
            this.x *= x.x;
            this.y *= x.y;
        }
        else {
            this.x *= x;
            this.y *= y ?? x;
        }
        return this;
    }
    div(x, y) {
        if (x instanceof Vector2) {
            this.x /= x.x;
            this.y /= x.y;
        }
        else {
            this.x /= x;
            this.y /= y ?? x;
        }
        return this;
    }
    sqrDistTo(x, y) {
        if (x instanceof Vector2) {
            const dx = x.x - this.x;
            const dy = x.y - this.y;
            return dx * dx + dy * dy;
        }
        else {
            const dx = x - this.x;
            const dy = (y ?? x) - this.y;
            return dx * dx + dy * dy;
        }
    }
    rot90() {
        const oldX = this.x;
        this.x = -this.y;
        this.y = oldX;
        return this;
    }
    sqrLen() {
        return this.x * this.x + this.y * this.y;
    }
    len() {
        return Math.sqrt(this.sqrLen());
    }
    norm() {
        const l = this.len();
        return l === 0 ? this : this.mul(1 / l);
    }
    lerp(that, t) {
        this.x += (that.x - this.x) * t;
        this.y += (that.y - this.y) * t;
        return this;
    }
    dot(that) {
        return this.x * that.x + this.y * that.y;
    }
}
class RGBA {
    r;
    g;
    b;
    a;
    static red = new RGBA(1, 0, 0, 1);
    static green = new RGBA(0, 1, 0, 1);
    static blue = new RGBA(0, 0, 1, 1);
    constructor(r, g, b, a) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }
    toString(brightness = 1) {
        return `rgba(${Math.floor(this.r * brightness * 255)}, ${Math.floor(this.g * brightness * 255)}, ${Math.floor(this.b * brightness * 255)}, ${this.a})`;
    }
}
const canvas = document.querySelector('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;
CanvasRenderingContext2D.prototype.strokeLine = function (x1, y1, x2, y2) {
    this.beginPath();
    if (x1 instanceof Vector2) {
        this.moveTo(x1.x, x1.y);
        this.lineTo(y1.x, y1.y);
    }
    else {
        this.moveTo(x1, y1);
        this.lineTo(x2, y2);
    }
    this.stroke();
};
CanvasRenderingContext2D.prototype.fillCircle = function (x, y, radius) {
    this.beginPath();
    if (x instanceof Vector2) {
        this.arc(x.x, x.y, y, 0, 2 * Math.PI);
    }
    else {
        this.arc(x, y, radius, 0, 2 * Math.PI);
    }
    this.fill();
};
const EPS = 1e-6;
const NEAR_CLIPPING_PLANE = 0.1;
const FAR_CLIPPING_PLANE = 10;
const FOV = Math.PI / 2;
const SCREEN_FACTOR = 20;
const SCREEN_WIDTH = 16 * SCREEN_FACTOR;
const SCREEN_HEIGHT = 9 * SCREEN_FACTOR;
const MINIMAP_SCALE = 0.03;
const MINIMAP_PLAYER_SIZE = 0.5;
const PLAYER_SPEED = 2;
const emptyCell = () => ({ kind: 'empty' });
const colorCell = (color) => ({ kind: 'color', color });
const imageCell = (image) => ({ kind: 'image', image });
function throwBadCell(cell) {
    throw new Error(`Unknown cell kind: ${cell.kind}`);
}
class Scene {
    cells;
    width;
    height;
    constructor(cells) {
        this.cells = cells.flat();
        this.width = cells[0].length;
        this.height = cells.length;
    }
    get size() {
        return new Vector2(this.width, this.height);
    }
    contains(x, y) {
        if (x instanceof Vector2) {
            return 0 <= x.x && x.x < this.width && 0 <= x.y && x.y < this.height;
        }
        else {
            return 0 <= x && x < this.width && 0 <= y && y < this.height;
        }
    }
    get(x, y) {
        if (!this.contains(x, y))
            return null;
        if (x instanceof Vector2) {
            return this.cells[x.y * this.width + x.x];
        }
        else {
            return this.cells[y * this.width + x];
        }
    }
    isWall(x, y) {
        const cell = scene.get(x, y);
        return cell !== null && cell.kind !== 'empty';
    }
    rectFits(px, py, sx, sy) {
        const x1 = Math.floor(px - sx / 2);
        const x2 = Math.floor(px + sx / 2);
        const y1 = Math.floor(py - sy / 2);
        const y2 = Math.floor(py + sy / 2);
        for (let x = x1; x <= x2; x++) {
            for (let y = y1; y <= y2; y++) {
                if (this.isWall(x, y)) {
                    return false;
                }
            }
        }
        return true;
    }
}
class Player {
    pos;
    dir;
    velocity = new Vector2();
    constructor(pos, dir) {
        this.pos = pos;
        this.dir = dir;
    }
    fovRange() {
        const l = Math.tan(FOV / 2) * NEAR_CLIPPING_PLANE;
        const p = Vector2.fromAngle(this.dir, NEAR_CLIPPING_PLANE).add(this.pos);
        const wing = p.clone().sub(this.pos).rot90().norm().mul(l);
        const p1 = p.clone().sub(wing);
        const p2 = p.clone().add(wing);
        return [p1, p2];
    }
}
const hittingCell = (p1, p2) => {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    return new Vector2(Math.floor(p2.x + Math.sign(dx) * EPS), Math.floor(p2.y + Math.sign(dy) * EPS));
};
const snap = (x, dx) => {
    if (dx > 0)
        return Math.ceil(x + Math.sign(dx) * EPS);
    if (dx < 0)
        return Math.floor(x + Math.sign(dx) * EPS);
    return x;
};
const rayStep = (p1, p2) => {
    let p3 = p2.clone();
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    if (dx !== 0) {
        const m = dy / dx;
        const p = p1.y - m * p1.x;
        {
            const x3 = snap(p2.x, dx);
            const y3 = m * x3 + p;
            p3.copy(x3, y3);
        }
        if (m !== 0) {
            const y3 = snap(p2.y, dy);
            const x3 = (y3 - p) / m;
            if (p2.sqrDistTo(x3, y3) < p2.sqrDistTo(p3)) {
                p3.copy(x3, y3);
            }
        }
    }
    else {
        const y3 = snap(p2.y, dy);
        const x3 = p2.x;
        p3.copy(x3, y3);
    }
    return p3;
};
const rayCast = (scene, p1, p2) => {
    let start = p1;
    while (start.sqrDistTo(p1) < FAR_CLIPPING_PLANE * FAR_CLIPPING_PLANE) {
        const c = hittingCell(p1, p2);
        if (scene.isWall(c))
            break;
        const p3 = rayStep(p1, p2);
        p1 = p2;
        p2 = p3;
    }
    return p2;
};
const loadImage = async (url) => {
    const image = new Image();
    image.src = url;
    return new Promise((resolve, reject) => {
        image.onload = () => resolve(image);
        image.onerror = reject;
    });
};
const loadImageData = async (url) => {
    const image = await loadImage(url);
    const canvas = new OffscreenCanvas(image.width, image.height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(image, 0, 0);
    return ctx.getImageData(0, 0, image.width, image.height);
};
const [brickWall] = await Promise.all([
    loadImage('./assets/images/brick_wall.png'),
]);
const scene = new Scene([
    [emptyCell(), emptyCell(), imageCell(brickWall), imageCell(brickWall), emptyCell(), emptyCell(), emptyCell(), emptyCell(), emptyCell()],
    [emptyCell(), emptyCell(), emptyCell(), imageCell(brickWall), emptyCell(), emptyCell(), emptyCell(), emptyCell(), emptyCell()],
    [emptyCell(), imageCell(brickWall), imageCell(brickWall), imageCell(brickWall), emptyCell(), emptyCell(), emptyCell(), emptyCell(), emptyCell()],
    [emptyCell(), emptyCell(), emptyCell(), emptyCell(), emptyCell(), emptyCell(), emptyCell(), emptyCell(), emptyCell()],
    [emptyCell(), emptyCell(), emptyCell(), emptyCell(), emptyCell(), emptyCell(), emptyCell(), emptyCell(), emptyCell()],
    [emptyCell(), emptyCell(), emptyCell(), emptyCell(), emptyCell(), emptyCell(), emptyCell(), emptyCell(), emptyCell()],
    [emptyCell(), emptyCell(), emptyCell(), emptyCell(), emptyCell(), emptyCell(), emptyCell(), emptyCell(), emptyCell()],
]);
const player = new Player(scene.size.clone().mul(0.63, 0.63), Math.PI * 1.25);
const keys = {};
let lastTime = performance.now();
window.addEventListener('keydown', (event) => {
    keys[event.key] = true;
});
window.addEventListener('keyup', (event) => {
    keys[event.key] = false;
});
const update = (deltaTime) => {
    player.velocity.copy(0);
    let angularVelocity = 0;
    if (keys['ArrowUp']) {
        player.velocity.add(Vector2.fromAngle(player.dir, PLAYER_SPEED));
    }
    if (keys['ArrowDown']) {
        player.velocity.sub(Vector2.fromAngle(player.dir, PLAYER_SPEED));
    }
    if (keys['ArrowLeft']) {
        angularVelocity -= Math.PI / 2;
    }
    if (keys['ArrowRight']) {
        angularVelocity += Math.PI / 2;
    }
    player.dir += angularVelocity * deltaTime;
    const nx = player.pos.x + player.velocity.x * deltaTime;
    if (scene.rectFits(nx, player.pos.y, MINIMAP_PLAYER_SIZE, MINIMAP_PLAYER_SIZE)) {
        player.pos.x = nx;
    }
    const ny = player.pos.y + player.velocity.y * deltaTime;
    if (scene.rectFits(player.pos.x, ny, MINIMAP_PLAYER_SIZE, MINIMAP_PLAYER_SIZE)) {
        player.pos.y = ny;
    }
};
const renderWalls = () => {
    const [p1, p2] = player.fovRange();
    const d = Vector2.fromAngle(player.dir);
    for (let x = 0; x < SCREEN_WIDTH; x++) {
        const p = rayCast(scene, player.pos, p1.clone().lerp(p2, x / SCREEN_WIDTH));
        const c = hittingCell(player.pos, p);
        const cell = scene.get(c);
        if (cell !== null) {
            const v = p.clone().sub(player.pos);
            const stripeHeight = SCREEN_HEIGHT / v.dot(d);
            switch (cell.kind) {
                case 'empty': break;
                case 'color':
                    ctx.fillStyle = cell.color.toString(1 / v.dot(d));
                    ctx.fillRect(x, Math.floor((SCREEN_HEIGHT - stripeHeight) / 2), 1, Math.ceil(stripeHeight));
                    break;
                case 'image':
                    const t = p.clone().sub(c);
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
                    ctx.drawImage(cell.image, Math.floor(u * cell.image.width), 0, 1, cell.image.height, x, Math.floor((SCREEN_HEIGHT - stripeHeight) / 2), 1, Math.ceil(stripeHeight));
                    ctx.fillStyle = new RGBA(0, 0, 0, 1 - 1 / v.dot(d)).toString();
                    ctx.fillRect(x, Math.floor((SCREEN_HEIGHT - stripeHeight) / 2), 1, Math.ceil(stripeHeight));
                    break;
                default:
                    throwBadCell(cell);
            }
        }
    }
};
const renderMinimap = () => {
    ctx.save();
    ctx.translate(canvas.width * 0.02, canvas.width * 0.02);
    ctx.scale(canvas.width * MINIMAP_SCALE, canvas.width * MINIMAP_SCALE);
    ctx.fillStyle = '#fbf1c7';
    ctx.fillRect(0, 0, scene.width, scene.height);
    for (let y = 0; y < scene.height; y++) {
        for (let x = 0; x < scene.width; x++) {
            if (scene.isWall(x, y)) {
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
    const [p1, p2] = player.fovRange();
    ctx.strokeLine(player.pos, p1);
    ctx.strokeLine(player.pos, p2);
    ctx.strokeLine(p1, p2);
    ctx.restore();
};
const render = () => {
    ctx.fillStyle = '#fbf1c7';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.scale(Math.ceil(canvas.width / SCREEN_WIDTH), Math.ceil(canvas.height / SCREEN_HEIGHT));
    renderWalls();
    ctx.restore();
    renderMinimap();
};
const renderLoop = (currentTime) => {
    const deltaTime = (currentTime - lastTime);
    lastTime = currentTime;
    update(deltaTime / 1000);
    render();
    requestAnimationFrame(renderLoop);
};
requestAnimationFrame(renderLoop);
export {};
//# sourceMappingURL=main.js.map