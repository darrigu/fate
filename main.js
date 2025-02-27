import { Vec2, Display, Tile, Scene, Player } from './game.js';
const SCREEN_FACTOR = 20;
const SCREEN_WIDTH = 16 * SCREEN_FACTOR;
const SCREEN_HEIGHT = 9 * SCREEN_FACTOR;
const canvas = document.querySelector('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;
const backImageData = new ImageData(SCREEN_WIDTH, SCREEN_HEIGHT);
backImageData.data.fill(255);
const backCanvas = new OffscreenCanvas(SCREEN_WIDTH, SCREEN_HEIGHT);
const backCtx = backCanvas.getContext('2d');
backCtx.imageSmoothingEnabled = false;
const display = Display.create(ctx, backCtx, backImageData);
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
const [brickWall, plankFloor, waterFloor, stoneCeiling, keySprite,] = await Promise.all([
    loadImageData('./assets/images/brick_wall.png'),
    loadImageData('./assets/images/plank_floor.png'),
    loadImageData('./assets/images/water_floor.png'),
    loadImageData('./assets/images/stone_ceiling.png'),
    loadImageData('./assets/images/key_sprite.png'),
]);
let scene;
{
    const _ = Tile.empty;
    const B = Tile.image(brickWall);
    const P = Tile.image(plankFloor);
    const W = Tile.image(waterFloor);
    const S = Tile.image(stoneCeiling);
    scene = Scene.create([
        [B, B, B, B, B, B, B, B, B],
        [B, _, _, _, _, _, _, _, B],
        [B, _, _, _, _, _, _, _, B],
        [B, _, _, _, _, _, _, _, B],
        [B, _, _, _, _, _, _, _, B],
        [B, _, _, _, _, _, _, _, B],
        [B, B, B, _, _, _, B, B, B],
        [B, _, _, _, _, _, _, _, B],
        [B, _, _, _, _, _, _, _, B],
        [B, _, _, B, B, B, _, _, B],
        [B, _, _, _, _, _, _, _, B],
        [B, _, _, _, _, _, _, _, B],
        [B, B, B, B, B, B, B, B, B],
    ], [
        [P, P, P, P, P, P, P, P, P],
        [P, P, P, P, P, P, P, P, P],
        [P, P, P, P, P, P, P, P, P],
        [P, P, P, P, P, P, P, P, P],
        [P, P, P, P, P, P, P, P, P],
        [P, P, P, P, P, P, P, P, P],
        [P, P, P, P, P, P, P, P, P],
        [P, W, W, W, W, W, W, W, P],
        [P, W, W, W, W, W, W, W, P],
        [P, W, W, W, W, W, W, W, P],
        [P, W, W, W, W, W, W, W, P],
        [P, W, W, W, W, W, W, W, P],
        [P, P, P, P, P, P, P, P, P],
    ], [
        [S, S, S, S, S, S, S, S, S],
        [S, S, S, S, S, S, S, S, S],
        [S, S, S, S, S, S, S, S, S],
        [S, S, S, S, S, S, S, S, S],
        [S, S, S, S, S, S, S, S, S],
        [S, S, S, S, S, S, S, S, S],
        [S, S, S, S, S, S, S, S, S],
        [S, S, S, S, S, S, S, S, S],
        [S, S, S, S, S, S, S, S, S],
        [S, S, S, S, S, S, S, S, S],
        [S, S, S, S, S, S, S, S, S],
        [S, S, S, S, S, S, S, S, S],
        [S, S, S, S, S, S, S, S, S],
    ], [
        {
            pos: Vec2.create(4.5, 3.5),
            image: keySprite,
        },
    ]);
}
const player = Player.create(Vec2.create(scene.width * 0.63, scene.height * 0.63), Math.PI * 1.25);
const keys = {};
let fps = 0;
let lastTime = performance.now();
let frameCount = 0;
let fpsTime = 0;
const game = {
    display,
    scene,
    player,
    get fps() { return fps; },
    keyPressed(key) { return keys[key]; },
};
window.addEventListener('keydown', (event) => {
    keys[event.key] = true;
});
window.addEventListener('keyup', (event) => {
    keys[event.key] = false;
});
let Game = await import('./game.js');
const renderLoop = (currentTime) => {
    const deltaTime = (currentTime - lastTime);
    lastTime = currentTime;
    frameCount++;
    fpsTime += deltaTime;
    if (fpsTime >= 500) {
        fps = Math.round((frameCount / fpsTime) * 1000);
        frameCount = 0;
        fpsTime = 0;
    }
    Game.update(game, deltaTime / 1000);
    Game.render(game);
    requestAnimationFrame(renderLoop);
};
requestAnimationFrame(renderLoop);
const isDev = window.location.hostname === 'localhost';
if (isDev) {
    const ws = new WebSocket('ws://localhost:5000');
    ws.addEventListener('message', async (event) => {
        if (event.data === 'cold') {
            window.location.reload();
        }
        else if (event.data === 'hot') {
            console.log('Hot reloading module');
            Game = await import('./game.js?date=' + performance.now());
        }
    });
}
//# sourceMappingURL=main.js.map