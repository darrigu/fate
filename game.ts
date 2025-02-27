const EPS = 1e-6;
const NEAR_CLIPPING_PLANE = 0.1;
const FAR_CLIPPING_PLANE = 10;
const FOV = Math.PI/2;
const COS_HALF_FOV = Math.cos(FOV/2);
const MINIMAP_ENABLED = false;
const MINIMAP_RENDER_SPRITES = true;
const MINIMAP_SCALE = 0.03;
const MINIMAP_PLAYER_SIZE = 0.5;
const MINIMAP_SPRITE_SIZE = 0.3;
const PLAYER_SPEED = 2;

declare global {
   interface Math {
      clamp(x: number, min: number, max: number): number;
   }
}

Math.clamp = (x: number, min: number, max: number): number => {
   return Math.max(min, Math.min(max, x));
};

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

export interface Vec2 {
   x: number;
   y: number;
}

export namespace Vec2 {
   export const create = (x = 0, y = x): Vec2 => ({ x, y });

   export const isVec2 = (object: any): object is Vec2 => {
      return typeof object === 'object' && 'x' in object && 'y' in object;
   };

   export const array = (v: Vec2): [number, number] => [v.x, v.y];

   export const fromAngle = (angle: number, len = 1): Vec2 => {
      return Vec2.create(Math.cos(angle)*len, Math.sin(angle)*len);
   };

   export const clone = (v: Vec2): Vec2 => {
      return Vec2.create(v.x, v.y);
   };

   export const copy = (v: Vec2, x: Vec2 | number, y?: number): Vec2 => {
      if (isVec2(x)) {
         v.x = x.x;
         v.y = x.y;
      } else {
         v.x = x;
         v.y = y ?? x;
      }
      return v;
   };

   export const add = (v: Vec2, x: Vec2 | number, y?: number): Vec2 => {
      if (isVec2(x)) {
         v.x += x.x;
         v.y += x.y;
      } else {
         v.x += x;
         v.y += y ?? x;
      }
      return v;
   };

   export const sub = (v: Vec2, x: Vec2 | number, y?: number): Vec2 => {
      if (isVec2(x)) {
         v.x -= x.x;
         v.y -= x.y;
      } else {
         v.x -= x;
         v.y -= y ?? x;
      }
      return v;
   };

   export const mul = (v: Vec2, x: Vec2 | number, y?: number): Vec2 => {
      if (isVec2(x)) {
         v.x *= x.x;
         v.y *= x.y;
      } else {
         v.x *= x;
         v.y *= y ?? x;
      }
      return v;
   };

   export const div = (v: Vec2, x: Vec2 | number, y?: number): Vec2 => {
      if (isVec2(x)) {
         v.x /= x.x;
         v.y /= x.y;
      } else {
         v.x /= x;
         v.y /= y ?? x;
      }
      return v;
   };

   export const sqrDist = (v: Vec2, x: Vec2 | number, y?: number): number => {
      if (isVec2(x)) {
         const dx = x.x - v.x;
         const dy = x.y - v.y;
         return dx*dx + dy*dy;
      } else {
         const dx = x - v.x;
         const dy = (y ?? x) - v.y;
         return dx*dx + dy*dy;
      }
   };

   export const dist = (v: Vec2, x: Vec2 | number, y?: number): number => {
      return Math.sqrt(sqrDist(v, x, y));
   };

   export const rot90 = (v: Vec2): Vec2 => {
      const oldX = v.x;
      v.x = -v.y;
      v.y = oldX;
      return v;
   };

   export const sqrLen = (v: Vec2): number => {
      return v.x*v.x + v.y*v.y;
   };

   export const len = (v: Vec2): number => {
      return Math.sqrt(sqrLen(v));
   };

   export const norm = (v: Vec2): Vec2 => {
      const l = len(v);
      return l === 0 ? v : mul(v, 1/l);
   };

   export const lerp = (a: Vec2, b: Vec2, t: number): Vec2 => {
      a.x += (b.x - a.x)*t;
      a.y += (b.y - a.y)*t;
      return a;
   };

   export const dot = (a: Vec2, b: Vec2): number => {
      return a.x*b.x + a.y*b.y;
   };
};

export interface RGBA {
   r: number;
   g: number;
   b: number;
   a: number;
}

export namespace RGBA {
   export const create = (r = 0, g = 0, b = 0, a = 0): RGBA => ({ r, g, b, a });

