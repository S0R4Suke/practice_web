"use strict";
//ctx=,paddle=パドル(自分の板),ball=弾,timer=メインループのタイマー,blocks=ブロック
var ctx,paddle,ball,timer,blocks=[];
//balls=初期残機,score=初期スコア,WIDTH/HEIGHT=画面サイズ
var balls=3,score=0,WIDTH=600,HEIGHT=600;
//colors=ブロックの色
var colors=['red','orange','yellow','green','purple','blue'];

//弾の動き
function Ball() {
    //thisはfunctionを呼んだ時の.の前についているオブジェクト
    //ボールの中心x座標
    this.x = 0;
    //ボールの中心y座標
    this.y = HEIGHT + this.r;
    //x軸方向の変化量
    this.dx = 0;
    //y軸方向の変化量
    this.dy = 0;
    //r＝ボールの半径
    this.r = 10;
    //ボールの進む向きをラジアン単位で格納
    this.dir = 0;
    //スピード
    this.speed = 10;
    //ボールを動かすメソッド(メソッド＝オブジェクトに対する操作)
    this.move = function () {
        //ボールをx方向に変化量分動かす
        this.x += this.dx;
        //ボールをy方向に変化量分動かす
        this.y += this.dy;
    }
    //壁やブロック、パドルに当たったときの処理
    //三角関数を使った処理
    this.changeDir = function (dir) {
        //角度の変更
        this.dir = dir;
        //増分x軸＝スピード×cosdir(角度)
        this.dx = this.speed * Math.cos(dir);
        //増分y軸＝スピード×sindir(角度)
        this.dy = -this.speed * Math.sin(dir);
    }
    //ボール描画メソッド
    this.draw = function (ctx) {
        //drawBall関数に対してx座標、y座標、半径を与える
        drawBall(this.x, this.y, this.r);
    }
}
//prototype=内部プロパティ
//あるオブジェクトが自信で保有していないプロパティを命令されたとき、
//自信の代わりにそのプロパティを設定されたオブジェクトから探索しに行く参照
Block.prototype = Paddle.prototype = {
    //識別子drawを設定
    draw: function (ctx) {
        //fillstyle=canvasで使った塗りつぶし
        ctx.fillStyle = this.color;
        //fillRect=塗りつぶされた矩形を描く
        ctx.fillRect(this.x, this.y, this.w, this.h);
    }
}
//ブロックオブジェクトの定義
function Block(x, y, i) {
    //x座標
    this.x = x;
    //y座標
    this.y = y;
    //幅w
    this.w = 50;
    //高さh
    this.h = 20;
    //色
    this.color = colors[i];
    //ブロック毎(色別)に点数を付与
    this.point = (6 - i) * 10;
}
//パドルオブジェクトの定義
function Paddle() {
    //幅w
    this.w = 110;
    //高さh
    this.h = 20;
    //x座標を(画面の横幅-幅)/2に指定＝画面の中央
    this.x = (WIDTH - this.w) / 2;
    //y座標を(高さ-20)に指定＝画面底から20px
    this.y = HEIGHT - 20;
    //カラー指定
    this.color = 'yellow'
    //以下2行は左右のキーが押されているかどうかのプロパティ(初期値はFalseに)
    this.keyL = false;
    this.keyR = false;
}
//初期化関数
function init() {
    //canvas要素の2dグラフィックを描画するためのメソッドやプロパティを得る
    ctx = document.getElementById('canvas').getContext('2d');
    //フォントを20pt、Arialに指定
    ctx.font = "20pt Arial";
    //【e.keyCode】これは現在非推奨(非対応ブラウザもあり)、押されたキーに応じた数字を返す
    //現在は【e.key】が推奨、押されたキーの文字、数字がそのまま返される
    //ボタンが押されたとき、
    window.addEventListener('keydown', function (e) {
        //togglekey関数を呼び出す
        toggleKey(e.keyCode, true);
    //第3引数がtrue＝親から先に発火
    }, true);
    //キーが押されてないとき、
    window.addEventListener('keyup', function (e) {
        //togglekey関数を呼び出す
        toggleKey(e.keyCode, false);
    //第3引数がtrue=親から先に発火
    }, true);

    //パドルオブジェクトを作成
    paddle = new Paddle();
    //ボールオブジェクトを作成
    ball = new Ball();
    //ゲームの開始時点での処理
    start();
    
    //タイマーのセット
    if (isNaN(timer)) {
        //mainLoop関数を15ミリ秒間隔で呼び出す
        timer = setInterval(mainLoop, 15);
    }
}
//キーが押されたときの処理
function toggleKey(code,flag){
    //event.keyCodeによってキーが押されると数字が返されるので、返された数字に応じて処理をする(非推奨)
    switch(code){
    //switch文はbreak;によってそのケースの処理を終えるので忘れないよう注意
    //breakがない場合、case以下の処理全てを行ってしまう

        //左矢印キーが押されたとき、その状態をKeyLプロパティに格納
        case 37:paddle.keyL = flag; break;
        //右矢印キーが〃
        case 39:paddle.keyR = flag; break;
        //スペースキーが押されたとき、
        case 32:
            //プレイ中でないとき(ボールが動いていないとき)
            if(!isPlaying()){
                //ボールの位置を初期化
                //x座標がパドルの中央
                ball.x = paddle.x + paddle.w /2;
                //y座標がパドルの上に来るように設定
                ball.y = paddle.y - ball.r;
                //角度は(乱数×π/2+π/4)になるように設定
                //Math.randomは0以上1未満の間の乱数を返す(よって、45~135°)
                ball.changeDir(Math.random() * Math.PI / 2 + Math.PI / 4);
            }
            break;
    }
}
//ゲーム開始処理
function start(){
    //ブロック崩しスタート時と全部のブロックを崩したときに以下の処理が発生
    //paddleの幅を設定
    paddle.w = Math.max(20,paddle.w - 10);
    //ボールのスピードを設定
    ball.speed = Math.min(20,ball.speed + 1);

    //6列
    for(var i = 0;i < 6;i++){
        //9個/列
        for(var j = 0;j < 9;j++){
            //ブロックを配置
            blocks.push(new Block(j * 60 + 35,i * 30 + 50,i));
        }
    }
}
/*メインループ関数(OS のない組込みシステムでは，CPU がリセットされてプログラム実行開始用の
先頭アドレスから動き始めると必ずどこかで永久にループしていなければならないためループさせる)*/
function mainLoop(){
    //キーが押されたとき(左)
    if(paddle.keyL){
        //パドルのx座標を左に動かす
        //Math.maxで画面外に出ないように
        paddle.x = Math.max(0,paddle.x - 10)
    }
    //キーが押されたとき(右)
    if(paddle.keyR){
        //パドルのx座標を右に動かす
        //Math.minで画面外に出ないように
        paddle.x = Math.min(WIDTH - paddle.w,paddle.x + 10)
    }
    //パドルを描画
    draw();
    
    //プレイ中でないとき
    if(!isPlaying()){
        //ここで関数を抜ける
        return;
    }

    //ボールのy座標がパドルより下に来たとき、
    if(ball.y > HEIGHT - paddle.h){
        //パドルに当たっているならば(パドルとボールのx、y座標、幅wと高さhを比較)
        if(paddle.x < ball.x && ball.x < paddle.x + paddle.w && paddle.y < ball.y && ball.y < paddle.y + paddle.h){
            //反射角の計算
            var ratio = (paddle.x + paddle.w / 2 - ball.x) / paddle.w * 0.8;
            //角度の設定
            ball.changeDir(Math.PI / 2 + Math.PI * ratio);
        //当たらなかったとき(ボールが落ちたとき)
        }else{
            //ボールが0になったなら、
            if(--balls == 0){
                //タイマーを止める
                clearInterval(timer);
                //タイマーを非数(NaN)に設定
                timer = NaN;
                //描画(timer = NaN　のとき、 GameOver　を描画する)
                draw();
                //関数を抜ける
                return;
            }
            //残機があるならボールの位置を再セット
            ball.y = HEIGHT + ball.r;
        }
    }
    //次の座標nx
    var nx = ball.x + ball.dx;
    //次のy座標ny
    var ny = ball.y - ball.dy;

    //天井に当たっているかどうか
    if(ny < ball.r && ball.dy < 0){
        //向きを真反対に変える
        ball.changeDir(ball.dir * -1);
    //壁
    }else if(nx < ball.r || nx + ball.r > WIDTH){
        //向きを反転
        ball.changeDir(Math.PI - ball.dir);
    }
    //ブロックと衝突した場合の番号初期値をセット
    var hit = -1;
    //ブロックに当たったときの処理
    blocks.some(function(block,i){
        //次の位置がブロックの座標と被っているかなど
        if(block.x - ball.r < nx && nx < block.x + block.w + ball.r && block.y - ball.r < ny && ny < block.y + block.h + ball.r){
            //ヒットしたブロックの位置を格納
            hit = i;
            //当たってるなら続ける
            return true;
        }
        //当たっていないなら終わる
        return false;
    });

    //hitしたブロックがあるなら、
    if(hit >= 0){
        //スコアにブロックの点数を格納
        score += blocks[hit].point;
        //spliceは要素の削除をする(hitから1つ分)
        blocks.splice(hit,1);
        //blocksが全て消えたとき、
            if(blocks.length <= 0){
            //ボールの位置を初期化
            ball.y = HEIGHT + ball.r;
            //start()を呼び次のステージを開始
            start();
            //関数を抜ける
            return;
        }
        //ブロックに当たった時、ボールの角度を反転
        ball.changeDir(ball.dir * -1);
    }
    //ボールを動かす
    ball.move();
}
//プレイしているかどうか
function isPlaying(){
    //ボールが初期値かどうかで判断
    return ball.y < HEIGHT + ball.r;
}
//ボールの描画関数
function drawBall(x, y, r) {
    //ボールの色指定
    ctx.fillStyle = 'yellow';
    //beginPath()　はパスのリセットをするメソッド。
    ctx.beginPath();
    //arc() はパスに円弧を追加するメソッド
    /*x=中心x座標、y=中心y座標、r＝半径、0=円弧の始まりの角度、
    Math.PI*2=円弧の終わり(0~360なので円になる)、true=反時計回りに始まりから終わりまで描画(省略可)*/
    ctx.arc(x, y, r, 0, Math.PI * 2, true);
    //塗りつぶし
    ctx.fill();
}

//画面全体の描画関数
function draw() {
    //背景色の設定
    //色を黒に
    ctx.fillStyle = 'rgb(0,0,0)';
    //fillRect=塗りつぶしの四角形の描画(x,y,w,h)
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    //ブロックの描画
    //block配列分、
    blocks.forEach(function (block) {
        //ブロックを描画
        block.draw(ctx);
    });

    //パドルを描画
    paddle.draw(ctx);

    //ボールを描画
    ball.draw(ctx);
    //ボールの残機が2個以上、1個以上のときは残機も描画
    if (balls > 2) { drawBall(80, 15, 10); }
    if (balls > 1) { drawBall(50, 15, 10); }

    //スコアの描画
    //緑に指定
    ctx.fillStyle = 'rgb(0,255,0)';
    //テキストで得点を右上に表示
    ctx.fillText(('00000' + score).slice(-5), 500, 30);
    //timer=NaNのとき(残機が0になった時)、
    if (isNaN(timer)) {
        //GAME OVERを表示
        ctx.fillText('GAME OVER', 220, 250);
    }
}