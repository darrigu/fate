class Vector2 {
   constructor(public x = 0, public y = x) {}

   static fromAngle(angle: number, len = 1): Vector2 {
      return new Vector2(Math.cos(angle)*len, Math.sin(angle)*len);
   }

   clone(): Vector2 {
      return new Vector2(this.x, this.y);
   }

   copy(x: Vector2 | number, y?: number): this {
      if (x instanceof Vector2) {
         this.x = x.x;
         this.y = x.y;
      } else {
         this.x = x;
         this.y = y ?? x;
      }
      return this;
   }

   add(x: Vector2 | number, y?: number): this {
      if (x instanceof Vector2) {
         this.x += x.x;
         this.y += x.y;
      } else {
         this.x += x;
         this.y += y ?? x;
      }
      return this;
   }

   sub(x: Vector2 | number, y?: number): this {
      if (x instanceof Vector2) {
         this.x -= x.x;
         this.y -= x.y;
      } else {
         this.x -= x;
         this.y -= y ?? x;
      }
      return this;
   }

   mul(x: Vector2 | number, y?: number): this {
      if (x instanceof Vector2) {
         this.x *= x.x;
         this.y *= x.y;
      } else {
         this.x *= x;
         this.y *= y ?? x;
      }
      return this;
   }

   div(x: Vector2 | number, y?: number): this {
      if (x instanceof Vector2) {
         this.x /= x.x;
         this.y /= x.y;
      } else {
         this.x /= x;
         this.y /= y ?? x;
      }
      return this;
   }

   sqrDistTo(x: Vector2 | number, y?: number): number {
      if (x instanceof Vector2) {
         const dx = x.x - this.x;
         const dy = x.y - this.y;
         return dx*dx + dy*dy;
      } else {
         const dx = x - this.x;
         const dy = (y ?? x) - this.y;
         return dx*dx + dy*dy;
      }
   }

   rot90(): this {
      const oldX = this.x;
      this.x = -this.y;
      this.y = oldX;
      return this;
   }

   sqrLen(): number {
      return this.x*this.x + this.y*this.y;
   }

   len(): number {
      return Math.sqrt(this.sqrLen());
   }

   norm(): this {
      const l = this.len();
      return l === 0 ? this : this.mul(1/l);
   }

   lerp(that: Vector2, t: number): this {
      this.x += (that.x - this.x)*t;
      this.y += (that.y - this.y)*t;
      return this;
   }

   dot(that: Vector2): number {
      return this.x*that.x + this.y*that.y;
   }
}

interface Color {
   toString(brightness?: number): string;
}

class RGBA implements Color {
   static red = new RGBA(1, 0, 0, 1);
   static green = new RGBA(0, 1, 0, 1);
   static blue = new RGBA(0, 0, 1, 1);

   constructor(
      public r: number,
      public g: number,
      public b: number,
      public a: number,
   ) {}

   toString(brightness = 1): string {
      return `rgba(${Math.floor(this.r*brightness*255)}, ${Math.floor(this.g*brightness*255)}, ${Math.floor(this.b*brightness*255)}, ${this.a})`
   }
}

const canvas = document.querySelector('canvas')!;
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const ctx = canvas.getContext('2d')!;

interface CanvasRenderingContext2D {
   strokeLine(p1: Vector2, p2: Vector2): void;
   strokeLine(x1: number, y1: number, x2: number, y2: number): void;
   fillCircle(p: Vector2, radius: number): void;
   fillCircle(x: number, y: number, radius: number): void;
}

CanvasRenderingContext2D.prototype.strokeLine = function(x1: Vector2 | number, y1: Vector2 | number, x2?: number, y2?: number) {
   this.beginPath();
   if (x1 instanceof Vector2) {
      this.moveTo(x1.x, x1.y);
      this.lineTo((y1 as Vector2).x, (y1 as Vector2).y);
   } else {
      this.moveTo(x1, y1 as number);
      this.lineTo(x2!, y2!);
   }
   this.stroke();
};

CanvasRenderingContext2D.prototype.fillCircle = function(x: Vector2 | number, y?: number, radius?: number) {
   this.beginPath();
   if (x instanceof Vector2) {
      this.arc(x.x, x.y, y!, 0, 2*Math.PI);
   } else {
      this.arc(x, y!, radius!, 0, 2*Math.PI);
   }
   this.fill();
};