   export const black   = RGBA.create(0, 0, 0, 1);
   export const white   = RGBA.create(1, 1, 1, 1);
   export const red     = RGBA.create(1, 0, 0, 1);
   export const green   = RGBA.create(0, 1, 0, 1);
   export const blue    = RGBA.create(0, 0, 1, 1);
   export const cyan    = RGBA.create(0, 1, 1, 1);
   export const magenta = RGBA.create(1, 0, 1, 1);
   export const yellow  = RGBA.create(1, 1, 0, 1);

   export const toString = (color: RGBA, brightness = 1): string => {
      return `rgba(${Math.floor(color.r*brightness*255)}, ${Math.floor(color.g*brightness*255)}, ${Math.floor(color.b*brightness*255)}, ${color.a})`
   };
}

export interface Display {
   ctx: CanvasRenderingContext2D,
   backCtx: OffscreenCanvasRenderingContext2D,
   backImageData: ImageData,
   zBuffer: number[],
}

export namespace Display {
   export const create = (ctx: CanvasRenderingContext2D, backCtx: OffscreenCanvasRenderingContext2D, backImageData: ImageData) => ({
      ctx,
      backCtx,
      backImageData,
      zBuffer: new Array(backImageData.width).fill(0),
   });

   export const swapBuffers = ({ ctx, backCtx, backImageData }: Display) => {
      backCtx.putImageData(backImageData, 0, 0);
      ctx.drawImage(backCtx.canvas, 0, 0, ctx.canvas.width, ctx.canvas.height);
   };
}

export type Texture = ImageData;

export interface EmptyTile {
   kind: 'empty';
}

export interface ColorTile {
   kind: 'color';
   color: RGBA;
}

export interface TextureTile {
   kind: 'texture';
   texture: Texture;
}

export type Tile = EmptyTile | ColorTile | TextureTile;

export namespace Tile {
   export const empty: Tile = { kind: 'empty' };
   export const color = (color: RGBA): Tile => ({ kind: 'color', color });
   export const texture = (texture: Texture): Tile => ({ kind: 'texture', texture });

   export function throwBad(tile: never): never;
   export function throwBad(tile: Tile) {
      throw new Error(`Unknown tile kind: ${tile.kind}`);
   };
}

export interface Sprite {
   pos: Vec2;
   z: number;
   scale: number;
   texture: Texture;
}

export interface Scene {
   walls: Tile[];
   floors: Tile[];
   ceilings: Tile[];
   sprites: Sprite[];
   width: number;
   height: number;
}

export namespace Scene {
   export const create = (walls: Tile[][], floors: Tile[][], ceilings: Tile[][], sprites: Sprite[]): Scene => {
      return {
         walls: walls.flat(),
         floors: floors.flat(),
         ceilings: ceilings.flat(),
         sprites,
         width: walls[0].length,
         height: walls.length,
      };
   };

   export const contains = (scene: Scene, x: Vec2 | number, y?: number): boolean => {
      if (Vec2.isVec2(x)) {
         return 0 <= x.x && x.x < scene.width && 0 <= x.y && x.y < scene.height;
      } else {
         return 0 <= x && x < scene.width && 0 <= y! && y! < scene.height;
      }
   };

   export const getWall = (scene: Scene, x: Vec2 | number, y?: number): Tile | null => {
      if (!Scene.contains(scene, x, y)) return null;
      if (Vec2.isVec2(x)) {
         return scene.walls[Math.floor(x.y*scene.width + x.x)];
      } else {
         return scene.walls[Math.floor(y!*scene.width + x)];
      }
   };

   export const getFloor = (scene: Scene, x: Vec2 | number, y?: number): Tile | null => {
      if (Vec2.isVec2(x)) {
         if (!Scene.contains(scene, Math.floor(x.x), Math.floor(x.y))) return null;
         return scene.floors[Math.floor(x.y)*scene.width + Math.floor(x.x)];
      } else {
         if (!Scene.contains(scene, Math.floor(x), Math.floor(y!))) return null;
         return scene.floors[Math.floor(y!)*scene.width + Math.floor(x)];
      }
   };

   export const getCeiling = (scene: Scene, x: Vec2 | number, y?: number): Tile | null => {
      if (Vec2.isVec2(x)) {
         if (!Scene.contains(scene, Math.floor(x.x), Math.floor(x.y))) return null;
         return scene.ceilings[Math.floor(x.y)*scene.width + Math.floor(x.x)];
      } else {
         if (!Scene.contains(scene, Math.floor(x), Math.floor(y!))) return null;
         return scene.ceilings[Math.floor(y!)*scene.width + Math.floor(x)];
      }
   };

