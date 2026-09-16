'use strict';

// =============== < タイル描画の処理 > ==========================================================================================

// タイル配列をローカルストレージから読み込む。なければ新たに配列を作成
function tilesLoad() {
    const saved = localStorage.getItem("tiles");
    let tiles;
    if (saved !== null) { 
        tiles = JSON.parse(saved); 
    } else {
        tiles = [];
        const squares = 180; 
        for (let i=0; i<squares; i++) {
            tiles.push({ 
                type: "none",
                cells: [[],[]],     // 行ごとに要素群を分ける二次元配列を想定
                width: 0,
                height: 0,
                link: {
                    url: "", 
                    name: "", 
                    memo: "", 
                    tileOnName: false, 
                    anotherWindow: false
                }
            });
        }
    }
    return tiles
}
// タイルの見た目部分をdataにindexをふりつつを生成
function makeTile(tiles) {
    // 要素を初期化
    sectionTiles.innerHTML = "";
    occupied.clear();
    // タイル生成をデータ数だけループ
    for (let i = 0; i < tiles.length; i++) {
        // もしoccupiedの中にiがあればこの回をスキップ(複数マスタイルに使用されているサブindexをとばしたindexが振られていく)
        if (occupied.has(i)) continue;

        // typeがlinkTileならlinkタイルを作る
        if (tiles[i].type === "linkTile") { 

            // <div class="tile link-tile">
            //    <div class="tile-image">
            //      <img class="tile-url-image" src="ファビコンURL">
            //    </div>    
            // </div>

            // アイコン全体タグを作成
            const tileTag = document.createElement('div');
            tileTag.classList.add('tile');
            tileTag.classList.add('link-tile')
            tileTag.dataset.index = i;         // タイルをクリックしたときに識別に使用される重要なindex
            tileTag.draggable = true;
            // アイコンの見た目用<div>タグを作成
            const tileImage = document.createElement('div');
            tileImage.classList.add('tile-image');
            // <img>を作成し、srcにファビコンのURL
            const urlImage = document.createElement('img');
            urlImage.classList.add('tile-url-image');
            urlImage.src = convertToFavicon(tiles[i].link.url); 
            // タグを統合 
            tileImage.append(urlImage);
            tileTag.append(tileImage);
            sectionTiles.append(tileTag);  

            // もしtileOnNameがtrueなら名前をタイル上に表示
            if (tiles[i].link.tileOnName) {
                const tileOnName = document.createElement('p');
                tileOnName.classList = 'on-name';
                //長過ぎるnameは省略表示に変えつつ挿入
                tileOnName.textContent = truncate(tiles[i].link.name, 17);
                tileTag.append(tileOnName);
            }
            // 占有済みセットに追加
            addOccupied(tiles[i].cells);
        }

        // もしtypeがnoneなら空タイルを作る
        else if (tiles[i].type === "none") {
            // <div class="tile link-tile">
            //    <div class="tile-image">
            //        <i class="fa-regular fa-square-plus"></i>
            //    </div>    
            // </div>

            // リンクタイルの外側を流用
            const tileTag = document.createElement('div');
            tileTag.classList.add('tile');
            tileTag.classList.add('link-tile')
            // タイルをクリックしたときに識別に使用される重要なindex。
            // 複数マスタイルであれば左上の基準マスのindexがこれになる
            tileTag.dataset.index = i;         
            tileTag.draggable = true;
            const tileImage = document.createElement('div');
            tileImage.classList.add('tile-image');
            // ファビコン画像の代わりに＋マークを入れたタイルを生成
            const plus = document.createElement('i');
            plus.classList.add('fa-regular', 'fa-square-plus');
            // タグを統合 
            tileImage.append(plus);
            tileTag.append(tileImage);
            sectionTiles.append(tileTag);
        }

        // typeがtextTileならtextタイルを作る
        else if (tiles[i].type === "textTile") {
            // <div class="tile text-tile">
            //    <div class="text-area-header">
            //        <p>Memo</P>
            //        <div class="text-area-header-button">
            //            <button>←</button>
            //            <button>→</button>  
            //        </div>
            //    <div/>
            //    <div class="text-area-main">
            //        <textarea></textarea>
            //    </div> 
            //    <div class="text-area-footer">
            //        <button>↑</button>
            //        <button>↓</button>   
            //    </div> 
            // <div/>

            const tileTag = document.createElement('div');
            tileTag.classList.add('tile');
            tileTag.classList.add('text-tile');
            tileTag.dataset.index = i; 
            tileTag.draggable = true;

            // ヘッダー部分
            const textAreaHeaderDiv = document.createElement('div');
            textAreaHeaderDiv.classList.add('text-area-header');
            const pTag = document.createElement('p');
            pTag.textContent = "Memo";
            const textAreaHeaderButtonDiv = document.createElement('div');
            textAreaHeaderButtonDiv.classList.add('text-area-header-button');
            const leftButton = document.createElement('button');
            leftButton.classList.add('left-button');
            leftButton.textContent = "←";
            const rightButton = document.createElement('button');
            rightButton.classList.add('right-button');
            rightButton.textContent = "→";
            // タグを結合
            textAreaHeaderButtonDiv.append(leftButton, rightButton);
            textAreaHeaderDiv.append(pTag, textAreaHeaderButtonDiv);

            // メイン部分
            const textAreaMainDiv = document.createElement('div'); 
            textAreaMainDiv.classList.add('text-area-main');
            const textAreaTag = document.createElement('textarea');
            // タグを結合
            textAreaMainDiv.append(textAreaTag);

            // フッター部分
            const textAreaFooterDiv = document.createElement('div');
            textAreaFooterDiv.classList.add('text-area-footer');
            const upButton = document.createElement('button');
            upButton.classList.add('up-button');
            upButton.textContent = "↑";
            const downButton = document.createElement('button');
            downButton.classList.add('down-button');
            downButton.textContent = "↓";
            // タグを結合
            textAreaFooterDiv.append(upButton, downButton)
            tileTag.append(textAreaHeaderDiv, textAreaMainDiv, textAreaFooterDiv);
            sectionTiles.append(tileTag);

            // CSS
            if (tiles[i].width > 1) {
                tileTag.style.gridColumn = 'span ' + tiles[i].width;
            }
            if (tiles[i].height > 1) {
                tileTag.style.gridRow = 'span ' + tiles[i].height;
            }
            // cellsを更新して占有済みタイル集合に登録
            addOccupied(tiles[i].cells);
        }
    }
    console.log(sectionTiles);                                               //test 
}

