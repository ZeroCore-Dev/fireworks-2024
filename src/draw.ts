function width(context: CanvasRenderingContext2D) {
    return context.canvas.width;
}

function height(context: CanvasRenderingContext2D) {
    return context.canvas.height;
}

function clear(context: CanvasRenderingContext2D) {
    context.fillStyle = "#202124";
    context.clearRect(0, 0, width(context), height(context));
}

class Firework {
    constructor(
        public nowPoint: Point,
        public toPoint: Point,
        public direction: Direction,
        public exploded: boolean,
        public colorFrom: string,
        public colorEnd: string,
        public expansion: number) {
    }

}


type State = {
    frame: bigint,
    fireworks: Firework[],
    fontSize: number,
    fontTurnBig: boolean
}

function defaultState() {
    return {
        frame: BigInt(0),
        fireworks: [],
        fontSize: 40,
        fontTurnBig: true
    } as State;
}

const fireworkFrame = BigInt(500);

function nextState(context: CanvasRenderingContext2D,state: State) {
    state.frame++;
    if(state.fireworks.length < 15 && state.frame < fireworkFrame) {
        const generateCount = randomBetween(1, 3);
        for(let i = 0; i < generateCount; i++) {
            generateFireworks(state, context);
        }
    }

    state.fireworks.forEach(firework =>{
        if(firework.nowPoint.distanceTo(firework.toPoint) < 20) {
            if(!firework.exploded)
                firework.exploded = true;

            firework.expansion += 5;
        }else{
            firework.nowPoint.x += firework.direction.x * speed(firework.nowPoint, firework.toPoint)
            firework.nowPoint.y += firework.direction.y * speed(firework.nowPoint, firework.toPoint);
        }
    });

    state.fireworks = state.fireworks.filter(firework => !firework.exploded || firework.expansion < 240)

    if(state.fireworks.length === 0 && state.frame > fireworkFrame){
        if(state.fontTurnBig) {
            state.fontSize = state.fontSize + 0.2;
            if(state.fontSize > 100){
                state.fontTurnBig = false;
            }
        }else{
            state.fontSize = state.fontSize - 0.2;
            if(state.fontSize < 40){
                state.fontTurnBig = true;
            }
        }
    }

    return state;
}

export function draw(context: CanvasRenderingContext2D, state = defaultState()) {
    clear(context);

    if(state.frame < fireworkFrame || state.fireworks.length !== 0){
        drawFireworks(context, state.fireworks)
    }else{
        drawText(context, state);
    }

    requestAnimationFrame(() => draw(context, nextState(context, state)));
}

function drawText(context: CanvasRenderingContext2D, state: State){
    // 设置字体和颜色
    context.font = `bold italic ${state.fontSize}px Arial`;
    context.fillStyle = 'red';

    // 创建阴影
    context.shadowColor = 'rgba(255, 100, 100, 0.3)';
    context.shadowOffsetX = 5;
    context.shadowOffsetY = 5;
    context.shadowBlur = 10;

    // 绘制文本
    context.fillText("新年快乐", 300, 300);
}


function randomBetween(min: number, max: number) {
    return Math.random() * (max - min) + min;
}

function generateFireworks(state: State, context: CanvasRenderingContext2D) {
    const colors = [
        ["rgba(255, 200, 100, 0.5)", "rgba(255, 0, 0, 0.2)"],
        ["rgba(255, 255, 100, 0.5)", "rgba(255, 0, 255, 0.2)"],
        ["rgba(100, 255, 100, 0.5)", "rgba(0, 255, 255, 0.2)"],
        ["rgba(100, 100, 255, 0.5)", "rgba(255, 255, 0, 0.2)"],
        ["rgba(255, 100, 255, 0.5)", "rgba(0, 255, 0, 0.2)"],
    ]

    const color = colors[Math.floor(randomBetween(0, colors.length))];
    const fromPoint = new Point(
        randomBetween(width(context) / 6, width(context) * 5 / 6),
        randomBetween(height(context) * 5 / 6, height(context))
    );
    const toPoint = new Point(
        randomBetween(width(context) / 6, width(context) * 5 / 6),
        randomBetween(height(context) / 6, height(context) * 2 / 6)
    );
    state.fireworks.push(new Firework(
        fromPoint,
        toPoint,
        Direction.fromPointToPoint(fromPoint, toPoint),
        false,
        color[0],
        color[1],
        randomBetween(10, 20)
    ));
}