   export const isWall = (scene: Scene, x: Vec2 | number, y?: number): boolean => {
      const wall = Scene.getWall(scene, x, y);
      return wall !== null && wall.kind !== 'empty';
   };

   export const rectFits = (scene: Scene, px: number, py: number, sx: number, sy: number): boolean => {
      const x1 = Math.floor(px - sx/2);
      const x2 = Math.floor(px + sx/2);
      const y1 = Math.floor(py - sy/2);
      const y2 = Math.floor(py + sy/2);
      for (let x = x1; x <= x2; x++) {
         for (let y = y1; y <= y2; y++) {
            if (Scene.isWall(scene, x, y)) {
               return false;
            }
         }
      }
      return true;
   };
}

export interface Player {
   pos: Vec2;
   dir: number;
   velocity: Vec2;
}

export namespace Player {
   export const create = (pos: Vec2, dir: number) => ({ pos, dir, velocity: Vec2.create() });

   export const fovRange = (player: Player): [Vec2, Vec2] => {
      const l = Math.tan(FOV/2)*NEAR_CLIPPING_PLANE;
      const p = Vec2.add(Vec2.fromAngle(player.dir, NEAR_CLIPPING_PLANE), player.pos);
      const wing = Vec2.mul(Vec2.norm(Vec2.rot90(Vec2.sub(Vec2.clone(p), player.pos))), l);
      const p1 = Vec2.sub(Vec2.clone(p), wing);
      const p2 = Vec2.add(Vec2.clone(p), wing);
      return [p1, p2];
   };
}

const hittingCell = (p1: Vec2, p2: Vec2): Vec2 => {
   const dx = p2.x - p1.x;
   const dy = p2.y - p1.y;
   return Vec2.create(Math.floor(p2.x + Math.sign(dx)*EPS),
                      Math.floor(p2.y + Math.sign(dy)*EPS));
};

const snap = (x: number, dx: number): number => {
   if (dx > 0) return Math.ceil(x + Math.sign(dx)*EPS);
   if (dx < 0) return Math.floor(x + Math.sign(dx)*EPS);
   return x;
};

const rayStep = (p1: Vec2, p2: Vec2): Vec2 => {
   let p3 = Vec2.clone(p2);
   const dx = p2.x - p1.x;
   const dy = p2.y - p1.y;
   if (dx !== 0) {
      const m = dy/dx;
      const p = p1.y - m*p1.x;

      {
         const x3 = snap(p2.x, dx);
         const y3 = m*x3 + p;
         Vec2.copy(p3, x3, y3);
      }

      if (m !== 0) {
         const y3 = snap(p2.y, dy);
         const x3 = (y3 - p)/m;
         if (Vec2.sqrDist(p2, x3, y3) < Vec2.sqrDist(p2, p3)) {
            Vec2.copy(p3, x3, y3);
         }
      }
   } else {
      const y3 = snap(p2.y, dy);
      const x3 = p2.x;
      Vec2.copy(p3, x3, y3);
   }

   return p3;
};

const rayCast = (scene: Scene, p1: Vec2, p2: Vec2): Vec2 => {
   let start = p1;
   while (Vec2.sqrDist(start, p1) < FAR_CLIPPING_PLANE*FAR_CLIPPING_PLANE) {
      const c = hittingCell(p1, p2);
      if (Scene.isWall(scene, c)) break;
      const p3 = rayStep(p1, p2);
      p1 = p2;
      p2 = p3;
   }
   return p2;
};

export interface Game {
   display: Display;
   scene: Scene;
   player: Player;

   get fps(): number;
   keyPressed(key: string): boolean;
}

export const update = ({ scene, player, keyPressed }: Game, deltaTime: number) => {
   Vec2.copy(player.velocity, 0);
   let angularVelocity = 0;
   if (keyPressed('ArrowUp')) {
      Vec2.add(player.velocity, Vec2.fromAngle(player.dir, PLAYER_SPEED));
   }
   if (keyPressed('ArrowDown')) {
      Vec2.sub(player.velocity, Vec2.fromAngle(player.dir, PLAYER_SPEED));
   }
   if (keyPressed('ArrowLeft')) {
      angularVelocity -= Math.PI/2;
   }
   if (keyPressed('ArrowRight')) {
      angularVelocity += Math.PI/2;
   }
   player.dir += angularVelocity*deltaTime;
   const nx = player.pos.x + player.velocity.x*deltaTime;
   if (Scene.rectFits(scene, nx, player.pos.y, MINIMAP_PLAYER_SIZE, MINIMAP_PLAYER_SIZE)) {
      player.pos.x = nx;
   }
   const ny = player.pos.y + player.velocity.y*deltaTime;
   if (Scene.rectFits(scene, player.pos.x, ny, MINIMAP_PLAYER_SIZE, MINIMAP_PLAYER_SIZE)) {
      player.pos.y = ny;
   }
};