const EPS = 1e-6;
const NEAR_CLIPPING_PLANE = 1;
const FAR_CLIPPING_PLANE = 10;
const FOV = Math.PI/2;
const SCREEN_WIDTH = 400;
const MINIMAP_SCALE = 0.03;
const PLAYER_SPEED = 2;

interface EmptyCell {
   kind: 'empty';
}

interface ColorCell {
   kind: 'color';
   color: Color;
}

type Cell = EmptyCell | ColorCell;

const emptyCell = (): Cell => ({ kind: 'empty' });
const colorCell = (color: Color): Cell => ({ kind: 'color', color });

function throwBadCell(cell: never): never;
function throwBadCell(cell: Cell) {
   throw new Error(`Unknown cell kind: ${cell.kind}`);
}

class Scene {
   public cells: Cell[];
   public width: number;
   public height: number;

   constructor(cells: Cell[][]) {
      this.cells = cells.flat();
      this.width = cells[0].length;
      this.height = cells.length;
   }

   get size(): Vector2 {
      return new Vector2(this.width, this.height);
   }

   contains(x: Vector2 | number, y?: number): boolean {
      if (x instanceof Vector2) {
         return 0 <= x.x && x.x < this.width && 0 <= x.y && x.y < this.height;
      } else {
         return 0 <= x && x < this.width && 0 <= y! && y! < this.height;
      }
   }

   get(x: Vector2 | number, y?: number): Cell | null {
      if (!this.contains(x, y)) return null;
      if (x instanceof Vector2) {
         return this.cells[x.y*this.width + x.x];
      } else {
         return this.cells[y!*this.width + x];
      }
   }
}

class Player {
   public velocity = new Vector2();

   constructor (public pos: Vector2, public dir: number) {}

   fovRange(): [Vector2, Vector2] {
      const l = Math.tan(FOV/2)*NEAR_CLIPPING_PLANE;
      const p = Vector2.fromAngle(this.dir, NEAR_CLIPPING_PLANE).add(this.pos);
      const wing = p.clone().sub(this.pos).rot90().norm().mul(l);
      const p1 = p.clone().sub(wing);
      const p2 = p.clone().add(wing);
      return [p1, p2];
   }
}

const hittingCell = (p1: Vector2, p2: Vector2): Vector2 => {
   const dx = p2.x - p1.x;
   const dy = p2.y - p1.y;
   return new Vector2(Math.floor(p2.x + Math.sign(dx)*EPS),
                      Math.floor(p2.y + Math.sign(dy)*EPS));
};

const snap = (x: number, dx: number): number => {
   if (dx > 0) return Math.ceil(x + Math.sign(dx)*EPS);
   if (dx < 0) return Math.floor(x + Math.sign(dx)*EPS);
   return x;
};

const rayStep = (p1: Vector2, p2: Vector2): Vector2 => {
   let p3 = p2.clone();
   const dx = p2.x - p1.x;
   const dy = p2.y - p1.y;
   if (dx !== 0) {
      const m = dy/dx;
      const p = p1.y - m*p1.x;

      {
         const x3 = snap(p2.x, dx);
         const y3 = m*x3 + p;
         p3.copy(x3, y3);
      }

      if (m !== 0) {
         const y3 = snap(p2.y, dy);
         const x3 = (y3 - p)/m;
         if (p2.sqrDistTo(x3, y3) < p2.sqrDistTo(p3)) {
            p3.copy(x3, y3);
         }
      }
   } else {
      const y3 = snap(p2.y, dy);
      const x3 = p2.x;
      p3.copy(x3, y3);
   }

   return p3;
};

const rayCast = (scene: Scene, p1: Vector2, p2: Vector2): Vector2 => {
   while (true) {
      const cell = scene.get(hittingCell(p1, p2));
      if (cell === null || cell.kind !== 'empty') break;

      const p3 = rayStep(p1, p2);
      p1 = p2;
      p2 = p3;
   }
   return p2;
};

