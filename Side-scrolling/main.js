//疑問になりそうな箇所について
//このプログラムでは上端＋高さ＝下端となっているところに疑問を感じるかもしれない
//これは、上端から高さ分離れた場所に下端があると考えるように設計されているためである
//これが分かるのはP188の勾配の説明、又はプログラム125行目以降
"use strict"
//自機のy座標
var y = 250;
//自機の加速度
var v = 0 ;
//キー押してるか否か
var keyDown = false;
//DOMの個数
//DOMとは、Document Object Modelの略で、プログラムからHTMLやXMLを自由に操作するための仕組み
var WALLS = 80;
//DOM要素を格納する配列
var walls = [];
//点数
var score = 0;
//勾配の度合い
var slope = 0;
//時間、自機のDOMオブジェクト、洞窟の通り道の親要素となるDOMオブジェクト
var timer,ship,main;

function init(){
    //htmlでshipとbangのimgをまとめたdiv要素
    main = document.getElementById('main');
    //htmlでshipのimg
    ship = document.getElementById('ship');
    //初期化関数
    for(var i = 0; i < WALLS;i++){
        //createElementは指定したタグを作成する
        //今回はdiv要素を新たに作成している
        walls[i] = document.createElement("div");
        //style.positionはjsでCSSの要素位置指定をするときに使われる
        //absoluteはHTMLに対して位置を絶対的に指定するときに使われる
        walls[i].style.position = "absolute";
        //以下style.positionの具体的な値指定
        //上に100px
        walls[i].style.top = "100px";
        //左にi*10px
        //これは洞窟が80のDOM要素から出来ているため。
        walls[i].style.left = i*10 + "px";
        // 1つのDOM要素幅が10px
        walls[i].style.width = "10px";
        //1つのDOM要素高さが400px
        walls[i].style.height = "400px";
        //背景色を指定
        //#333333は黒
        walls[i].style.backgroundColor = "#333333";
        //Node.appendChildは親Nodeの子ノードリストの末尾にノードを追加する
        //親＝main、子＝walls[i]
        //ノードは要素の集合体の事
        main.appendChild(walls[i]);
    }
    //勾配の計算
    //slopeが正であるとき、下り勾配となるまた、負であるとき、上り勾配となる。正負の計算は130行目付近
    slope = Math.floor(Math.random()*5) + 1;
    //mainloop関数を呼び出してタイマーをセット 
    timer = setInterval(mainloop,50);
    //EcentTarget.addEventListenerは特定のイベントが起きた場合に呼び出される関数をセットする
    //以下はキーが押されたときにkeyDown=trueをセットするという関数をセットしている
    window.addEventListener('keydown',function(){keyDown = true;});
    //以下はキーが押されていないときにkeyDown=falseをセットするという関数をセットしている
    window.addEventListener('keyup',function(){keyDown = false;});
}
//衝突判定
function hitTest(){
    //parseInt(str)はstrの文字を整数型に変換する
    //s=shipの略、w＝wallの略
    //st=shipの上端＋10
    var st = parseInt(ship.style.top) + 10;
    //sh=shipの高さ
    var sh = parseInt(ship.style.height);
    //sb=shipの下端
    var sb = st + sh - 20;
    //wt=壁の上端
    var wt = parseInt(walls[14].style.top);
    //wh=壁の高さ
    var wh = parseInt(walls[14].style.height);
    //wb=壁の下端
    var wb = wh + wt;
    //自機の上端stが壁の上端wtより小さいか、自機の下端sbが洞窟の下端wbより大きい場合は衝突
    return (st < wt) || (sb > wb);
}
//メインのループ関数
function mainloop(){
    //衝突判定
    if(hitTest()){
        //clearIntervalで繰り返し動作をキャンセルする
        //今回の場合は横スクロールを止める
        clearInterval(timer);
        //img bangを出す
        document.getElementById('bang').style.top = (y - 40) + "px";
        //visibilityはCSSのプロパティで、文書のレイアウトを変更することなく要素を出したり隠したりする
        //今回はvisibleで可視状態にしている
        document.getElementById('bang').style.visibility = "visible";
        //ループを終わらせる
        return;
    }
    //スコアを加算する
    score += 10;
    //HTMLのID:scoreに格納されているscoreを紐づけ、表示している
    //toStringでstringにしている
    document.getElementById('score').innerHTML = score.toString();
    //以下2行は加速度の計算
    //？は参考演算子 condition?exprIfTrue:exprIfFalse
    //今回はkeyDownがtrueなら-3、keyDownがfalseなら3を格納している
    //v=速度
    v += keyDown ? -3 : 3;
    //yにvを加算
    y += v;
    //自機の高さにypxを設定
    ship.style.top = y + 'px';
    //edge=一番最後の洞窟を表すDOM要素のスタイル
    //以下そのスタイルの値を格納
    var edge = walls[WALLS - 1].style;
    //上端
    var t = parseInt(edge.top);
    //高さ
    var h = parseInt(edge.height);
    //下端
    var b = h + t;
    //洞窟の上端に勾配分を加算
    t += slope;
    //洞窟の下端に勾配分を加算
    b += slope;
    //勾配が上端又は下端に達したかどうかの判定
    //「洞窟の上端が0かつ勾配が正であるとき」又は「洞窟の下端が600(適当に設定した値)かつ勾配が負であるとき」に衝突したと判定
    if((t<0) && (slope < 0) || (b > 600) && (slope > 0)){
        //下端又は上端に達したとき、slopeを正⇒負又は負⇒正に変更している
        slope = (Math.floor(Math.random()*5)+1) * (slope < 0 ? 1 : -1);
        //以下2行がないと延々上端または下端
        //最後の洞窟の上端
        edge.top = (t + 10) + "px";
        //最後の洞窟の高さ
        edge.height = (h - 20) + "px";
    //上端でも下端でもないとき
    }else{
        //最後の洞窟の上端
        edge.top = t + "px";
    }
    //洞窟を構成する壁を順番に左へ並べるためのfor文
    for(var i = 0;i < WALLS - 1;i++){
        //80個の壁の要素に対して上端をそれぞれ設定
        walls[i].style.top = walls[i + 1].style.top;
        //80個の壁の要素に対して高さをそれぞれ設定
        walls[i].style.height = walls[i + 1].style.height;
    }
}