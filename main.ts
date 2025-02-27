import { Vec2, Display, Tile, Scene, Player, Game } from './game.js';

const SCREEN_FACTOR = 30;
const SCREEN_WIDTH = 16*SCREEN_FACTOR;
const SCREEN_HEIGHT = 9*SCREEN_FACTOR;

const canvas = document.querySelector('canvas')!;
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener('resize', () => {
   canvas.width = window.innerWidth;
   canvas.height = window.innerHeight;
});

const ctx = canvas.getContext('2d')!;
ctx.imageSmoothingEnabled = false;

const backImageData = new ImageData(SCREEN_WIDTH, SCREEN_HEIGHT);
backImageData.data.fill(255);
const backCanvas = new OffscreenCanvas(SCREEN_WIDTH, SCREEN_HEIGHT);
const backCtx = backCanvas.getContext('2d')!;
backCtx.imageSmoothingEnabled = false;

declare global {
   interface CanvasRenderingContext2D {
      strokeLine(x1: number, y1: number, x2: number, y2: number): void;
      fillCircle(x: number, y: number, radius: number): void;
   }
}

CanvasRenderingContext2D.prototype.strokeLine = function(x1: number, y1: number, x2: number, y2: number) {
   this.beginPath();
   this.moveTo(x1, y1);
   this.lineTo(x2, y2);
   this.stroke();
};

CanvasRenderingContext2D.prototype.fillCircle = function(x: number, y: number, radius: number) {
   this.beginPath();
   this.arc(x, y, radius, 0, 2*Math.PI);
   this.fill();
};

const display: Display = { ctx, backCtx, backImageData };

const loadImage = async (url: string): Promise<HTMLImageElement> => {
   const image = new Image();
   image.src = url;
   return new Promise((resolve, reject) => {
      image.onload = () => resolve(image);
      image.onerror = reject;
   });
};

const loadImageData = async (url: string): Promise<ImageData> => {
   const image = await loadImage(url);
   const canvas = new OffscreenCanvas(image.width, image.height);
   const ctx = canvas.getContext('2d')!;
   ctx.drawImage(image, 0, 0);
   return ctx.getImageData(0, 0, image.width, image.height);
};

const [
   brickWall,
   plankFloor,
   waterFloor,
   stoneCeiling,
   keySprite,
] = await Promise.all([
   loadImageData('./assets/images/brick_wall.png'),
   loadImageData('./assets/images/plank_floor.png'),
   loadImageData('./assets/images/water_floor.png'),
   loadImageData('./assets/images/stone_ceiling.png'),
   loadImageData('./assets/images/key_sprite.png'),
]);

let scene: Scene;
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
   ]);
}

const player = Player.create(
   Vec2.create(scene.width*0.63, scene.height*0.63),
   Math.PI*1.25
);

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
   keyPressed(key: string): boolean { return keys[key]; },
};

window.addEventListener('keydown', (event) => {
   keys[event.key] = true;
});

window.addEventListener('keyup', (event) => {
   keys[event.key] = false;
});

let Game = await import('./game.js');

const renderLoop = (currentTime: number) => {
   const deltaTime = (currentTime - lastTime);
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
      if (event.data === 'reload') {
         console.log('Hot reloading module');
         Game = await import('./game.js?date=' + performance.now());
      }
   });
}

export {};
