'use strict';

import { state } from './state.js';
import { tilesLoad, localStorageSave } from './storage.js';
import { convertToFavicon, getIndex } from './utils.js';
import { makeTile } from './tile-render.js';
import { tileLeftClick, tileRightClick} from './tile-click.js';
import { tileDrag } from './tile-drag.js';
import { closeButton, textEditButton, editButton,deleteButton, formSend, clickPanelOut } from './button.js';


// =============== < 処理 > ===========================================================================



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