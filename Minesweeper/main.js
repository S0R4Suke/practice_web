"use strict";
//W=幅,H=高さ,BOMB=爆弾の数,cell=タイトルを管理する二次元配列,opened=オープンしたタイルの数
var W=10,H=10,BOMB=10,cell=[],opened=0;

//初期化関数
function init(){
    //ID:mainを持つtable要素への参照を取得
    var main = document.getElementById("main");
    //以下は行と列の作成
    //高さ
    for(var i=0;i<H;i++){
        //cellの初期化
        cell[i]=[];
        //新しいtr要素の作成
        var tr = document.createElement("tr");
        //幅
        for(var j=0;j<W;j++){
            //新しいtd要素の作成
            var td = document.createElement("td");
            //clickイベントが起きるたびにtdに対してclickを実行
            td.addEventListener("click",click);
            //tdにクラス名"cell"を付与,CSSで参照している
            td.className="cell";
            //以下2行はクリックされた時用のx、yのプロパティを追加
            td.y = i;
            td.x = j;
            //cellのそれぞれの要素に対してtdを代入
            cell[i][j] = td;
            //trを親ノードにして子ノードにtdを追加
            tr.appendChild(td);
        }
        //mainを親ノードにして子ノードにtrを追加
        main.appendChild(tr);
    }
    //10個の爆弾を配置する処理
    for(var i=0;i<BOMB;i++){
        //
        while(true){
            //ランダムに算出されたW未満の数以下の最大の整数をxに格納
            var x = Math.floor(Math.random()*W);
            //ランダムに算出されたW未満の数以下の最大の整数をyに格納
            var y = Math.floor(Math.random()*H);
            //以下は爆弾が既におかれている場合の処理
            //cell[x][y]に爆弾がまだ置かれていない場合は、
            if(!cell[x][y].bomb){
                //爆弾を置いたことにするためtrueに
                cell[x][y].bomb = true;
                //cell[x][y].textContent="*";
                //whileの終了
                break;
            }
        }
    }
}
//座標周辺にいくつの爆弾があるかの計算をする関数
function count(x,y){
    //b=爆弾の数
    var b=0;
    //y座標の一つ前からy座標の1つ先まで
    for(var j = y-1;j <= y+1;j++){
        //x座標の一つ前からx座標の一つ先まで
        for(var i = x-1;i <= x+1;i++){
            //j=-1のときなどに爆弾を数えないようにするためのif文
            if(cell[j] && cell[j][i]){
                //cell[j][i]=trueだったとき、爆弾の数を1増やす
                if(cell[j][i].bomb)b++;
            }
        }
    }
    //爆弾の数を返す
    return b;
}
//クリックされた場所の周辺を開ける関数
function open(x,y){
    //y座標の一つ前からy座標の1つ先まで
    for(var j = y-1;j <= y+1;j++){
        //x座標の一つ前からx座標の一つ先
        for(var i = x-1;i <= x+1;i++){
            //j=-1のときなどに処理をしない
            if(cell[j] && cell[j][i]){
                //c = cell[j][i]がtrueまたはfalse
                var c = cell[j][i];
                //爆弾がすでに置かれているまたは爆弾があるセルだった場合
                if(c.opened || c.bomb){
                    //何もしない
                    continue;
                }
                //マス目を開く関数
                flip(c);
                //cell[i][j]付近の爆弾の数をnに代入
                var n = count(i,j);
                //n==0だったとき、
                if(n == 0){
                    //開ける(これで隣接する周辺の爆弾の数が0のセルも開く)
                    open(i,j);
                //n!=0だったとき、
                }else{
                    //セルに爆弾の数を渡す(表示)
                    c.textContent = n;
                }
            }
        }
    }
    //マスを開く処理
    function flip(cell){
        //cellにクラス名"cell open"を付与
        //CSSで参照
        cell.className = "cell open";
        //セルが開いた時、
        cell.opened = true;
        //openedを1加算し、残る未開封パネル数が爆弾の数を超えたとき、
        if(++opened >= (W*H - BOMB)){
            //titleをGoodJobに変えて表示
            document.getElementById("title").textContent = "Good Job!";
        }
    }
}
//クリックされたときの処理
//eはクリックされたときの様々な状態
function click(e){
    //src にクリックされたときの様々な状態を格納
    var src = e.currentTarget;
    //src = true、つまり爆弾がクリックされたとき、
    if(src.bomb){
        //cellの要素全てに対して以下の操作を実行する
        cell.forEach(function(tr){
            //trの要素全てに対して以下の操作を実行する
            tr.forEach(function(td){
                //td.bomb=true、つまりセルに爆弾があるとき、
                if(td.bomb){
                    //爆弾がある場所に＋を表示
                    td.textContent= "+";
                }
            })
        });
        //titleをGameOverに変えて表示
        document.getElementById("title").textContent = "Game Over";
    }else{
        //爆弾がないときは開ける
        open(src.x,src.y);
    }
}