const scene = new Scene([
   [emptyCell(), emptyCell(), colorCell(RGBA.red), colorCell(RGBA.red), emptyCell(), emptyCell(), emptyCell(), emptyCell(), emptyCell()],
   [emptyCell(), emptyCell(), emptyCell(), colorCell(RGBA.red), emptyCell(), emptyCell(), emptyCell(), emptyCell(), emptyCell()],
   [emptyCell(), colorCell(RGBA.red), colorCell(RGBA.red), colorCell(RGBA.red), emptyCell(), emptyCell(), emptyCell(), emptyCell(), emptyCell()],
   [emptyCell(), emptyCell(), emptyCell(), emptyCell(), emptyCell(), emptyCell(), emptyCell(), emptyCell(), emptyCell()],
   [emptyCell(), emptyCell(), emptyCell(), emptyCell(), emptyCell(), emptyCell(), emptyCell(), emptyCell(), emptyCell()],
   [emptyCell(), emptyCell(), emptyCell(), emptyCell(), emptyCell(), emptyCell(), emptyCell(), emptyCell(), emptyCell()],
   [emptyCell(), emptyCell(), emptyCell(), emptyCell(), emptyCell(), emptyCell(), emptyCell(), emptyCell(), emptyCell()],
]);

const player = new Player(scene.size.clone().mul(0.63, 0.63), Math.PI*1.25);

const keys: Record<string, boolean> = {};
let lastTime = performance.now();

window.addEventListener('keydown', (event) => {
   keys[event.key] = true;
});

window.addEventListener('keyup', (event) => {
   keys[event.key] = false;
});

const update = (deltaTime: number) => {
   player.velocity.copy(0);
   let angularVelocity = 0;
   if (keys['ArrowUp']) {
      player.velocity.add(Vector2.fromAngle(player.dir, PLAYER_SPEED));
   }
   if (keys['ArrowDown']) {
      player.velocity.sub(Vector2.fromAngle(player.dir, PLAYER_SPEED));
   }
   if (keys['ArrowLeft']) {
      angularVelocity -= Math.PI/2;
   }
   if (keys['ArrowRight']) {
      angularVelocity += Math.PI/2;
   }
   player.dir += angularVelocity*deltaTime;
   player.pos.add(player.velocity.mul(deltaTime));
};

const renderWalls = () => {
   const stripeWidth = Math.ceil(canvas.width/SCREEN_WIDTH);
   const [p1, p2] = player.fovRange();
   const d = Vector2.fromAngle(player.dir);
   for (let x = 0; x < SCREEN_WIDTH; x++) {
      const p = rayCast(scene, player.pos, p1.clone().lerp(p2, x/SCREEN_WIDTH));
      const cell = scene.get(hittingCell(player.pos, p));
      if (cell !== null) {
         const v = p.clone().sub(player.pos);
         const stripeHeight = canvas.height/v.dot(d);
         switch (cell.kind) {
            case 'empty': break;
            case 'color':
               ctx.fillStyle = cell.color.toString(1/v.dot(d));
               ctx.fillRect(x*stripeWidth, (canvas.height - stripeHeight)/2, stripeWidth, stripeHeight);
               break;
            default:
               throwBadCell(cell);
         }
      }
   }
};

const renderMinimap = () => {
   ctx.save();
   ctx.translate(canvas.width*0.02, canvas.width*0.02);
   ctx.scale(canvas.width*MINIMAP_SCALE, canvas.width*MINIMAP_SCALE);

   ctx.fillStyle = '#fbf1c7';
   ctx.fillRect(0, 0, scene.width, scene.height);

   for (let y = 0; y < scene.height; y++) {
      for (let x = 0; x < scene.width; x++) {
         const cell = scene.get(x, y)!;
         switch (cell.kind) {
            case 'empty': break;
            case 'color':
               ctx.fillStyle = cell.color.toString();
               ctx.fillRect(x, y, 1, 1);
               break;
            default:
               throwBadCell(cell);
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

   ctx.fillStyle = '#8f3f71';
   ctx.fillCircle(player.pos, 0.2);

   const [p1, p2] = player.fovRange();
   ctx.lineWidth = 0.05;
   ctx.strokeStyle = '#8f3f71';
   ctx.strokeLine(player.pos, p1);
   ctx.strokeLine(player.pos, p2);
   ctx.strokeLine(p1, p2);

   ctx.restore();
};

const render = () => {
   ctx.fillStyle = '#fbf1c7';
   ctx.fillRect(0, 0, canvas.width, canvas.height);

   renderWalls();
   renderMinimap();
};

const renderLoop = (currentTime: number) => {
   const deltaTime = (currentTime - lastTime);
   lastTime = currentTime;

   update(deltaTime/1000);
   render();

   requestAnimationFrame(renderLoop);
};

requestAnimationFrame(renderLoop);
