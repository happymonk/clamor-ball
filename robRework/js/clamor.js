/**
 * Clamor-Ball
 * JavaScript
 */

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

var gameState = {
    //moved to game object
};
  
var Ball = function(size) {
    this.x = 16;
    this.x2 = this.x + size;
    this.y = 16;
    this.y2 = this.y + size;
    this.dx = 25;  //pixels per second
    this.dy = 100;  //pixels per second
	this.ChangeXDirection = function() {
		this.dx *= -1;
	};
	this.ChangeYDirection = function() {
		this.dy *= -1;
	};
    this.Move = function (elapsed) {
        this.x += this.dx * elapsed; 
        this.y += this.dy * elapsed;
        this.x2 = this.x + this.width;
        this.y2 = this.y + this.height;
    };
	this.SpeedUp = function(v) {
		this.dy *= (1 + v);
	};
	this.SlowDown = function(v) {
		this.dy *= (1 - v);
	};
    this.width = size;
    this.height = size;
};

var Paddle = function(size) {
    this.x = 120;
    this.y = 288;
    this.x2 = null;
    this.y2 = null;
    this.width = size;
    this.height = 10;
	this.Move = function(x) {
		this.x = x;
	};
};

var GameDriver = function (lives, canvas) {
	this.Start = function() {
		//game loop here
		display.ClearCanvas();
		requestID = requestAnimationFrame(this.Action);	
	};
	this.Action = function() {
		var gd = window.GameDriver;
		if (gameProps.NumLives >= 0)
		{
			display.ClearCanvas();
			gd.UpdateElapsedTime();
			gameProps.Ball.Move(gameProps.ElapsedTime);
			gameProps.Paddle.Move(coords.x);
			gd.CheckCollisions();
			display.RenderAction();
			gd.CheckSpeedUp();
			requestID = requestAnimationFrame(gd.Action);
		}
		else
		{
			display.ShowGameOver();
		}
		
	};
	this.MovePaddle = function(e) {
        var x = (e.clientX - bcr.left - (gameProps.Paddle.width/2));
        if (x < 0) {
            gameProps.Paddle.Move(0);
        };
        if (x > 0 && x < canvas.width - gameProps.Paddle.width) {
            gameProps.Paddle.Move(x);
        };
	};
    this.CheckCollisions = function () {
        this.CheckPaddle();
        this.CheckWalls();
    };
    this.CheckWalls = function () {
        if (gameProps.Ball.x <= 0){
            gameProps.Ball.x = 0;
            gameProps.Ball.ChangeXDirection();
        };
        if (gameProps.Ball.x >= canvas.width - gameProps.Ball.width){
            gameProps.Ball.x = canvas.width - gameProps.Ball.width;
            gameProps.Ball.ChangeXDirection();
        };
        if (gameProps.Ball.y <= 0){
            gameProps.Ball.y = 0;
            gameProps.Ball.ChangeYDirection();
            gameProps.Score++;
			this.CheckSpeedUp();
        };
        if (gameProps.Ball.y >= canvas.height - gameProps.Ball.width){
            gameProps.Ball = new Ball(gameProps.Ball.width);
            gameProps.NumLives--;
        };
    };
    this.CheckPaddle = function () {  //check if ball collides with paddle
        if (gameProps.Ball.dy > 0 && gameProps.Ball.y2 >= gameProps.Paddle.y){
            if (gameProps.Ball.x2 >= gameProps.Paddle.x && gameProps.Ball.x <= gameProps.Paddle.x + 
                gameProps.Paddle.width && gameProps.Ball.y2 < gameProps.Paddle.y + 8) {
                gameProps.Ball.ChangeYDirection();
            };
        };
    };
    this.UpdateElapsedTime = function () {
      t0 = t1;
      t1 = Date.now();
      gameProps.ElapsedTime = (t1 - t0)/1000;
    };
    this.ChangeColor = function () {
		gameProps.ColorIndex++;
		if (gameProps.ColorIndex > gameProps.Colors.length)
			gameProps.ColorIndex = 0;
    };
    this.speedLimit = 700,
    this.CheckSpeedUp = function () {
        //speed up the ball
        if (gameProps.Score == gameProps.NextSpeedUp) {
            if (gameProps.Ball.dy > 0 && gameProps.Ball.dy < this.speedLimit){
				gameProps.Ball.SpeedUp(.25);
                gameProps.NextSpeedUp += 5;
                this.ChangeColor();
            };
        };
    };
	this.ResetGameProps = function() {
		var gp = new GameProperties();
		gp.Ball = new Ball(10);
		gp.Paddle = new Paddle(50);
		gp.Score = 0;
		gp.NumLives = lives;
		gp.NextSpeedUp = 5;
		gp.Colors = ['white', 'red', 'orange', 'yellow', 'green', 'blue', 
				 'indigo', 'violet', 'silver', 'gray'];
		gp.ColorIndex = 0;
		return gp;
	};
	this.ResetGame = function(e) {
		gameProps = this.GameDriver.ResetGameProps();
		display.ClearCanvas();
	}
	;
	var bcr = canvas.getBoundingClientRect();	
	var gameProps = this.ResetGameProps();
	var display = new GameDisplay(canvas, gameProps);
	var t0 = Date.now();
	var t1 = Date.now();
	var coords = {
		x: 0,
		y: 0
	};
	
	window.GameDriver = this;
    canvas.addEventListener('mousemove', function(e) {
		coords.x = e.clientX - bcr.left;
		coords.y = e.clientY - bcr.top;
	}, false);
    canvas.addEventListener('mousemove', this.MovePaddle,false);
    canvas.addEventListener('click',this.ResetGame,false);
    document.addEventListener('keydown', gameState.pauseGame, false);
}