const renderFloorAndCeiling = ({ display: { backImageData }, scene, player }: Game) => {
   const pz = backImageData.height/2;
   const [p1, p2] = Player.fovRange(player);
   const t = Vec2.create();
   const t1 = Vec2.create();
   const t2 = Vec2.create();
   const bp = Vec2.len(Vec2.sub(Vec2.copy(t1, p1), player.pos));
   for (let y = Math.floor(backImageData.height/2); y < backImageData.height; y++) {
      const sz = backImageData.height - y - 1;

      const ap = pz - sz;
      const b = bp/ap*pz/NEAR_CLIPPING_PLANE;
      Vec2.add(Vec2.mul(Vec2.norm(Vec2.sub(Vec2.copy(t1, p1), player.pos)), b), player.pos);
      Vec2.add(Vec2.mul(Vec2.norm(Vec2.sub(Vec2.copy(t2, p2), player.pos)), b), player.pos);

      for (let x = 0; x < backImageData.width; x++) {
         Vec2.lerp(Vec2.copy(t, t1), t2, x/backImageData.width);

         let floor = Scene.getFloor(scene, t);
         if (floor !== null) {
            switch (floor.kind) {
               case 'empty':
                  floor = Tile.color(RGBA.black);
               case 'color': {
                  const shadow = Vec2.dist(player.pos, t)*255;
                  const destP = (y*backImageData.width + x)*4;
                  // @ts-ignore
                  backImageData.data[destP + 0] = floor.color.r*shadow;
                  // @ts-ignore
                  backImageData.data[destP + 1] = floor.color.g*shadow;
                  // @ts-ignore
                  backImageData.data[destP + 2] = floor.color.b*shadow;
               } break;
               case 'texture': {
                  const shadow = Math.min(1/Vec2.dist(player.pos, t)*2, 1);
                  const sx = Math.floor((t.x - Math.floor(t.x))*floor.texture.width);
                  const sy = Math.floor((t.y - Math.floor(t.y))*floor.texture.height);
                  const destP = (y*backImageData.width + x)*4;
                  const srcP = (sy*floor.texture.width + sx)*4;
                  backImageData.data[destP + 0] = floor.texture.data[srcP + 0]*shadow;
                  backImageData.data[destP + 1] = floor.texture.data[srcP + 1]*shadow;
                  backImageData.data[destP + 2] = floor.texture.data[srcP + 2]*shadow;
               } break;
               default: Tile.throwBad(floor);
            }
         }

         let ceiling = Scene.getCeiling(scene, t);
         if (ceiling !== null) {
            switch (ceiling.kind) {
               case 'empty':
                  ceiling = Tile.color(RGBA.black);
               case 'color': {
                  const shadow = Vec2.dist(player.pos, t)*255;
                  const destP = (sz*backImageData.width + x)*4;
                  // @ts-ignore
                  backImageData.data[destP + 0] = ceiling.color.r*shadow;
                  // @ts-ignore
                  backImageData.data[destP + 1] = ceiling.color.g*shadow;
                  // @ts-ignore
                  backImageData.data[destP + 2] = ceiling.color.b*shadow;
               } break;
               case 'texture': {
                  const shadow = Math.min(1/Vec2.dist(player.pos, t)*2, 1);
                  const sx = Math.floor((t.x - Math.floor(t.x))*ceiling.texture.width);
                  const sy = Math.floor((t.y - Math.floor(t.y))*ceiling.texture.height);
                  const destP = (sz*backImageData.width + x)*4;
                  const srcP = (sy*ceiling.texture.width + sx)*4;
                  backImageData.data[destP + 0] = ceiling.texture.data[srcP + 0]*shadow;
                  backImageData.data[destP + 1] = ceiling.texture.data[srcP + 1]*shadow;
                  backImageData.data[destP + 2] = ceiling.texture.data[srcP + 2]*shadow;
               } break;
               default: Tile.throwBad(ceiling);
            }
         }
      }
   }
};