// =============== < 部品的な処理 > ==========================================================================================

// eventを受け取ってindexを返す関数
function indexFromEvent(event) {
    const tile = event.target.closest('.tile');
    if (!tile) return null;
    return Number(tile.dataset.index);
}
// urlを受け取ってファビコンurlに加工して返す関数(sz=256)
function convertToFavicon(url) {
    const domain = new URL(url).hostname;
    const faviconUrl = 'https://www.google.com/s2/favicons?domain=' + domain + '&sz=256';
    return faviconUrl
}
// tilesを受け取ってlocalStorageに保存する関数
function localStorageSave(tiles) {
    localStorage.setItem("tiles", JSON.stringify(tiles));
}
// 長過ぎるテキスト省略表示に変える
function truncate(text, limit) {
    if (text.length <= limit) return text;
    return text.slice(0, limit) + '...';
}
// 全タイルのボーダーをリセット
function resetBorder() {
    const allTiles = document.querySelectorAll('.tile');
    // 全タイルのボーダーをリセット
    for (const tile of allTiles) {
        tile.style.border = "";
    }
}
// 引数に受け取ったcellsの中身をグローバル集合のoccupiedに入れ込む関数
function addOccupied(twoDimensionalArray) {
    for (const row of twoDimensionalArray) {
        for (const cell of row) {
            occupied.add(cell);
        }
    }
}
// 引数に受け取ったリストの要素とグローバル集合のoccupiedに被りが存在していなかったらtrue、被りがあったらfalseを返す関数
function CheckDuplicates(list) {
    for (const one of list) {
        if (occupied.has(one)) {
            return false;
        }
    }
    return true;
}
// indexをうけとり、tiles[Index]のwidthとhightを参照して新しいcellsをリターンする関数
function newCells(index) {
    const cells = [];
    const width = tiles[index].width;
    const height = tiles[index].height;
    for (let r=0; r<height; r++) {
        const clm = [];
        for (let c=0; c<width; c++) {
            clm.push(index + (c) + (r*20));
        }
        cells.push(clm);
    }
    return cells;
}

// =============== < タイルをクリックしたときの処理 > ===========================================================================

