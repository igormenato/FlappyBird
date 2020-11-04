function newElement(tagName, className) {
  const elem = document.createElement(tagName);
  elem.className = className;
  return elem;
}

function Barrier(reverse = false) {
  this.element = newElement("div", "barrier");

  const barrierBorder = newElement("div", "barrier-border");
  const barrierBody = newElement("div", "barrier-body");
  this.element.appendChild(reverse ? barrierBody : barrierBorder);
  this.element.appendChild(reverse ? barrierBorder : barrierBody);

  this.setHeight = (height) => (barrierBody.style.height = `${height}px`);
}

function PairOfBarriers(height, gap, x) {
  this.element = newElement("div", "pair-of-barriers");

  this.top = new Barrier(true);
  this.bottom = new Barrier(false);

  this.element.appendChild(this.top.element);
  this.element.appendChild(this.bottom.element);

  this.randomizeGap = () => {
    const topHeight = Math.random() * (height - gap);
    const bottomHeight = height - gap - topHeight;
    this.top.setHeight(topHeight);
    this.bottom.setHeight(bottomHeight);
  };

  this.getX = () => parseInt(this.element.style.left.split("px")[0]);
  this.setX = (x) => (this.element.style.left = `${x}px`);
  this.getWidth = () => this.element.clientWidth;

  this.randomizeGap();
  this.setX(x);
}

function Barriers(height, width, gap, barrierDistance, notifyPoint) {
  this.pairs = [
    new PairOfBarriers(height, gap, width),
    new PairOfBarriers(height, gap, width + barrierDistance),
    new PairOfBarriers(height, gap, width + barrierDistance * 2),
    new PairOfBarriers(height, gap, width + barrierDistance * 3),
  ];

  const displacement = 3;
  this.animate = () => {
    this.pairs.forEach((pair) => {
      pair.setX(pair.getX() - displacement);

      if (pair.getX() < -pair.getWidth()) {
        pair.setX(pair.getX() + barrierDistance * this.pairs.length);
        pair.randomizeGap();
      }

      const middle = width / 2;
      const crossedTheMiddle =
        pair.getX() + displacement >= middle && pair.getX() < middle;
      if (crossedTheMiddle) notifyPoint();
    });
  };
}

function Bird(gameHeight) {
  let flying = false;

  this.element = newElement("img", "bird");
  this.element.src = "img/bird.png";

  this.getY = () => parseInt(this.element.style.bottom.split("px")[0]);
  this.setY = (y) => (this.element.style.bottom = `${y}px`);

  window.onkeydown = (e) => (flying = true);
  window.onkeyup = (e) => (flying = false);

  this.animate = () => {
    const newY = this.getY() + (flying ? 8 : -5);
    const maxHeight = gameHeight - this.element.clientHeight;

    if (newY <= 0) {
      this.setY(0);
    } else if (newY >= maxHeight) {
      this.setY(maxHeight);
    } else {
      this.setY(newY);
    }
  };

  this.setY(gameHeight / 2);
}

// const barriers = new Barriers(700, 1200, 200, 400);
// const bird = new Bird(700);
// const gameArea = document.querySelector("[wm-flappy]");
// gameArea.appendChild(bird.element);
// barriers.pairs.forEach((pair) => gameArea.appendChild(pair.element));
// setInterval(() => {
//   barriers.animate();
//   bird.animate()
// }, 20);

function Progress() {
  this.element = newElement("span", "progress");
  this.refreshPoints = (points) => {
    this.element.innerHTML = points;
  };
  this.refreshPoints(0);
}

function overlap(elementA, elementB) {
  const a = elementA.getBoundingClientRect();
  const b = elementB.getBoundingClientRect();

  const horizontal = a.left + a.width >= b.left && b.left + b.width >= a.left;
  const vertical = a.top + a.height >= b.top && b.top + b.height >= a.top;
  return horizontal && vertical;
}

function collision(bird, barriers) {
  let collision = false;
  barriers.pairs.forEach((pairOfBarriers) => {
    if (!collision) {
      const top = pairOfBarriers.top.element;
      const bottom = pairOfBarriers.bottom.element;
      collision = overlap(bird.element, top) || overlap(bird.element, bottom);
    }
  });
  return collision;
}

function FlappyBird() {
  let points = 0;

  const gameArea = document.querySelector("[wm-flappy]");
  const height = gameArea.clientHeight;
  const width = gameArea.clientWidth;

  const progress = new Progress();
  const barriers = new Barriers(height, width, 200, 400, () =>
    progress.refreshPoints(++points)
  );
  const bird = new Bird(height);
  gameArea.appendChild(progress.element);
  gameArea.appendChild(bird.element);
  barriers.pairs.forEach((pair) => gameArea.appendChild(pair.element));

  this.start = () => {
    const timer = setInterval(() => {
      barriers.animate();
      bird.animate();

      if (collision(bird, barriers)) {
        clearInterval(timer);
      }
    }, 20);
  };
}

new FlappyBird().start();
