/**
 * Clamor-Ball
 * JavaScript
 * This version of clamor.js uses global objects and object literals.
 */

//global variables
// $RP: Rather than have this global, we should pass it into our main game module
// 		so the gaming mechanisms don't know directly what they're drawing to.
// $ES: I will try that.  Question: Does the main game module decide what to draw
//    or to the objects themselves ask the game module to draw them?

//Main Game Module

/** $ES: Question: should the main game module be a constructor rather than an object literal?
 *    this presumes var game defined below is an object literal...
 *    because, for example:
 *    function Game() {};
 *    Game.prototype.someUsefulObject = {me: 'I am useful'};
 */
var game = {
isRunning: true,
isPaused: false,
pause: function (e) {
    var k = e.keyCode;
    if (k == 80) {
        game.isPaused = !game.isPaused;
    };
    //$ES: is it possible to have a generic notify function that readable data to
    //    the diagnostics?  Or am I describing an event?
    out6.innerHTML = 'KeyCode: ' + k + ' paused: ' + game.isPaused;
},
loseLife: function () {
    lives.remaining--;
},
draw:  function (object) {
    var canvas = document.getElementById('game');
    var c = canvas.getContext('2d');
    // this looks clumsy, perhaps make it into verifyProperties function below?
    if (object.hasOwnProperty('x') &&
        object.hasOwnProperty('y') &&
        object.hasOwnProperty('color')
        ) {
    //do nothing
    };
}
    
};

// Takes an object and nArgs to verify if object has the needed properties
function verifyProperties(obj, nArgs) {
    //todo
};

var canvas = document.getElementById('game');
var c = canvas.getContext('2d');
var output = document.getElementById('output');
var bcr = canvas.getBoundingClientRect();
var requestID = 0;
var intervalID = 0;

var gameState = {
    //moved to game object
};

var frame = {
    count: 0,
    reset: function () {
        this.count = 0;
    }
};

// $RP: Instead of a "lives" class, I think the game should just fire an event when a life would be lost
//		Then, the main game driver can decide what should happen as a consequence.
var lives = {
    remaining: 2,
    reset: function () {
        this.remaining = 2;
    },
    update: function () {
		// $RP: We should avoid having game components draw directly to the screen.
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
		// $RP: We should avoid having game components draw directly to the screen.
		//		Depending on what the rules are for scoring, we may want to again use events
		//		to trigger to the game driver that the score should be updated. So, we don't
		//		track here what the total score is, just raise an event that indicates how much
		//		the score has changed by.
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
		// $RP: Rather than write directly to the display, let an interested party just
		//		read the "elapsed" property and display it as they like.
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
	// $RP: Ball should just have a 'size' property (in pixels) which would be used to draw and calculate boundaries
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
			// $RP: Raise an event that a point was scored (let the game driver decide to speed up/change color, etc).
            score.points++;
            if (score.points % 5 == 0) {
                ball.setColor();
            };
        };
        if (this.y >= canvas.height - this.width){
			//$RP: Raise an event that the point was lost. Let the game driver decide what happens)
            ball.reset();
            paddle.reset();
            game.loseLife();
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
reset:  function () {
    this.color = 'white';
},
    update: function () {
        this.draw();
        this.displayCoords();
    }
};

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


//game loop here
initCanvas();
requestID = requestAnimationFrame(render);

function gameOver() {
    game.isRunning = false;
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
    document.addEventListener('keydown', game.pause, false);
};

function initCanvas() {
    canvas.width = 336;
    canvas.height = 320;
    clearCanvas();
    addELs();
};

function gameReset() {
    if (!game.isRunning){
        t.getElapsed();
        addELs();
        frame.reset();
        score.reset();
        lives.reset();
        ball.reset();
        paddle.reset();
        t.getElapsed();
        render();
        game.isRunning = true;
        game.isPaused = false;
    };
};

function clearCanvas() {
    c.fillStyle = 'black';
    c.fillRect(0,0,canvas.width,canvas.height);
};