// タイルを左クリック時の分岐
function tileLeftClick(tiles) {
    // タイルセクションにイベントをセット
    sectionTiles.addEventListener('click', (event) => {
        console.log(event.target);

        // activeIndexを更新
        activeIndex = indexFromEvent(event); 
        // タイルの上でなかったら無視
        if (activeIndex === null) {return};
        console.log(activeIndex);                                              // test
        // typeが"linkTile"ならリンクを開く。
        if (tiles[activeIndex].type === "linkTile") {
            if (tiles[activeIndex].link.anotherWindow === true) {
                window.open(tiles[activeIndex].link.url, '_blank', 'width=1080,height=960');
            } else {
                window.open(tiles[activeIndex].link.url, '_blank');
            }
        } 
        // typeが"textTile"でサイズ変更ボタンを押されていたらサイズ変更処理"
        else if (tiles[activeIndex].type === "textTile") {
            const button = event.target.closest('button');
            // ボタン部分以外が押されていたら何もしない
            if (!button) return; 
            // もし'right-button'が押されていたら
            if (button.classList.contains('right-button')) {
                tiles[activeIndex].width += 1;
            }
            if (button.classList.contains('left-button')) {
                tiles[activeIndex].width -= 1;
            }
            if (button.classList.contains('down-button')) {
                tiles[activeIndex].height += 1;
            }
            if (button.classList.contains('up-button')) {
                tiles[activeIndex].height -= 1;
            }
            // cellsを再計算する
            tiles[activeIndex].cells = newCells(activeIndex);  
            // ローカルストレージに保存
            localStorageSave(tiles);
            // 新しくタイルを再構築
            makeTile(tiles);
        }
        // typeが"none"ならタイルクリエイトメニューを開く
        else if (tiles[activeIndex].type === "none") {
            // クリックしたタイルの枠を光らせる
            const activeTile = document.querySelector('[data-index="' + activeIndex + '"]');
            activeTile.style.border = "1px #37b4fe solid";
            // スタイルにクリックした座標を渡す
            createPanel.style.left = event.clientX + "px";
            createPanel.style.top = event.clientY + "px";
            // タイルクリエイトメニューを出す
            createPanelOpen();
        }
    });
}
// 右クリック時にメニューを出す
function tileRightClick(tiles) {
    // タイルセクションにイベントをセット
    sectionTiles.addEventListener("contextmenu", (event) => {
        // activeIndexを更新
        activeIndex = indexFromEvent(event); 
        // タイルの上でなかったら無視
        if (activeIndex === null) {return};
        //urlが登録してあるならメニューを出す
        if (tiles[activeIndex].link.url !== '') {
            // 標準メニューをブロック
            event.preventDefault(); 
            // 開いているパネルを全て閉じから処理に入る
            closePanel();
            // クリックしたらパネルが閉じる層を出す
            panelOutOpen();
            // 長過ぎるurlとnameは省略表示に変えつつ挿入
            rightclickPanelName.textContent = truncate(tiles[activeIndex].link.name, 11);
            rightclickPanelUrl.textContent = truncate(tiles[activeIndex].link.url, 24);
            rightclickPanelMemo.textContent = tiles[activeIndex].link.memo;
            // スタイルにクリックした座標を渡す
            rightClickPanel.style.left = event.clientX + "px";
            rightClickPanel.style.top = event.clientY + "px";
            // "/right-click-panel"を表示させる
            rightClickPanel.classList.remove('close');
            rightClickPanel.classList.add('show');
        }
    });
}
// =============== < タイルのドラッグ操作 > ===========================================================================
function tileDrag(tiles) {
    // イベントキャッチ：ドラッグスタート（'dragStartIndex'を、掴んだタイルのインデックスに更新）
    sectionTiles.addEventListener('dragstart', (event) => {
        dragStartIndex = indexFromEvent(event);
    })
    //イベントキャッチ：ドラッグオーバー（'dragOverIndex'を、通過したタイルのインデックスに更新）
    sectionTiles.addEventListener('dragover', (event) => {
        // 標準の“ドロップ禁止”を打ち消す
        event.preventDefault(); 
        // ドラッグ操作通過中のインデックスを記録
        dragOverIndex = indexFromEvent(event);
        // もしタイルの上でなければ発火を無視
        if (dragOverIndex === null) return;
        // 全タイルのボーダーをリセット
        resetBorder();
        // 今通過中のタイルにボーダーをつける
        const dragOverTile = document.querySelector('[data-index="' + dragOverIndex + '"]');
        dragOverTile.style.border = "1px #37b4fe solid";
    })
    //イベントキャッチ：ドラッグドロップ（'dragDropIndex'を、落としたタイルのインデックスに更新）
    sectionTiles.addEventListener('drop', (event) => {
        dragDropIndex = indexFromEvent(event);
        // 全タイルのボーダーをリセット
        resetBorder();
        // もしタイルの上でなければ発火を無視
        if (dragDropIndex === null) return;
        // もしスタートとドロップが同じ場所なら何もしない
        if (dragStartIndex === dragDropIndex) return;
        // タイルデータをスワップする
        [tiles[dragStartIndex], tiles[dragDropIndex]] = [tiles[dragDropIndex], tiles[dragStartIndex]];
        // 各cellsを再計算する
        tiles[dragStartIndex].cells = newCells(dragStartIndex);
        tiles[dragDropIndex].cells  = newCells(dragDropIndex);
        // localStorageに保存する
        localStorageSave(tiles);
        // 新しくタイルを再構築
        makeTile(tiles);
    })
}
// =============== < パネルの出しれ処理 > ===========================================================================