const renderWalls = ({ display: { backImageData, zBuffer }, scene, player }: Game) => {
   const [p1, p2] = Player.fovRange(player);
   const d = Vec2.fromAngle(player.dir);
   for (let x = 0; x < backImageData.width; x++) {
      const p = rayCast(scene, player.pos, Vec2.lerp(Vec2.clone(p1), p2, x/backImageData.width));
      const c = hittingCell(player.pos, p);
      let wall = Scene.getWall(scene, c);
      if (wall !== null) {
         const v = Vec2.sub(Vec2.clone(p), player.pos);
         zBuffer[x] = Vec2.dot(v, d);
         const stripeHeight = backImageData.height/zBuffer[x];
         switch (wall.kind) {
            case 'empty':
               wall = Tile.color(RGBA.black);
            case 'color': {
               const shadow = 1/zBuffer[x]*2;
               for (let dy = 0; dy < Math.ceil(stripeHeight); ++dy) {
                  const y = Math.floor((backImageData.height - stripeHeight)*0.5) + dy;
                  const destP = (y*backImageData.width + x)*4;
                  // @ts-ignore
                  backImageData.data[destP + 0] = wall.color.r*shadow*255;
                  // @ts-ignore
                  backImageData.data[destP + 1] = wall.color.g*shadow*255;
                  // @ts-ignore
                  backImageData.data[destP + 2] = wall.color.b*shadow*255;
               }
            } break;
            case 'texture': {
               const t = Vec2.sub(Vec2.clone(p), c);
               let u = 0;
               if (Math.abs(t.x) < EPS && t.y > 0) {
                  u = t.y;
               } else if (Math.abs(t.x - 1) < EPS && t.y > 0) {
                  u = 1 - t.y;
               } else if (Math.abs(t.y) < EPS && t.x > 0) {
                  u = 1 - t.x;
               } else {
                  u = t.x;
               }

               const y1 = Math.floor((backImageData.height - stripeHeight)/2);
               const y2 = Math.floor(y1 + stripeHeight);
               const by1 = Math.max(0, y1);
               const by2 = Math.min(backImageData.height - 1, y2);
               const tx = Math.floor(u*wall.texture.width);
               const sh = (1/Math.ceil(stripeHeight))*wall.texture.height;
               const shadow = Math.min(1/zBuffer[x]*2, 1);
               for (let y = by1; y <= by2; ++y) {
                  const ty = Math.floor((y - y1)*sh);
                  const destP = (y*backImageData.width + x)*4;
                  const srcP = (ty*wall.texture.width + tx)*4;
                  backImageData.data[destP + 0] = wall.texture.data[srcP + 0]*shadow;
                  backImageData.data[destP + 1] = wall.texture.data[srcP + 1]*shadow;
                  backImageData.data[destP + 2] = wall.texture.data[srcP + 2]*shadow;
               }
            } break;
            default: Tile.throwBad(wall);
         }
      }
   }
};

