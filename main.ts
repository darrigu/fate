import { Vec2, Display, Texture, Tile, Scene, Player, Game, Item } from './game.js';

const SCREEN_FACTOR = 20;
const SCREEN_WIDTH = 16*SCREEN_FACTOR;
const SCREEN_HEIGHT = 9*SCREEN_FACTOR;

const canvas = document.querySelector('canvas')!;
const factor = 80;
canvas.width = 16*factor;
canvas.height = 9*factor;

const ctx = canvas.getContext('2d')!;
ctx.imageSmoothingEnabled = false;

const backImageData = new ImageData(SCREEN_WIDTH, SCREEN_HEIGHT);
backImageData.data.fill(255);
const backCanvas = new OffscreenCanvas(SCREEN_WIDTH, SCREEN_HEIGHT);
const backCtx = backCanvas.getContext('2d')!;
backCtx.imageSmoothingEnabled = false;

const display = Display.create(ctx, backCtx, backImageData);

const loadTexture = (path: string): Promise<Texture> => {
   return new Promise((resolve, reject) => {
      const image = new Image();
      image.src = path;

      image.onload = () => {
         const canvas = new OffscreenCanvas(image.width, image.height);
         const ctx = canvas.getContext('2d')!;
         ctx.drawImage(image, 0, 0);
         const imageData = ctx.getImageData(0, 0, image.width, image.height);
         resolve(imageData);
      };

      image.onerror = (err) => reject(err);
   });
};

let scene: Scene;
{
   const _ = Tile.empty;
   const B = Tile.texture(await loadTexture('./assets/images/brick_wall.png'));
   const P = Tile.texture(await loadTexture('./assets/images/plank_floor.png'));
   const W = Tile.texture(await loadTexture('./assets/images/water_floor.png'));
   const S = Tile.texture(await loadTexture('./assets/images/stone_ceiling.png'));
   const key: Partial<Item> = {
      alive: true,
      texture: await loadTexture('./assets/images/key_sprite.png'),
      pickupAudio: new Audio('./assets/sounds/key_pickup.wav'),
   };
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
      { ...key, pos: Vec2.create(2.5, 3.5), } as Item,
      { ...key, pos: Vec2.create(3.5, 3.5), } as Item,
      { ...key, pos: Vec2.create(4.5, 3.5), } as Item,
      { ...key, pos: Vec2.create(5.5, 3.5), } as Item,
      { ...key, pos: Vec2.create(6.5, 3.5), } as Item,
   ]);
}

const player = Player.create(4.5, 8.5, Math.PI*1.5);

const keys: Record<string, boolean> = {};
let fps = 0;
let lastTime = performance.now();
let frameCount = 0;
let fpsTime = 0;

const game: Game = {
   display,
   scene,
   player,

   get fps(): number { return fps; },
   get time(): number { return lastTime/1000; },
   keyPressed(key: string, once: boolean): boolean {
      const pressed = keys[key];
      if (once) {
         keys[key] = false;
      }
      return pressed;
   },
};

window.addEventListener('keydown', (event) => {
   keys[event.key] = true;
});

window.addEventListener('keyup', (event) => {
   keys[event.key] = false;
});

let Game = await import('./game.js');

const renderLoop = (currentTime: number) => {
   const deltaTime = currentTime - lastTime;
   lastTime = currentTime;

   frameCount++;
   fpsTime += deltaTime;

   if (fpsTime >= 500) {
      fps = Math.round((frameCount/fpsTime)*1000);
      frameCount = 0;
      fpsTime = 0;
   }

   Game.update(game, deltaTime/1000);
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
      } else if (event.data === 'hot') {
         console.log('Hot reloading module');
         Game = await import('./game.js?date=' + performance.now());
      }
   });
}

export {};
