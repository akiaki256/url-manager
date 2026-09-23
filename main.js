'use strict';

import { state } from './state.js';
import { convertToFavicon, truncate } from './utils.js';
import { makeTile } from './tile-render.js';
import { createPanelOpen, recordPanelOpen, closePanel, panelOutOpen} from './panel.js';

// =============== < タイルデータの作成 > ==========================================================================================

// 中身が空っぽのデータ（一個）
function noneOneDate() {
    const oneData = { 
        type: "none",
        cells: [],
        width: 0,
        height: 0,
        link: {
            url: "", 
            name: "", 
            memo: "", 
            tileOnName: false, 
            anotherWindow: false
        },
        text: {
            memo: ""
        }
    };
    return oneData;
} 
// タイル配列をローカルストレージから読み込む。なければ新たに配列を作成
function tilesLoad() {
    const saved = localStorage.getItem("tiles");
    let tiles;
    if (saved !== null) { 
        tiles = JSON.parse(saved); 
    } else {
        tiles = [];
        const squares = state.columns * state.rows; 
        for (let i=0; i<squares; i++) tiles.push(noneOneDate());
    }
    return tiles
}


// =============== < 部品的な処理 > ==========================================================================================

// 引数(event) から操作中タイルのindexを返す関数
function getIndex(event) {
    const tile = event.target.closest('.tile');
    if (!tile) return null;
    return Number(tile.dataset.index);
}

// tilesをlocalStorageに保存する関数
function localStorageSave() {
    localStorage.setItem("tiles", JSON.stringify(state.tiles));
}

// 全タイルのボーダーをリセット
export function resetBorder() {
    const allTiles = document.querySelectorAll('.tile');
    // 全タイルのボーダーをリセット
    for (const tile of allTiles) {
        tile.style.border = "";
    }
}
// 第一引数に受け取ったリストの中身とグローバル集合のoccupiedに被りが存在していなかったらtrue。被りがあったらfalseをリターン
// 第二引数で判定から除外するセルを設定できる
function CheckOccupied(list, excludeCells) {
    const checkSet = new Set(state.occupied);
    for (const cell of excludeCells) {
        checkSet.delete(cell);
    }
    for (const one of list) {
        if (checkSet.has(one)) {
            return false;
        }
    }
    return true;
}
// 引数(index, width, height)からcellsを計算してリターンする関数
function makeCells(index, width, height) {
    const cells = [];
    for (let r=0; r<height; r++) {
        for (let c=0; c<width; c++) {
            cells.push(index + (c) + (r*state.columns));
        }
    }
    return cells;
}

// =============== < タイルをクリックしたときの処理 > ===========================================================================