const renderSprites = ({ display: { backImageData, zBuffer }, scene, player }: Game) => {
   const sp = Vec2.create();
   const d = Vec2.fromAngle(player.dir);
   const [p1, p2] = Player.fovRange(player);
   const fov = Vec2.sub(Vec2.clone(p2), p1);
   for (const sprite of scene.sprites) {
      Vec2.sub(Vec2.copy(sp, sprite.pos), player.pos);
      const spl = Vec2.len(sp);
      if (spl <= NEAR_CLIPPING_PLANE || spl >= FAR_CLIPPING_PLANE) continue;
      const cos = Vec2.dot(sp, d)/spl;
      if (cos < 0) continue;
      const dist = NEAR_CLIPPING_PLANE/cos;
      Vec2.sub(Vec2.add(Vec2.mul(Vec2.norm(sp), dist), player.pos), p1);
      const t = Vec2.len(sp)/Vec2.len(fov)*Math.sign(Vec2.dot(sp, fov));
      const pDist = Vec2.dot(Vec2.sub(Vec2.clone(sprite.pos), player.pos), d);

      const cx = Math.floor(backImageData.width*t);
      const cy = Math.floor(backImageData.height/2);
      const maxSpriteSize = backImageData.height/pDist;
      const spriteSize = maxSpriteSize*sprite.scale;
      const x1 = Math.floor(cx - spriteSize/2);
      const x2 = Math.floor(x1 + spriteSize - 1);
      const bx1 = Math.max(0, x1);
      const bx2 = Math.min(backImageData.width - 1, x2);
      const y1 = Math.floor(cy + maxSpriteSize/2 - maxSpriteSize*sprite.z);
      const y2 = Math.floor(y1 + spriteSize - 1);
      const by1 = Math.max(0, y1);
      const by2 = Math.min(backImageData.height-1, y2);

      for (let x = bx1; x < bx2; x++) {
         if (pDist < zBuffer[x]) {
            for (let y = by1; y < by2; y++) {
               const tx = Math.floor((x - x1)/spriteSize*sprite.texture.width);
               const ty = Math.floor((y - y1)/spriteSize*sprite.texture.height);
               const destP = (y*backImageData.width + x)*4;
               const srcP = (ty*sprite.texture.width + tx)*4;
               const alpha = sprite.texture.data[srcP + 3]/255;
               backImageData.data[destP + 0] = backImageData.data[destP + 0]*(1 - alpha) + sprite.texture.data[srcP + 0]*alpha;
               backImageData.data[destP + 1] = backImageData.data[destP + 1]*(1 - alpha) + sprite.texture.data[srcP + 1]*alpha;
               backImageData.data[destP + 2] = backImageData.data[destP + 2]*(1 - alpha) + sprite.texture.data[srcP + 2]*alpha;
            }
         }
      }
   }
};

const renderMinimap = ({ display: { ctx }, scene, player }: Game) => {
   ctx.save();
   ctx.translate(ctx.canvas.width*0.02, ctx.canvas.width*0.02);
   ctx.scale(ctx.canvas.width*MINIMAP_SCALE, ctx.canvas.width*MINIMAP_SCALE);

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
   ctx.strokeRect(player.pos.x - MINIMAP_PLAYER_SIZE/2, player.pos.y - MINIMAP_PLAYER_SIZE/2, MINIMAP_PLAYER_SIZE, MINIMAP_PLAYER_SIZE);

   const [p1, p2] = Player.fovRange(player);
   ctx.strokeLine(player.pos.x, player.pos.y, p1.x, p1.y);
   ctx.strokeLine(player.pos.x, player.pos.y, p2.x, p2.y);
   ctx.strokeLine(p1.x, p1.y, p2.x, p2.y);

   if (MINIMAP_RENDER_SPRITES) {
      ctx.fillStyle = '#9d0006';
      ctx.strokeStyle = '#b57614';
      const sp = Vec2.create();
      const d = Vec2.fromAngle(player.dir);
      ctx.strokeLine(player.pos.x, player.pos.y, ...Vec2.array(Vec2.add(Vec2.clone(player.pos), d)));
      for (const sprite of scene.sprites) {
         ctx.fillRect(sprite.pos.x - MINIMAP_SPRITE_SIZE/2, sprite.pos.y - MINIMAP_SPRITE_SIZE/2, MINIMAP_SPRITE_SIZE, MINIMAP_SPRITE_SIZE);
         Vec2.sub(Vec2.copy(sp, sprite.pos), player.pos);
         ctx.strokeLine(player.pos.x, player.pos.y, ...Vec2.array(Vec2.add(Vec2.clone(player.pos), sp)));
         const spl = Vec2.len(sp);
         if (spl === 0) continue;
         const dot = Vec2.dot(sp, d)/spl;
         if (!(COS_HALF_FOV <= dot && dot <= 1)) continue;
         const dist = NEAR_CLIPPING_PLANE/dot;
         Vec2.add(Vec2.mul(Vec2.norm(sp), dist), player.pos);
         ctx.fillRect(sp.x - MINIMAP_SPRITE_SIZE/2, sp.y - MINIMAP_SPRITE_SIZE/2, MINIMAP_SPRITE_SIZE, MINIMAP_SPRITE_SIZE);
      }
   }

   ctx.restore();
};

const renderFPS = ({ display: { ctx }, fps }: Game) => {
   ctx.fillStyle = 'white';
   ctx.font = '32px Arial';
   ctx.fillText(`FPS: ${fps}`, 15, 40);
};

export const render = (game: Game) => {
   renderFloorAndCeiling(game);
   renderWalls(game);
   renderSprites(game);
   Display.swapBuffers(game.display);

   if (MINIMAP_ENABLED) {
      renderMinimap(game);
   }

   renderFPS(game);
};
