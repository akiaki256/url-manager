'use strict';

import { state } from './state.js';
import { tilesLoad } from './storage.js';
import { makeTile } from './tile-render.js';
import { tileLeftClick, tileRightClick, textTileUpdate} from './tile-click.js';
import { tileDrag } from './tile-drag.js';
import { closeButton, textEditButton, editButton,deleteButton, formSend, clickPanelOut, faviconUpdate } from './button.js';


//""""""""""""""" < 起動処理 > """""""""""""""

//タイルの生成数を制御(stateから列数を取得してCSSGridで並びを指定)
const sectionTiles = document.querySelector('.section-tiles');
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
// イベントキャッチ：テキストタイルにメモが入力されていたらローカルファイルに保存する
textTileUpdate();


//""""""""""""""" < ボタン設置 > """""""""""""""

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