var GameProperties = function() {
	this.Ball = null;
	this.Paddle = null;
	this.Score = null;
	this.NumLives = null;
	this.Speed = null;
	this.Frame = 0;
	this.ElapsedTime = 0;
	this.Colors = [];
	this.ColorIndex = 0;
};

var GameDisplay = function (theCanvas, gameProps) {
	this.canvas = theCanvas,
	this.GameProperties = gameProps,
	this.RenderAction = function() {
      this.ClearCanvas();
	  this.DrawPaddle();
	  this.DrawScore();
	  this.DrawLives();
	  this.DrawBall();
      c.save();
      c.fillStyle = 'gray';
      c.fillText('speed' + Math.round(this.GameProperties.Ball.dy),2,20);
      c.restore();
      out3.innerHTML = 'frame: ' + this.GameProperties.Frame;
      //t.getElapsed();
      //t.display();
	  this.GameProperties.Frame++;
	};	
	this.ShowGameOver = function() {
		this.ClearCanvas();
		c.fillStyle = 'red';
		c.fillText('GAME OVER',canvas.width/2 - 
				   32,canvas.height/2);
		c.fillText('-click to start-',canvas.width/2 - 
				   30, canvas.height/2 + 20);	
	};	
	this.ClearCanvas = function() {
		c.fillStyle = 'black';
		c.fillRect(0,0,canvas.width,canvas.height);	
	};
	this.DrawBall = function() {
		c.fillStyle = this.GameProperties.Colors[this.GameProperties.ColorIndex];         
		//c.fillRect(this.x,this.y,this.width,this.height);
	    c.beginPath();
		c.arc(this.GameProperties.Ball.x+5,this.GameProperties.Ball.y+5,5,0,Math.PI*2,false);
		c.fill();	
	};
    this.DrawPaddle = function () {
        c.save();
        c.fillStyle = this.GameProperties.Colors[this.GameProperties.ColorIndex];
        c.fillRect(
		this.GameProperties.Paddle.x,
		this.GameProperties.Paddle.y,
		this.GameProperties.Paddle.width,
		this.GameProperties.Paddle.height);
        c.restore();
    };
    this.DrawScore = function () {
        c.save();
        c.fillStyle = 'rgba(0,255,0,0.75)';
        c.fillText('score: ' + this.GameProperties.Score,2,10);
        c.restore();
    };	
    this.DrawLives = function () {
        c.fillStyle = 'rgba(0,255,0,0.75)';
        c.fillText('lives: ' + this.GameProperties.NumLives,canvas.width - 
                   40, 10);
    };
    this.DisplayPaddleCoords = function () {
      out5.innerHTML = 'paddle: [' + Math.round(this.GameProperties.Paddle.x) + ', ' + 
          Math.round(this.GameProperties.Paddle.y) + '], [' + Math.round(this.GameProperties.Paddle.x2) + 
          ', ' + Math.round(this.GameProperties.Paddle.y2) + ']';
    };
    this.DrawElapsedTime = function () {
		// $RP: Rather than write directly to the display, let an interested party just
		//		read the "elapsed" property and display it as they like.
        out4.innerHTML = 'Elapsed: ' + this.GameProperties.ElapsedTime;
    };
    this.DrawBallCoords = function () {
      out2.innerHTML = 'ball: [' + Math.round(this.GameProperties.Ball.x) + ', ' + 
          Math.round(this.GameProperties.Ball.y) + '], [' + Math.round(this.GameProperties.Ball.x2) + 
          ', ' + Math.round(this.GameProperties.Ball.y2) + ']';
    };
	
	var c = canvas.getContext('2d');
}
