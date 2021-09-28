import * as PIXI from "pixi.js";
import { CustomSimpleRope } from "./modified-pixi/CustomSimpleRope";
import "./style.css";

// Start demo
let count = 0;

// build a rope!
const ropeLength = 45;

const points: PIXI.Point[] = [];

for (let i = 0; i < 25; i++) {
  points.push(new PIXI.Point(i * ropeLength, 0));
}

const strip = new CustomSimpleRope(
  PIXI.Texture.from(
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQMAAADCCAMAAAB6zFdcAAAAV1BMVEUAAAD////z8/NSUlJra2tjY2Pu7u6VlZXf398jIyO5ubmcnJyPj4/FxcV7e3v8/PypqalISEiCgoIyMjIQEBCioqK0tLRaWlo8PDxzc3PZ2dnl5eXLy8uC9JdWAAABb0lEQVR4nO3QSVYCQRBF0Uh6kEYaUYH9r5OPmQNdgZM7eifyVGVV3KqqaWttn05aOySzjPM0WSSbdNnHVbJM11XrcfqeJsfklC76OE9m6aG1ybjirV9xT7bpueoyTj/6O6+Hd8k142d/+Jrs0q+q7+SW8ZZeqs7JNuO9n/7a4DF+amywGVcc+16vDR5/N1j9fJwBAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABAwYMGDBgwIABg/80eAI7jrM/HGx1iQAAAABJRU5ErkJggg=="
  ),
  points
);

strip.x = 10;
strip.y = 300;

const g = new PIXI.Graphics();
g.x = strip.x;
g.y = strip.y;

const app = new PIXI.Application();
document.body.appendChild(app.view);

console.log("WEBGL?", app.renderer.type === PIXI.RENDERER_TYPE.WEBGL);

app.stage.addChild(strip);
app.stage.addChild(g);
app.stage.scale.set(0.66);

// start animating
app.ticker.add(() => {
  count += 0.1;

  // make the snake
  for (let i = 0; i < points.length; i++) {
    points[i].y = Math.sin(i * 0.5 + count) * 30;
    points[i].x = i * ropeLength + Math.cos(i * 0.3 + count) * 40;
  }
  renderPoints();
});

function renderPoints() {
  g.clear();

  g.lineStyle(2, 0xffc2c2);
  g.moveTo(points[0].x, points[0].y);

  for (let i = 1; i < points.length; i++) {
    g.lineTo(points[i].x, points[i].y);
  }

  for (let i = 1; i < points.length; i++) {
    g.beginFill(0xff0022);
    g.drawCircle(points[i].x, points[i].y, 10);
    g.endFill();
  }
}
