// LiveBackground.ts

export type Theme = 'gears' | 'circuit' | 'robot' | 'industrial' | 'futuristic';

interface LiveBackgroundOptions {
    canvas: HTMLCanvasElement;
    theme: Theme;
}

export class LiveBackground {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private theme: Theme;
    private animationFrameId: number | null = null;
    private themeInstance: ITheme;

    constructor(options: LiveBackgroundOptions) {
        this.canvas = options.canvas;
        const ctx = this.canvas.getContext('2d');
        if (!ctx) {
            throw new Error('CanvasRenderingContext2D is not supported.');
        }
        this.ctx = ctx;
        this.theme = options.theme;

        // Resize canvas to fit the window
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());

        // Initialize theme
        this.themeInstance = this.getThemeInstance(this.theme, this.canvas, this.ctx);

        // Start animation loop
        this.animate = this.animate.bind(this);
        this.animate();
    }

    private resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        if (this.themeInstance && this.themeInstance.onResize) {
            this.themeInstance.onResize();
        }
    }

    private getThemeInstance(theme: Theme, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D): ITheme {
        switch (theme) {
            case 'gears':
                return new GearsTheme(canvas, ctx);
            case 'circuit':
                return new CircuitTheme(canvas, ctx);
            case 'robot':
                return new RobotTheme(canvas, ctx);
            case 'industrial':
                return new IndustrialTheme(canvas, ctx);
            case 'futuristic':
                return new FuturisticTheme(canvas, ctx);
            default:
                throw new Error(`Unknown theme: ${theme}`);
        }
    }

    private animate() {
        this.animationFrameId = requestAnimationFrame(this.animate);
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.themeInstance.draw();
    }

    public destroy() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
        window.removeEventListener('resize', this.resizeCanvas);
    }
}

interface ITheme {
    draw(): void;
    onResize?(): void;
}

// 1. Gears Theme
class GearsTheme implements ITheme {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private gears: Gear[];
    private centerX: number;
    private centerY: number;

    constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.centerX = canvas.width / 2;
        this.centerY = canvas.height / 2;
        this.gears = [
            new Gear(this.centerX, this.centerY, 50, 20, 20, 0.02),
            new Gear(this.centerX + 100, this.centerY, 30, 10, 10, -0.04),
            new Gear(this.centerX - 100, this.centerY, 30, 10, 10, 0.04),
        ];
    }

    draw() {
        this.gears.forEach(gear => gear.update());
        this.gears.forEach(gear => gear.draw(this.ctx));
    }

    onResize() {
        this.centerX = this.canvas.width / 2;
        this.centerY = this.canvas.height / 2;
        // Optionally adjust gear positions
    }
}

class Gear {
    x: number;
    y: number;
    radius: number;
    teeth: number;
    toothDepth: number;
    angle: number;
    rotationSpeed: number;

    constructor(x: number, y: number, radius: number, teeth: number, toothDepth: number, rotationSpeed: number) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.teeth = teeth;
        this.toothDepth = toothDepth;
        this.angle = 0;
        this.rotationSpeed = rotationSpeed;
    }

    update() {
        this.angle += this.rotationSpeed;
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        ctx.beginPath();
        for (let i = 0; i < this.teeth; i++) {
            const theta = (i / this.teeth) * 2 * Math.PI;
            const nextTheta = ((i + 1) / this.teeth) * 2 * Math.PI;
            ctx.lineTo(this.radius * Math.cos(theta), this.radius * Math.sin(theta));
            ctx.lineTo((this.radius + this.toothDepth) * Math.cos(theta + Math.PI / this.teeth / 2), (this.radius + this.toothDepth) * Math.sin(theta + Math.PI / this.teeth / 2));
            ctx.lineTo(this.radius * Math.cos(nextTheta), this.radius * Math.sin(nextTheta));
        }
        ctx.closePath();
        ctx.fillStyle = '#555';
        ctx.fill();
        ctx.strokeStyle = '#000';
        ctx.stroke();
        ctx.restore();
    }
}

// 2. Circuit Theme
class CircuitTheme implements ITheme {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private electrons: Electron[];
    private lines: Line[];

    constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.electrons = [];
        this.lines = this.generateCircuit();
        this.spawnElectron();
    }

    generateCircuit(): Line[] {
        // Simple circuit with lines
        return [
            new Line(100, 100, 700, 100),
            new Line(700, 100, 700, 500),
            new Line(700, 500, 100, 500),
            new Line(100, 500, 100, 100),
            new Line(100, 100, 700, 500),
            new Line(700, 100, 100, 500),
        ];
    }

    spawnElectron() {
        setInterval(() => {
            const line = this.lines[Math.floor(Math.random() * this.lines.length)];
            this.electrons.push(new Electron(line));
        }, 500);
    }

    draw() {
        // Draw circuit lines
        this.ctx.strokeStyle = '#0f0';
        this.ctx.lineWidth = 2;
        this.lines.forEach(line => line.draw(this.ctx));

        // Update and draw electrons
        this.electrons.forEach(electron => electron.update(this.canvas));
        this.electrons = this.electrons.filter(electron => !electron.isOffScreen());
        this.electrons.forEach(electron => electron.draw(this.ctx));
    }

    onResize() {
        // Optionally handle resizing for circuit
    }
}

class Line {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    dx: number;
    dy: number;
    length: number;

    constructor(x1: number, y1: number, x2: number, y2: number) {
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
        const deltaX = x2 - x1;
        const deltaY = y2 - y1;
        this.length = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        this.dx = deltaX / this.length;
        this.dy = deltaY / this.length;
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.beginPath();
        ctx.moveTo(this.x1, this.y1);
        ctx.lineTo(this.x2, this.y2);
        ctx.stroke();
    }
}

class Electron {
    x: number;
    y: number;
    speed: number;
    line: Line;
    traveled: number;

    constructor(line: Line) {
        this.line = line;
        this.x = line.x1;
        this.y = line.y1;
        this.speed = 2 + Math.random() * 3;
        this.traveled = 0;
    }

    update(canvas: HTMLCanvasElement) {
        this.x += this.line.dx * this.speed;
        this.y += this.line.dy * this.speed;
        this.traveled += this.speed;
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, 5, 0, 2 * Math.PI);
        ctx.fillStyle = '#0ff';
        ctx.fill();
    }

    isOffScreen(): boolean {
        return this.traveled > this.line.length;
    }
}

// 3. Robot Theme
class RobotTheme implements ITheme {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private parts: RobotPart[];

    constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.parts = [
            new RobotArm(200, 300),
            new RobotArm(600, 300),
            new RobotLeg(300, 500),
            new RobotLeg(500, 500),
            new RobotHead(400, 150),
        ];
    }

    draw() {
        this.parts.forEach(part => {
            part.update();
            part.draw(this.ctx);
        });
    }

    onResize() {
        // Optionally handle resizing for robot
    }
}

interface RobotPart {
    update(): void;
    draw(ctx: CanvasRenderingContext2D): void;
}

class RobotArm implements RobotPart {
    x: number;
    y: number;
    angle: number;
    rotationSpeed: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
        this.angle = 0;
        this.rotationSpeed = 0.02;
    }

    update() {
        this.angle += this.rotationSpeed;
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(Math.sin(this.angle) * Math.PI / 8);
        ctx.fillStyle = '#888';
        ctx.fillRect(-10, 0, 20, 100);
        ctx.restore();
    }
}

class RobotLeg implements RobotPart {
    x: number;
    y: number;
    angle: number;
    rotationSpeed: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
        this.angle = 0;
        this.rotationSpeed = -0.015;
    }

    update() {
        this.angle += this.rotationSpeed;
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(Math.sin(this.angle) * Math.PI / 16);
        ctx.fillStyle = '#555';
        ctx.fillRect(-10, 0, 20, 100);
        ctx.restore();
    }
}