// タイル作成パネルを出す関数
function createPanelOpen() {
    // 開いているパネルを全て閉じから処理に入る
    closePanel();
    // クリックしたらパネルが閉じる層を出す
    panelOutOpen();
    // ".create-panel"を表示させる
    createPanel.classList.remove('close');
    createPanel.classList.add('show');
}

// 記録パネルを出す関数(もしすでに値が入っているなら入力された状態で出す) 
function recordPanelOpen(tiles) {
    // 開いているパネルを全て閉じから処理に入る
    closePanel();
    // 全タイルのボーダーをリセット
    resetBorder();
    // クリックしたらパネルが閉じる層を出す
    panelOutOpen();
    // 入力欄にtilesの値を入れる
    urlInput.value = tiles[activeIndex].link.url;
    nameInput.value = tiles[activeIndex].link.name;
    memoInput.value = tiles[activeIndex].link.memo;
    // もしURL空なら"img/noimage.png"を表示、URLがあればファビコン画像を取りに行って埋め込む
    if (tiles[activeIndex].link.url === '') {
        faviconImg.src = "img/noimage.png";
    } else {
        faviconImg.src = convertToFavicon(tiles[activeIndex].link.url);
    }
    // チェックリストのcheckedをつける
    tileOnName.checked = tiles[activeIndex].link.tileOnName;
    anotherWindow.checked = tiles[activeIndex].link.anotherWindow;
    // ".record-panel"を表示させる
    recordPanel.classList.remove('close');
    recordPanel.classList.add('show'); 
}
// 開いている.panelを全て閉じる関数
function closePanel() {
    const panels = document.querySelectorAll(".panel");
    for (const panel of panels) {
        panel.classList.remove("show");
        panel.classList.add("close");
    }
}
// クリックしたらパネルが閉じるバックグラウンドを出す関数
function panelOutOpen() {
    const panelOut = document.querySelector('.panel-background');
    panelOut.classList.remove("close");
    panelOut.classList.add("show")
}

// =============== < ボタン関係の処理 > ===========================================================================

// イベントキャッチ：✕ボタンが押されたら
function closeButton() {
    const closeButtons = document.querySelectorAll('.close-button');
    for (const button of closeButtons) {
        button.addEventListener('click', () => {
            closePanel();
        });
    }
}
// イベントキャッチ：text-editボタンが押されたら1*1のテキストタイルを作成
function textEditButton() {
    const textEditButton = document.querySelector('.text-edit-button')
    textEditButton.addEventListener('click', () => {   

        tiles[activeIndex].type = "textTile";
        tiles[activeIndex].cells[0][0] = activeIndex;
        tiles[activeIndex].width = 1;
        tiles[activeIndex].height = 1;
        // localStorageに保存する
        localStorageSave(tiles);
        // 新しくタイルを再構築
        makeTile(tiles);
        // パネルを閉じる
        closePanel();
    })
}
// イベントキャッチ：EDITボタンが押されたら
function editButton() {
    const editButtons = document.querySelectorAll('.edit-button');
    for (const button of editButtons) {
        button.addEventListener('click', () => {
            recordPanelOpen(tiles);
        })
    }

}
// イベントキャッチ：DELETEボタンが押されたら
function deleteButton(tiles)  {
    const deleteButton = document.querySelector('.delete-button');
    deleteButton.addEventListener('click', () => {
        // 値をtilesオブジェクトのi番目に空の値を入れる
        tiles[activeIndex].type = "none";
        tiles[activeIndex].cells = [[],[]];
        tiles[activeIndex].width = 0;
        tiles[activeIndex].height = 0;
        tiles[activeIndex].link.url = "";
        tiles[activeIndex].link.name = "";
        tiles[activeIndex].link.memo = "";
        tiles[activeIndex].link.tileOnName = false;
        tiles[activeIndex].link.anotherWindow = false;
        // localStorageに保存する
        localStorageSave(tiles);
        // 新しくタイルを再構築
        makeTile(tiles);
        // パネルを閉じる
        closePanel();
    })
}
// イベントキャッチ：EDITパネル内の保存(送信)ボタンが押されたら
function formSend(tiles) {
    form.addEventListener("submit", (event) => {
        // 再読み込み防止
        event.preventDefault(); 
        // 'http://'で始まらないURLが入力されていたら送信を取り消す
        if (urlInput.value.startsWith('http://') || urlInput.value.startsWith('https://')) {
            // tileArrayのactionIndex番目に値を入れる
            tiles[activeIndex].type = "linkTile";
            tiles[activeIndex].width = 1;
            tiles[activeIndex].height = 1;
            tiles[activeIndex].cells = newCells(activeIndex);
            tiles[activeIndex].type = "linkTile"
            tiles[activeIndex].link.url = urlInput.value;
            tiles[activeIndex].link.name = nameInput.value;
            tiles[activeIndex].link.memo = memoInput.value;
            tiles[activeIndex].link.tileOnName = tileOnName.checked;
            tiles[activeIndex].link.anotherWindow = anotherWindow.checked;
            // localStorageに保存する
            localStorageSave(tiles);
            // 新しくタイルを再構築
            makeTile(tiles);
            // パネルを閉じる
            closePanel();
        } else {
            alert('URLが無効です');
            return
        }
    });
}
// イベントキャッチ：パネル外が押されたら
function clickPanelOut() {
    const panelOut = document.querySelector('.panel-background');
    panelOut.addEventListener('click', () => {
        // 全タイルのボーダーをリセット
        resetBorder();
        // 全パネルを非表示に
        closePanel();
    })
}
// イベントキャッチ：URL入力欄に変化があったら
function faviconUpdate() {
    urlInput.addEventListener('change', () => {
        // ちゃんとURLの形入力されていたらファビコン画像を取りに行って埋め込む
        if  (urlInput.value.startsWith('http://') || urlInput.value.startsWith('https://')){
            try {
                faviconImg.src = convertToFavicon(urlInput.value);
            } catch {
                faviconImg.src = "img/noimage.png";
            }
        }
        // それ以外の場合は"img/noimage.png"を表示
        else {
            faviconImg.src = "img/noimage.png";
        }
    })
}




