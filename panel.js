'use strict';

import { state } from './state.js';
import { convertToFavicon } from './utils.js';

// ファイル分割の過程で一時的にmain.jsからインポートしている形
import { resetBorder } from './main.js';

// =============== < パネルの出しれ処理 > ===========================================================================

// タイル作成パネルを出す関数
export function createPanelOpen() {
    const createPanel = document.querySelector('.section-create-panel');
    // 開いているパネルを全て閉じから処理に入る
    closePanel();
    // クリックしたらパネルが閉じる層を出す
    panelOutOpen();
    // ".create-panel"を表示させる
    createPanel.classList.remove('close');
    createPanel.classList.add('show');
}

// 記録パネルを出す関数(もしすでに値が入っているなら入力された状態で出す) 
export function recordPanelOpen() {
    // アクティブインデックスを取得
    const index = state.activeIndex;
    // 開いているパネルを全て閉じから処理に入る
    closePanel();
    // 全タイルのボーダーをリセット
    resetBorder();
    // クリックしたらパネルが閉じる層を出す
    panelOutOpen();
    // 入力欄にtilesの値を入れる
    urlInput.value = state.tiles[index].link.url;
    nameInput.value = state.tiles[index].link.name;
    memoInput.value = state.tiles[index].link.memo;
    // もしURL空なら"img/noimage.png"を表示、URLがあればファビコン画像を取りに行って埋め込む
    if (state.tiles[index].link.url === '') {
        faviconImg.src = "img/noimage.png";
    } else {
        faviconImg.src = convertToFavicon(state.tiles[index].link.url);
    }
    // チェックリストのcheckedをつける
    tileOnName.checked = state.tiles[index].link.tileOnName;
    anotherWindow.checked = state.tiles[index].link.anotherWindow;
    // ".record-panel"を表示させる
    const recordPanel = document.querySelector('.section-record-panel');
    recordPanel.classList.remove('close');
    recordPanel.classList.add('show'); 
}
// .panelを全て閉じる関数
export function closePanel() {
    const panels = document.querySelectorAll(".panel");
    for (const panel of panels) {
        panel.classList.remove("show");
        panel.classList.add("close");
    }
}
// クリックしたらパネルが閉じるバックグラウンドを出す関数
export function panelOutOpen() {
    const panelOut = document.querySelector('.panel-background');
    panelOut.classList.remove("close");
    panelOut.classList.add("show");
}


// =============== < 使い回すエレメントを定数化 > ===========================================================================

// [main] > [.section-record-panel] > [form] > [.form-main] >
const faviconImg = document.querySelector('.favicon-img');
const urlInput = document.querySelector('#url');
const nameInput = document.querySelector('#name');
const memoInput = document.querySelector('#memo');
const tileOnName = document.querySelector('#title-on-name');
const anotherWindow = document.querySelector('#another-window');