function speed(from: Point, to: Point){
    return Math.max( 4, from.distanceTo(to) / 100 );
}


function drawFireworks(context:CanvasRenderingContext2D, fireworks: Firework[]){
    fireworks.forEach(firework => {
        if(firework.exploded) {
            for(let i = 0; i < firework.expansion / 50; i++) {
                drawExplodedFireworks(context, firework.colorFrom, firework.colorEnd, firework.toPoint, firework.expansion - 5 * i);
            }
        } else {
            drawNonExplodedFireworks(context, firework.nowPoint, firework.direction);
        }
    });
}



class Point {
    constructor(public x: number, public y: number) {
    }

    distanceTo(point: Point) {
        const x = point.x - this.x;
        const y = point.y - this.y;
        return Math.sqrt(x * x + y * y);
    }
}

class Direction {
    constructor(public x: number, public y: number) {
    }

    static fromPointToPoint(from: Point, to: Point) {
        const x = to.x - from.x;
        const y = to.y - from.y;
        const length = Math.sqrt(x * x + y * y);
        return new Direction(x / length, y / length);
    }
}

function drawNonExplodedFireworks(context: CanvasRenderingContext2D, point: Point, direction: Direction) {
    // 移动原点到绘制位置
    context.translate(point.x, point.y);
    // 旋转坐标系
    const angle =  Math.PI / 2 - Math.atan2(-direction.y, direction.x);
    context.rotate(angle);

    // 白色到透明渐变的样式
    const gradient = context.createRadialGradient(0, 0, 1, 0, 0, 3);
    gradient.addColorStop(0, "white");
    gradient.addColorStop(1, "rgba(255, 255, 255, 0.1)");

    // 尾部的火焰椭圆形渐变样式
    const gradient2 = context.createRadialGradient(0, 100, 20, 0, 100, 60);
    gradient2.addColorStop(0, "rgba(255, 255, 255, 0)");
    gradient2.addColorStop(1, "rgba(255, 255, 255, 0.5)");

    // 发光头部
    context.beginPath();
    context.arc(0, 0, 5, 0, Math.PI * 2);
    context.fillStyle = gradient;
    context.fill();
    context.closePath();

    // 火焰
    context.beginPath();
    context.lineWidth = 2;
    context.moveTo(0, 0);
    context.lineTo(0, 80);
    context.strokeStyle = gradient2;
    context.stroke();
    context.closePath();

    // 撤销旋转
    context.rotate(-angle);
    // 把原点移动回来
    context.translate(-point.x, -point.y);
}

function drawExplodedFireworks(context: CanvasRenderingContext2D, colorFrom: string, colorEnd: string, point: Point, expantion: number) {
    const particleSize = Math.max(expantion / 200, 4);
    const particleCount = expantion * 2 * Math.PI / particleSize / 5;

    const style = context.createRadialGradient(0, 0, 0.5, 0, 0, particleSize - 0.5);
    style.addColorStop(0, colorFrom);
    style.addColorStop(1, colorEnd);

    context.translate(point.x, point.y);

    for (let i = 0; i < particleCount; i++) {

        const angle = Math.PI * 2 / particleCount * i;
        const x = Math.cos(angle) * expantion;
        const y = Math.sin(angle) * expantion;

        context.translate(x, y);
        context.rotate(angle);

        context.beginPath();
        context.arc(0, 0, particleSize, 0, Math.PI * 2);
        context.fillStyle = style;
        context.fill();
        context.closePath();

        context.rotate(-angle);
        context.translate(-x, -y);


    }

    context.translate(-point.x, -point.y);

}