// タイルを左クリック時の分岐
function tileLeftClick() {
    const buttonMap = new Map ([
        ['right-button', [1, 0]],
        ['left-button', [-1, 0]],
        ['down-button', [0, 1]],
        ['up-button', [0, -1]],
    ]);
    // タイルセクションにイベントをセット
    sectionTiles.addEventListener('click', (event) => {
        // 操作中のタイルのindexを取得
        state.activeIndex = getIndex(event); 
        const index = state.activeIndex;
        // タイルの上でなかったら無視
        if (index === null) {return};
        // typeが"linkTile"ならリンクを開く。
        if (state.tiles[index].type === "linkTile") {
            if (state.tiles[index].link.anotherWindow === true) {
                window.open(state.tiles[index].link.url, '_blank', 'width=1080,height=960');
            } else {
                window.open(state.tiles[index].link.url, '_blank');
            }
        } 
        // typeが"textTile"でサイズ変更ボタンを押されていたらサイズ変更処理"
        else if (state.tiles[index].type === "textTile") {
            const button = event.target.closest('button');
            // ボタン部分以外が押されていたら何もしない
            if (!button) return; 
            // どの方向ボタンが押されたのかを定数化
            const classname = button.classList[0];
            // 変動させる方向
            const value = buttonMap.get(classname);
            let widthHeight = [state.tiles[index].width + value[0], state.tiles[index].height + value[1]];

            // もしサイズ変更後のwidthかheightのどちらかが1より小さくなるならサイズは変えない
            if (widthHeight[0] < 1 || widthHeight[1] < 1) return;

            // サイズ変更後のcellsを作成
            const cells = makeCells(index, widthHeight[0], widthHeight[1]);
            // 折り返しがおきないかの確認
            if (checkEdge(cells) !== true) {
                alert('操作範囲外です');   
                return;
            }
            // 拡大先のタイルが空かをチェック
            if (CheckOccupied(cells, state.tiles[index].cells) !== true) {
                alert('そのタイルは使用中です');
                return;
            }
            // 実際のアクティブタイルに反映
            state.tiles[index].width = widthHeight[0];
            state.tiles[index].height = widthHeight[1];
            state.tiles[index].cells = cells;
            // ローカルストレージに保存
            localStorageSave();
            // 新しくタイルを再構築
            makeTile();
        }
        // typeが"none"ならタイルクリエイトメニューを開く
        else if (state.tiles[index].type === "none") {
            const createPanel = document.querySelector('.section-create-panel');
            // クリックしたタイルの枠を光らせる
            addBorder([index], "#37b4fe");
            // スタイルにクリックした座標を渡す
            createPanel.style.left = `${event.clientX}px`;
            createPanel.style.top = `${event.clientY}px`;
            // タイルクリエイトメニューを出す
            createPanelOpen();
        }
    });
}
// 右クリック時にメニューを出す
function tileRightClick() {
    // タイルセクションにイベントをセット
    sectionTiles.addEventListener("contextmenu", (event) => {
        // 操作中のタイルのindexを取得
        state.activeIndex = getIndex(event); 
        const index = state.activeIndex;
        // タイルの上でなかったら無視
        if (index === null) {return};
        //リンクタイルならメニューを出す
        if (state.tiles[index].type === 'linkTile') {
            // 標準メニューをブロック
            event.preventDefault(); 
            // 開いているパネルを全て閉じから処理に入る
            closePanel();
            // クリックしたらパネルが閉じる層を出す
            panelOutOpen();
            // 長過ぎるurlとnameは省略表示に変えつつ挿入
            rightclickPanelName.textContent = truncate(state.tiles[index].link.name, 11);
            rightclickPanelUrl.textContent = truncate(state.tiles[index].link.url, 24);
            rightclickPanelMemo.textContent = state.tiles[index].link.memo;
            // スタイルにクリックした座標を渡す
            rightClickPanel.style.left = `${event.clientX}px`;
            rightClickPanel.style.top = `${event.clientY}px`;
            // "/right-click-panel"を表示させる
            rightClickPanel.classList.remove('close');
            rightClickPanel.classList.add('show');
        }
        // テキストタイルならタイル削除メニューを出す
        else if (state.tiles[index].type === 'textTile') {
            // ヘッダー以外（テキストエリア等）で右クリックされたら標準メニューのまま無視
            if (!event.target.closest('.text-area-header')) return;
            // 標準メニューをブロック
            event.preventDefault(); 
            // 開いているパネルを全て閉じから処理に入る
            closePanel();
            // クリックしたらパネルが閉じる層を出す
            panelOutOpen();
            textTileRightclickPanel.style.left = `${event.clientX}px`;
            textTileRightclickPanel.style.top = `${event.clientY}px`;
            // "/right-click-panel"を表示させる
            textTileRightclickPanel.classList.remove('close');
            textTileRightclickPanel.classList.add('show');
        } 
    });
}
// =============== < タイルのドラッグ操作 > ===========================================================================

// 引数(cells)から画面右端・下端で折り返しが発生する並びであるかどうかを判定する。折り返しが起こらないならtrue。起きるならfalseをリターン。
function checkEdge(cells) {
    // 右端の判定
    let right = false, left = false, bottom = false; 
    for (const cell of cells) {
        if (state.rightEdge.has(cell)) right = true;
        if (state.leftEdge.has(cell)) left = true;
        if (cell > (state.columns*state.rows-1)) bottom = true;
    }
    if ((right && left) || bottom) return false;
    return true;
}

