'use strict';

import { state } from './state.js';
import {convertToFavicon, truncate} from './utils.js';

// =============== < タイル描画の処理 > ==========================================================================================

// 引数に受け取ったcellsの中身をstateのoccupiedに入れ込む関数
function addOccupied(list) {
    for (const cell of list) {
        state.occupied.add(cell);
    }
}

// リンクタイルのHTMLを作成。引数(index)で受け取ったindexを埋め込む
function makeLinkTile(index) {
    // <div class="tile link-tile">
    //    <div class="tile-image">
    //      <img class="tile-url-image" src="ファビコンURL">
    //    </div>    
    // </div>

    // 全体部分： <div class="tile link-tile">
    const tileTag = document.createElement('div');
    tileTag.classList.add('tile', 'link-tile');
    tileTag.dataset.index = index;         // タイルをクリックしたときに識別に使用される重要なindex
    tileTag.draggable = true;
    // タイルの見た目用divタグ： <div class="tile-image">
    const tileImage = document.createElement('div');
    tileImage.classList.add('tile-image');
    // ファビコン部分： <img class="tile-url-image" src="ファビコンURL">
    const urlImage = document.createElement('img');
    urlImage.classList.add('tile-url-image');
    urlImage.src = convertToFavicon(state.tiles[index].link.url); 
    // タグを統合 
    tileImage.append(urlImage);
    tileTag.append(tileImage);
    sectionTiles.append(tileTag); 
    // もしtileOnNameがtrueかつnameが入力されていれば名前をタイル上に表示
    if (state.tiles[index].link.tileOnName && state.tiles[index].link.name !== "") {
        const tileOnName = document.createElement('p');
        tileOnName.classList = 'on-name';
        //長過ぎるnameは省略表示に変えつつ挿入
        tileOnName.textContent = truncate(state.tiles[index].link.name, 17);
        tileTag.append(tileOnName);
    }
    // 占有済みセットに追加
    addOccupied(state.tiles[index].cells);
}
// テキストタイルのHTMLを作成。引数(index)で受け取ったindexを埋め込む
function makeTextTile(index) {
    // <div class="tile text-tile">
    //    <div class="text-area-header">
    //        <div class="up-down-button">
    //            <button class"up-button"><i></i></button>
    //            <button class"down-button"><i></i></button> 
    //        </div>
    //        <div class="left-right-button">
    //            <button class"left-button"><i></i></button>
    //            <button class"right-button"><i></i></button>  
    //        </div>
    //    <div/>
    //    <div class="text-area-main">
    //        <textarea></textarea>
    //    </div> 
    // <div/>

    // 全体部分：<div class="tile text-tile">
    const tileTag = document.createElement('div');
    tileTag.classList.add('tile', 'text-tile');
    tileTag.dataset.index = index; 
    // ヘッダー部分：<div class="text-area-header">
    const textAreaHeaderDiv = document.createElement('div');
    textAreaHeaderDiv.classList.add('text-area-header');
    textAreaHeaderDiv.draggable = true;
    // 上下ボタン統合divタグ： <div class="up-down-button">
    const upDownButtonDiv = document.createElement('div');
    upDownButtonDiv.classList.add('up-down-button');
    // 上ボタン： <button class"up-button">
    const upButton = document.createElement('button');
    upButton.classList.add('up-button');
    const up = document.createElement('i');
    up.classList.add('fa-solid', 'fa-angle-up');
    upButton.append(up);
    //下ボタン： <button class"down-button">
    const downButton = document.createElement('button');
    downButton.classList.add('down-button');
    const down = document.createElement('i');
    down.classList.add('fa-solid', 'fa-angle-down');
    downButton.append(down);
    // 左右ボタン統合divタグ： <div class="left-right-button">
    const leftRightButtonDiv = document.createElement('div');
    leftRightButtonDiv.classList.add('left-right-button');
    // 左ボタン： <button class"left-button">
    const leftButton = document.createElement('button');
    leftButton.classList.add('left-button');
    const left = document.createElement('i');
    left.classList.add('fa-solid', 'fa-angle-left');
    leftButton.append(left);
    // 右ボタン：  <button class"right-button">
    const rightButton = document.createElement('button');
    rightButton.classList.add('right-button');
    const right = document.createElement('i');
    right.classList.add('fa-solid', 'fa-angle-right');
    rightButton.append(right);
    // タグを結合
    upDownButtonDiv.append(upButton,downButton);
    leftRightButtonDiv.append(leftButton, rightButton);
    textAreaHeaderDiv.append(upDownButtonDiv, leftRightButtonDiv);
    // メイン部分： <div class="text-area-main">
    const textAreaMainDiv = document.createElement('div'); 
    textAreaMainDiv.classList.add('text-area-main');
    // テキストエリア： <textarea></textarea>
    const textAreaTag = document.createElement('textarea');
    textAreaTag.classList.add('memo-area');
    // テキストエリアのvalueをデータから入れ込む
    textAreaTag.value = state.tiles[index].text.memo;
    // タグを結合
    textAreaMainDiv.append(textAreaTag);
    // タイル全体のタグを結合
    tileTag.append(textAreaHeaderDiv, textAreaMainDiv);
    sectionTiles.append(tileTag);
    // 複数ますタイルならCSSでグリッドの設定を変更
    if (state.tiles[index].width > 1) tileTag.style.gridColumn = `span ${state.tiles[index].width}`;
    if (state.tiles[index].height > 1) tileTag.style.gridRow = `span ${state.tiles[index].height}`;
    // 占有済みセットに追加
    addOccupied(state.tiles[index].cells);
}
// nomeタイルのHTMLを作成。引数(index)で受け取ったindexを埋め込む
function makeNoneTile(index) {
    // <div class="tile link-tile">
    //    <div class="tile-image">
    //        <i class="fa-regular fa-square-plus"></i>
    //    </div>    
    // </div>

    const tileTag = document.createElement('div');
    tileTag.classList.add('tile', 'link-tile');
    tileTag.dataset.index = index;      // タイルをクリックしたときに識別に使用される重要なindex
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

// タイルの見た目部分をdataにindexをふりつつを生成
export function makeTile() {
    // 要素を初期化
    sectionTiles.innerHTML = "";
    state.occupied.clear();
    // タイル生成をデータ数だけループ
    for (let i = 0; i < state.tiles.length; i++) {
        // もしoccupiedの中にiがあればこの回をスキップ(複数マスタイルに使用されているサブindexをとばしたindexが振られていく)
        if (state.occupied.has(i)) continue;
        const index = i;
        // typeを見てタイルを作る
        if (state.tiles[index].type === "linkTile") makeLinkTile(index);
        else if (state.tiles[index].type === "textTile") makeTextTile(index);
        else if (state.tiles[index].type === "none") makeNoneTile(index);
    }
}

// [main] >
const sectionTiles = document.querySelector('.section-tiles');