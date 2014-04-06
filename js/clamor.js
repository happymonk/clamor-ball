/**
 * Clamor-Ball
 * JavaScript
 */

//global variables
var canvas = document.getElementById('canvas');
var c = canvas.getContext('2d');
var output = document.getElementById('output');
var bcr = canvas.getBoundingClientRect();
var requestID = 0;
var intervalID = 0;

var gameState = {
    isRunning: true,
    isPaused: false,
    pauseGame: function (e) {
        var k = e.keyCode; 
        if (k == 80) {
            gameState.isPaused = !gameState.isPaused;
        };
        out6.innerHTML = 'KeyCode: ' + k + ' paused: ' + gameState.isPaused;

    }
};

var frame = {
    count: 0,
    reset: function () {
        this.count = 0;
    }
};

var lives = {
    remaining: 2,
    reset: function () {
        this.remaining = 2;
    },
    update: function () {
        c.fillStyle = 'rgba(0,255,0,0.75)';
        c.fillText('lives: ' + lives.remaining,canvas.width - 
                   40, 10);
    }
};

var score = {
    points: 0,
    reset: function () {
        this.points = 0;
        this.speedup = 5;
    },
    speedup: 5,
    update: function () {
        c.save();
        c.fillStyle = 'rgba(0,255,0,0.75)';
        c.fillText('score: ' + this.points,2,10);
        c.restore();
    }
};

var t = {
    now: 0,
    then: 0,
    elapsed: 0,
    getElapsed: function () {
      if (t.now == 0){t.now = Date.now();};
      t.then = t.now;
      t.now = Date.now();
      t.elapsed = (t.now - t.then)/1000;
    },
    display: function () {
        out4.innerHTML = 'Elapsed: ' + this.elapsed;
    },
    reset: function () {
        t.now = 0;
        t.then = 0;
        t.elapsed = 0;
    }
};
                           
var coords = {
    listener: 'mousemove',    
    f: function (e) {
        this.x = e.clientX - bcr.left; 
        this.y = e.clientY - bcr.top; 
        output.innerHTML = 'mouse: ' + this.x + ', ' + this.y;
    },
    x: 0,
    y: 0
};

var ball = {
    x: 16,
    x2: 26,
    y: 16,
    y2: 26,
    dx: 25,  //pixels per second
    dy: 100,  //pixels per second
    checkCollisions: function () {
        this.checkPaddle();
        this.checkWalls();
    },
    checkWalls: function () {
        if (this.x <= 0){
            this.x = 0;
            this.dx *= -1;
        };
        if (this.x >= canvas.width - this.width){
            this.x = canvas.width - this.width;
            this.dx *= -1;
        };
        if (this.y <= 0){
            this.y = 0;
            this.dy *= -1;
            score.points++;
            if (score.points % 5 == 0) {
                ball.setColor();
            };
        };
        if (this.y >= canvas.height - this.width){
            ball.reset();
            lives.remaining--;
        };
    },
    checkPaddle: function () {  //check if ball collides with paddle
        if (ball.dy > 0 && ball.y2 >= paddle.y){
            if (ball.x2 >= paddle.x && ball.x <= paddle.x + 
                paddle.width && ball.y2 < paddle.y + 8) {
                ball.dy *= -1;
            };
        };
    },
    displayCoords: function () {
      out2.innerHTML = 'ball: [' + Math.round(this.x) + ', ' + 
          Math.round(this.y) + '], [' + Math.round(this.x2) + 
          ', ' + Math.round(this.y2) + ']';
    },
    move: function () {
        this.x += this.dx * t.elapsed; 
        this.y += this.dy * t.elapsed;
        this.x2 = this.x + this.width;
        this.y2 = this.y + this.height;
    },
    colors: ['white', 'red', 'orange', 'yellow', 'green', 'blue', 
             'indigo', 'violet', 'silver', 'gray'],
    setColor: function () {
        var color = ball.color;
        var len = ball.colors.length - 1;
        var i = ball.colors.indexOf(color);
        if (i < len) {
            i += 1;
            ball.color = ball.colors[i];
			paddle.color = ball.color;
        }
        else {
            //when the last color is being used, chose the first
            ball.color = 'white';
        }
    },
    color: 'white', 
    draw: function () {
        c.fillStyle = this.color;         
        //c.fillRect(this.x,this.y,this.width,this.height);
        c.beginPath();
        c.arc(this.x+5,this.y+5,5,0,Math.PI*2,false);
        c.fill();
    },    
    width: 10,
    height: 10,
    reset: function () {
        this.x = 16; 
        this.y = 16;
        this.dx = 25;
        this.dy = 100;
        this.color = 'white';
    },
    speedLimit: 700,
    speedUp: function () {
        //speed up the ball
        if (score.points == score.speedup) {
            if (ball.dy > 0 && ball.dy < ball.speedLimit){
                ball.dy *= 1.25;
                score.speedup += 5;
            };
        };
    },
    update: function () {
        this.checkCollisions();
        this.move();
        this.displayCoords();
        this.draw();
    }
};

var paddle = {
    x: 120,
    y: 288,
    x2: null,
    y2: null,
    width: 50,
    height: 10,
    color: 'white',
    move: function (e) {
        var x = (e.clientX - bcr.left - 25);
        if (x < 0) {
            paddle.x = 0;
        };
        if (x > 0 && x < canvas.width - 50) {
            paddle.x = x;
        };
    },
    draw: function () {
        c.save();
        c.fillStyle = this.color;
        c.fillRect(this.x,this.y,this.width,this.height);
        c.restore();
    },
    displayCoords: function () {
      out5.innerHTML = 'paddle: [' + Math.round(this.x) + ', ' + 
          Math.round(this.y) + '], [' + Math.round(this.x2) + 
          ', ' + Math.round(this.y2) + ']';
    },
    update: function () {
        this.draw();
        this.displayCoords();
    }
};

//game loop here
initCanvas();
requestID = requestAnimationFrame(render);



//end of game loop

//game methods here

function render() {
    if (lives.remaining >= 0){
      clearCanvas();
      paddle.update();
      score.update();
      lives.update();
      ball.update();
      ball.speedUp();
      c.save();
      c.fillStyle = 'gray';
      c.fillText('speed' + Math.round(ball.dy),2,20);
      c.restore();
      out3.innerHTML = 'frame: ' + frame.count;
      requestID = requestAnimationFrame(render);
      t.getElapsed();
      t.display();
      frame.count++;
    }
    else {
        gameOver();
    }
};

function gameOver() {
    gameState.isRunning = false;
    clearCanvas();
    c.fillStyle = 'red';
    c.fillText('GAME OVER',canvas.width/2 - 
               32,canvas.height/2);
    c.fillText('-click to start-',canvas.width/2 - 
               30, canvas.height/2 + 20);
};

function addELs() {
    canvas.addEventListener(coords.listener, coords.f, false);
    canvas.addEventListener('mousemove', paddle.move,false);
    canvas.addEventListener('click',gameReset,false);
    document.addEventListener('keydown', gameState.pauseGame, false);
};

function initCanvas() {
    canvas.width = 336;
    canvas.height = 320;
    clearCanvas();
    addELs();
};

function gameReset() {
    if (!gameState.isRunning){
        t.getElapsed();
        addELs();
        frame.reset();
        score.reset();
        lives.reset();
        ball.reset();
        t.getElapsed();
        render();
        gameState.isRunning = true;
        gameState.isPaused = false;
    };
};

function clearCanvas() {
    c.fillStyle = 'black';
    c.fillRect(0,0,canvas.width,canvas.height);
};