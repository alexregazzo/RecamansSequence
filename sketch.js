let recaman;
let arcs = [];
let biggest = 1;
let scl = 0;
let scaling = 0;

// sound

let attackLevel = 1.0;
let releaseLevel = 0;

let attackTime = 0.001
let decayTime = 0.2;
let susPercent = 0.2;
let releaseTime = 0.5;

let osc;
let env;

function setup() {
  createCanvas(windowWidth, windowHeight);
  recaman = new Recaman();

  env = new p5.Env();
  env.setADSR(attackTime, decayTime, susPercent, releaseTime);
  env.setRange(attackLevel, releaseLevel);

  osc = new p5.Oscillator();
  osc.setType('sine');
  osc.amp(env);
  osc.start();

  background(0);

  noLoop();
}

function draw() {
  // background(0);
  translate(0, height / 2);
  scl = lerp(scl, (width) / biggest, 0.1);
  if (abs(scaling - scl) > 0.001) {
    scaling = scl;
    background(0);
    scale(scaling);
    for (let arc of arcs) {
      arc.show();
    }
  } else {
    scale(scaling);
  }

  if (arcs.length > 0) {
    let arc = arcs[arcs.length - 1];
    arc.run();
    arc.show();
  }
  if (arcs.length === 0 || arcs[arcs.length - 1].done()) {
    recaman.step();
    let n = recaman.sequence[recaman.sequence.length - 1] % 25 + 24;
    let freq = pow(2, (n - 49) / 12) * 440;
    osc.freq(freq);
    env.play();
  }
}

class Recaman {
  constructor() {
    this.sequence = [0];
    this.spots = [true];
    this.startColor = color(random(255), random(255), random(255));;
    this.actualColor = this.startColor;
    this.endColor = color(random(255), random(255), random(255));;
    this.completed = 0;
  }

  colorLerp() {
    this.actualColor = lerpColor(this.startColor, this.endColor, this.completed);
    this.completed += 0.01;
    if (this.completed >= 1) {
      this.completed = 0;
      this.startColor = this.endColor;
      this.endColor = color(random(255), random(255), random(255));
    }
  }

  step() {
    let index = this.sequence[this.sequence.length - 1] - this.sequence.length;
    if (index <= 0 || this.spots[index]) {
      index = this.sequence[this.sequence.length - 1] + this.sequence.length;
    }
    this.spots[index] = true;
    this.sequence.push(index);
    if (index > biggest) {
      biggest = index;
    }
    if (this.sequence.length > 1) {
      let i = this.sequence.length - 1;
      let d = abs(this.sequence[i] - this.sequence[i - 1]);
      let x = abs(this.sequence[i] + this.sequence[i - 1]) / 2;
      arcs.push(new Arc(x, 0, d, i % 2, this.sequence[i] - this.sequence[i - 1] < 0 ? 1 : 0, this.actualColor));
    }
    this.colorLerp();
  }
}


class Arc {
  constructor(x, y, d, index, correction, c) {
    this.x = x;
    this.y = y;
    this.d = d;
    this.index = index;
    this.correction = correction;
    this.complete = 0.0001;
    this.color = c;
    if (index === 0) {
      this.start = PI;
      this.end = TWO_PI;
    } else {
      this.start = 0;
      this.end = PI;
    }
  }

  show() {
    stroke(this.color);
    noFill();
    if (this.index === this.correction) {
      arc(this.x, this.y, this.d, this.d, this.start, lerp(this.start, this.end, this.complete));
    } else {
      arc(this.x, this.y, this.d, this.d, lerp(this.end, this.start, this.complete), this.end);
    }
  }

  done() {
    if (this.complete === 1) {
      this.show = function() {
        stroke(this.color);
        noFill();
        arc(this.x, this.y, this.d, this.d, this.start, this.end);
      }
      this.done = function(){return true;};
      return true;
    } else {
      return false;
    }

    return this.complete === 1;
  }

  run() {
    if (this.complete < 1) {
      // this.complete = 1;
      this.complete += 0.05;

    }
    if (this.complete > 1) {
      this.complete = 1;
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  background(0);
  scale(scaling);
  for (let arc of arcs) {
    arc.show();
  }
}

function keyPressed() {
  switch (keyCode) {
    case 32:
      loop();
      break;
    default:
      console.log(keyCode);
      break;
  }
}