// 引数(cells, color) 第一引数で受け取ったcellsに、第二引数で指定した色のボーダーをつける。
function addBorder(cells, color) {
    for (const cell of cells) {
        const dragOverTile = document.querySelector(`[data-index="${cell}"]`);
        if (!dragOverTile) continue;   // そのセルにタイルがなければスキップ
        dragOverTile.style.border = `1px ${color} solid`;
    }
}

function tileDrag() {
    // ドラッグで操作用のインデックス
    let dragStartIndex = null;
    let dragOverIndex = null;
    let dragDropIndex = null;
    // イベントキャッチ：ドラッグスタート（'dragStartIndex'を、掴んだタイルのインデックスに更新）
    sectionTiles.addEventListener('dragstart', (event) => {
        dragStartIndex = getIndex(event);
    })
    //イベントキャッチ：ドラッグオーバー（'dragOverIndex'を、通過したタイルのインデックスに更新）
    sectionTiles.addEventListener('dragover', (event) => {
        // 標準の“ドロップ禁止”を打ち消す
        event.preventDefault(); 
        // ドラッグ操作通過中のインデックスを記録
        dragOverIndex = getIndex(event);
        // もしタイルの上でなければ発火を無視
        if (dragOverIndex === null) return;
        // 全タイルのボーダーをリセット
        resetBorder();
        // ドラッグ中の候補地cellsを取得
        const optionCells = makeCells(dragOverIndex, state.tiles[dragStartIndex].width, state.tiles[dragStartIndex].height); 
        // if 候補地で折り返しが起こるなら、基準マス一個に赤ボーダーを付ける。
        if (checkEdge(optionCells) === false) addBorder([dragOverIndex], 'red');
        // else if 候補地に使用済みタイルがあるなら、赤ボーダーをつける
        else if (CheckOccupied(optionCells, state.tiles[dragStartIndex].cells) === false) addBorder(optionCells, 'red');
        // else 候補地に青ボーダーをつける
        else addBorder(optionCells, '#37b4fe');
    })
    //イベントキャッチ：ドラッグドロップ（'dragDropIndex'を、落としたタイルのインデックスに更新）
    sectionTiles.addEventListener('drop', (event) => {
        dragDropIndex = getIndex(event);
        // 全タイルのボーダーをリセット
        resetBorder();
        // もしタイルの上でなければ発火を無視
        if (dragDropIndex === null) return;
        // もしスタートとドロップが同じ場所なら何もしない
        if (dragStartIndex === dragDropIndex) return;
        // ドロップ先の占有インデックスを計算
        const originSite = makeCells(dragDropIndex, state.tiles[dragStartIndex].width, state.tiles[dragStartIndex].height);
        // ドロップ先で折り返しがおきないかをチェック(右端)
        if (checkEdge(originSite) === false)  {
            alert('移動先に十分な空きがありません');
            return;
        }
        // ドロップ先に十分な空きがあるかを確認
        let excludeCells = state.tiles[dragStartIndex].cells; // 検証で除外するリストを作成
        if (CheckOccupied(originSite, excludeCells) === false)  {
            alert('移動先に十分な空きがありません');
            return;
        }
        // タイルデータを移動する
        state.tiles[dragDropIndex] = state.tiles[dragStartIndex];
        state.tiles[dragStartIndex] = noneOneDate();
        // 移動先のcellsを再計算する
        state.tiles[dragDropIndex].cells  = makeCells(dragDropIndex, state.tiles[dragDropIndex].width, state.tiles[dragDropIndex].height);
        // localStorageに保存する
        localStorageSave();
        // 新しくタイルを再構築
        makeTile();
    })
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
    const textEditButton = document.querySelector('.text-edit-button');
    textEditButton.addEventListener('click', () => {   
        // アクティブインデックスを取得
        const index = state.activeIndex;
        state.tiles[index].type = "textTile";
        state.tiles[index].width = 1;
        state.tiles[index].height = 1;
        state.tiles[index].cells = makeCells(index, 1, 1);
        // localStorageに保存する
        localStorageSave();
        // 新しくタイルを再構築
        makeTile();
        // パネルを閉じる
        closePanel();
    })
}
// イベントキャッチ：EDITボタンが押されたら
function editButton() {
    const editButtons = document.querySelectorAll('.edit-button');
    for (const button of editButtons) {
        button.addEventListener('click', () => {
            recordPanelOpen();
        })
    }
}
// イベントキャッチ：DELETEボタンが押されたら
function deleteButton()  {
    const deleteButtons = document.querySelectorAll('.delete-button');
    for (const deleteButton of deleteButtons) {
        deleteButton.addEventListener('click', () => {
            // 値をtilesオブジェクトのi番目に空の値を入れる
            state.tiles[state.activeIndex] = noneOneDate();
            // localStorageに保存する
            localStorageSave();
            // 新しくタイルを再構築
            makeTile();
            // パネルを閉じる
            closePanel();
        })
    }
}
// イベントキャッチ：EDITパネル内の保存(送信)ボタンが押されたら
function formSend() {
    form.addEventListener("submit", (event) => {
        // 再読み込み防止
        event.preventDefault(); 
        // アクティブインデックスを取得
        const index = state.activeIndex;
        // 'http://'で始まらないURLが入力されていたら送信を取り消す
        if (urlInput.value.startsWith('http://') || urlInput.value.startsWith('https://')) {
            // tileArrayのactionIndex番目に値を入れる
            state.tiles[index].type = "linkTile";
            state.tiles[index].width = 1;
            state.tiles[index].height = 1;
            state.tiles[index].cells = makeCells(index, state.tiles[index].width, state.tiles[index].height);
            state.tiles[index].link.url = urlInput.value;
            state.tiles[index].link.name = nameInput.value;
            state.tiles[index].link.memo = memoInput.value;
            state.tiles[index].link.tileOnName = tileOnName.checked;
            state.tiles[index].link.anotherWindow = anotherWindow.checked;
            // localStorageに保存する
            localStorageSave();
            // 新しくタイルを再構築
            makeTile();
            // パネルを閉じる
            closePanel();
        } else {
            alert('URLが無効です');
            return;
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

// イベントキャッチ：テキストタイルにメモが入力されていたらローカルファイルに保存する
function textTileUpdate() {
    sectionTiles.addEventListener('input', (event) => {
        // 変更されたのが memo-area(textarea)か確認
        if (!event.target.classList.contains('memo-area')) return;
        // どのタイルか特定
        const index = getIndex(event);
        if (index === null) return;
        // そのタイルの memo を更新
        state.tiles[index].text.memo = event.target.value;
        localStorageSave();
    });
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

// [main] > [.section-record-panel] > 
const form = document.querySelector('form');
// [main] > [.section-record-panel] > [form] > [.form-main] >
const faviconImg = document.querySelector('.favicon-img');
const urlInput = document.querySelector('#url');
const nameInput = document.querySelector('#name');
const memoInput = document.querySelector('#memo');
const tileOnName = document.querySelector('#title-on-name');
const anotherWindow = document.querySelector('#another-window');

const textTileRightclickPanel = document.querySelector('.section-textTile-rightclick-panel');

//""""""""""""""" < 初期値を設定 > """""""""""""""

//タイルの生成数を制御
sectionTiles.style.gridTemplateColumns = `repeat(${state.columns}, 80px)`;
// タイルデータがあれば持ってきてなければtileオブジェクトを生成
state.tiles = tilesLoad();

// タイルの見た目を生成(data-index付き)
makeTile();

//""""""""""""""" < メイン処理 > """""""""""""""

// イベントキャッチ：タイル左クリック
tileLeftClick();
// イベントキャッチ：タイル右クリック
tileRightClick();
// イベントキャッチ：タイルのドラッグ操作
tileDrag();
// イベントキャッチ：✕ボタン
closeButton();
// イベントキャッチ：EDITボタン
editButton();
// イベントキャッチ：DELETEボタン
deleteButton();
// イベントキャッチ：フォーム送信ボタン
formSend();
// イベントキャッチ：パネル外が押されたら
clickPanelOut();
// イベントキャッチ：URL入力欄に変化があったら
faviconUpdate();
// イベントキャッチ：text-editボタンが押されたら
textEditButton();
// イベントキャッチ：テキストタイルにメモが入力されていたらローカルファイルに保存する
textTileUpdate();