"use strict";
var ctx,paddle,ball,timer,blocks=[];
var balls=3,score=0,WIDTH=600,HEIGHT=600;
var colors=['red','orange','yellow','green','purple','blue'];

function Ball() {
    this.x = 0;
    this.y = HEIGHT + this.r;    // out of the area
    this.dx = 0;
    this.dy = 0;
    this.r = 10;
    this.dir = 0;
    this.speed = 10;

    this.move = function () {
        this.x += this.dx;
        this.y += this.dy;
    }

    this.changeDir = function (dir) {
        this.dir = dir;
        this.dx = this.speed * Math.cos(dir);
        this.dy = -this.speed * Math.sin(dir);
    }

    this.draw = function (ctx) {
        drawBall(this.x, this.y, this.r);
    }
}

Block.prototype = Paddle.prototype = {
    draw: function (ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.w, this.h);
    }
}

function Block(x, y, i) {
    this.x = x;
    this.y = y;
    this.w = 50;
    this.h = 20;
    this.color = colors[i];
    this.point = (6 - i) * 10;
}

function Paddle() {
    this.w = 110;
    this.h = 20;
    this.x = (WIDTH - this.w) / 2;
    this.y = HEIGHT - 20;
    this.color = 'yellow'
    this.keyL = false;
    this.keyR = false;
}

function init() {
    ctx = document.getElementById('canvas').getContext('2d');
    ctx.font = "20pt Arial";

    // initialize event listener
    window.addEventListener('keydown', function (e) {
        toggleKey(e.keyCode, true);
    }, true);
    window.addEventListener('keyup', function (e) {
        toggleKey(e.keyCode, false);
    }, true);

    // initialize players
    paddle = new Paddle();
    ball = new Ball();
    start();

    if (isNaN(timer)) {
        timer = setInterval(mainLoop, 15);
    }
}

function toggleKey(code,flag){
    switch(code){
        case 37:paddle.keyL = flag; break;
        case 39:paddle.keyR = flag; break;
        case 32:
            if(!isPlaying()){
                ball.x = paddle.x + paddle.w /2;
                ball.y = paddle.y - ball.r;
                ball.changeDir(Math.random() * Math.PI / 2 + Math.PI / 4);
            }
            break;
    }
}

function start(){
    paddle.w = Math.max(20,paddle.w - 10);
    ball.speed = Math.min(20,ball.speed + 1);

    //layout blocks
    for(var i = 0;i < 6;i++){
        for(var j = 0;j < 9;j++){
            blocks.push(new Block(j * 60 + 35,i * 30 + 50,i));
        }
    }
}

function mainLoop(){
    //move the paddle
    if(paddle.keyL){
        paddle.x = Math.max(0,paddle.x - 10)
    }
    if(paddle.keyR){
        paddle.x = Math.min(WIDTH - paddle.w,paddle.x + 10)
    }
    draw();
    
    if(!isPlaying()){
        return;
    }

    if(ball.y > HEIGHT - paddle.h){
        //hit the paddle?
        if(paddle.x < ball.x && ball.x < paddle.x + paddle.w && paddle.y < ball.y && ball.y < paddle.y + paddle.h){
            var ratio = (paddle.x + paddle.w / 2 - ball.x) / paddle.w * 0.8;
            ball.changeDir(Math.PI / 2 + Math.PI * ratio);
        }else{
            if(--balls == 0){
                clearInterval(timer);
                timer = NaN;
                draw();
                return;
            }
            ball.y = HEIGHT + ball.r;
        }
    }
    var nx = ball.x + ball.dx;
    var ny = ball.y - ball.dy;

    //hit the wall?
    if(ny < ball.r && ball.dy < 0){
        ball.changeDir(ball.dir * -1);
    }else if(nx < ball.r || nx + ball.r > WIDTH){
        ball.changeDir(Math.PI - ball.dir);
    }
    //hit a block?
    var hit = -1;
    blocks.some(function(block,i){
        if(block.x - ball.r < nx && nx < block.x + block.w + ball.r && block.y - ball.r < ny && ny < block.y + block.h + ball.r){
            hit = i;
            return true;
        }
        return false;
    });

    if(hit >= 0){
        score += blocks[hit].point;
        blocks.splice(hit,1);

        if(blocks.length <= 0){
            ball.y = HEIGHT + ball.r;
            start();
            return;
        }
        ball.changeDir(ball.dir * -1);
    }
    ball.move();
}

function isPlaying(){
    return ball.y < HEIGHT + ball.r;
}

function drawBall(x, y, r) {
    ctx.fillStyle = 'yellow';
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2, true);
    ctx.fill();
}

function draw() {
    // fill background
    ctx.fillStyle = 'rgb(0,0,0)';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    // draw blocks
    blocks.forEach(function (block) {
        block.draw(ctx);
    });

    // draw paddle
    paddle.draw(ctx);

    // draw balls
    ball.draw(ctx);
    if (balls > 2) { drawBall(80, 15, 10); }
    if (balls > 1) { drawBall(50, 15, 10); }

    // draw score & information
    ctx.fillStyle = 'rgb(0,255,0)';
    ctx.fillText(('00000' + score).slice(-5), 500, 30);
    if (isNaN(timer)) {
        ctx.fillText('GAME OVER', 220, 250);
    }
}