// =============== < 処理 > ==========================================================================================


//""""""""""""""" < 起動処理 > """""""""""""""

// 使い回すエレメントを定数化

// [main] >
const sectionTiles = document.querySelector('.section-tiles');

// [main] >
const rightClickPanel = document.querySelector('.section-rightclick-panel'); 
// [main] > [.section-rightclick-panel] > [.rightclick-panel-main] >
const rightclickPanelName = document.querySelector('.rightclick-panel-name'); 
const rightclickPanelUrl = document.querySelector('.rightclick-panel-url'); 
const rightclickPanelMemo = document.querySelector('.rightclick-panel-memo'); 




const createPanel = document.querySelector('.section-create-panel');

const textTilePanel = document.querySelector('.section-text-tile-panel');

// [main] > 
const recordPanel = document.querySelector('.section-record-panel');
// [main] > [.section-record-panel] > 
const form = document.querySelector('form');
// [main] > [.section-record-panel] > [form] > [.form-main] >
const faviconImg = document.querySelector('.favicon-img');
const urlInput = document.querySelector('#url');
const nameInput = document.querySelector('#name');
const memoInput = document.querySelector('#memo');
const tileOnName = document.querySelector('#title-on-name');
const anotherWindow = document.querySelector('#another-window');


//""""""""""""""" < 初期値を設定 > """""""""""""""

// 使用中のインデックスを記録
const occupied = new Set(); 
// タイルデータがあれば持ってきてなければtileオブジェクトを生成
let tiles = tilesLoad();
// タイルの見た目を生成(data-index付き)
makeTile(tiles);
// アクティブタイルのインデックス
let activeIndex = null;
// ドラッグで操作用のインデクス
let dragStartIndex = null;
let dragOverIndex = null;
let dragDropIndex = null;



//""""""""""""""" < メイン処理 > """""""""""""""

// イベントキャッチ：タイル左クリック
tileLeftClick(tiles);
// イベントキャッチ：タイル右クリック
tileRightClick(tiles);
// イベントキャッチ：タイルのドラッグ操作
tileDrag(tiles)
// イベントキャッチ：✕ボタン
closeButton();
// イベントキャッチ：EDITボタン
editButton()
// イベントキャッチ：DELETEボタン
deleteButton(tiles)
// イベントキャッチ：フォーム送信ボタン
formSend(tiles);
// イベントキャッチ：パネル外が押されたら
clickPanelOut();
// イベントキャッチ：URL入力欄に変化があったら
faviconUpdate();
// イベントキャッチ：text-editボタンが押されたら
textEditButton();