class RobotHead implements RobotPart {
    x: number;
    y: number;
    blinkTimer: number;
    isBlinking: boolean;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
        this.blinkTimer = 0;
        this.isBlinking = false;
    }

    update() {
        this.blinkTimer += 1;
        if (this.blinkTimer > 300) {
            this.isBlinking = true;
            if (this.blinkTimer > 320) {
                this.isBlinking = false;
                this.blinkTimer = 0;
            }
        }
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.fillStyle = '#777';
        ctx.fillRect(-50, -50, 100, 100);
        // Eyes
        ctx.fillStyle = '#000';
        if (!this.isBlinking) {
            ctx.beginPath();
            ctx.arc(-20, -10, 10, 0, 2 * Math.PI);
            ctx.arc(20, -10, 10, 0, 2 * Math.PI);
            ctx.fill();
        }
        ctx.restore();
    }
}

// 4. Industrial Theme
class IndustrialTheme implements ITheme {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private conveyorBelts: ConveyorBelt[];

    constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.conveyorBelts = [
            new ConveyorBelt(100, 400, 600, 50, 2),
            new ConveyorBelt(100, 500, 600, 50, -2),
        ];
    }

    draw() {
        this.conveyorBelts.forEach(belt => {
            belt.update();
            belt.draw(this.ctx);
        });
    }

    onResize() {
        // Optionally handle resizing for industrial theme
    }
}

class ConveyorBelt {
    x: number;
    y: number;
    width: number;
    height: number;
    speed: number;
    items: ConveyorItem[];

    constructor(x: number, y: number, width: number, height: number, speed: number) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.speed = speed;
        this.items = [];
        this.spawnItem();
    }

    spawnItem() {
        setInterval(() => {
            const item = new ConveyorItem(this.x, this.y + this.height / 2, this.speed);
            this.items.push(item);
        }, 1000);
    }

    update() {
        this.items.forEach(item => item.update());
        this.items = this.items.filter(item => !item.isOffScreen(this.x, this.width));
    }

    draw(ctx: CanvasRenderingContext2D) {
        // Draw conveyor belt
        ctx.fillStyle = '#333';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        // Draw moving items
        this.items.forEach(item => item.draw(ctx));
    }
}

class ConveyorItem {
    x: number;
    y: number;
    speed: number;
    size: number;

    constructor(x: number, y: number, speed: number) {
        this.x = x;
        this.y = y;
        this.speed = speed;
        this.size = 30;
    }

    update() {
        this.x += this.speed;
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = '#ff8800';
        ctx.fillRect(this.x, this.y - this.size / 2, this.size, this.size);
    }

    isOffScreen(conveyorStartX: number, conveyorWidth: number): boolean {
        return this.x > conveyorStartX + conveyorWidth || this.x < conveyorStartX;
    }
}

// 5. Futuristic Theme
class FuturisticTheme implements ITheme {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private particles: Particle[];

    constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.particles = [];
        this.spawnParticles();
    }

    spawnParticles() {
        setInterval(() => {
            const x = Math.random() * this.canvas.width;
            const y = Math.random() * this.canvas.height;
            const speed = (Math.random() - 0.5) * 2;
            const direction = Math.random() * 2 * Math.PI;
            this.particles.push(new Particle(x, y, speed * Math.cos(direction), speed * Math.sin(direction)));
        }, 50);
    }

    draw() {
        this.particles.forEach(particle => {
            particle.update(this.canvas);
            particle.draw(this.ctx);
        });
        // Optionally remove particles that are off-screen
        this.particles = this.particles.filter(particle => !particle.isOffScreen(this.canvas));
    }

    onResize() {
        // Optionally handle resizing for futuristic theme
    }
}

class Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    color: string;

    constructor(x: number, y: number, vx: number, vy: number) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.size = Math.random() * 3 + 1;
        this.color = `hsl(${Math.random() * 360}, 100%, 50%)`;
    }

    update(canvas: HTMLCanvasElement) {
        this.x += this.vx;
        this.y += this.vy;
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
        ctx.fillStyle = this.color;
        ctx.fill();
    }

    isOffScreen(canvas: HTMLCanvasElement): boolean {
        return this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height;
    }
}

// 使用例
// HTMLに<canvas id="backgroundCanvas"></canvas>があると仮定


// テーマを変更する場合は、新しいインスタンスを作成するか、LiveBackgroundクラスを拡張してください。
// liveBackground.destroy(); // アニメーションを停止したい場合

