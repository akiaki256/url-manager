'use strict';

import { state } from './state.js';

import { makeTile } from './tile-render.js';
import { localStorageSave } from './storage.js';
import { truncate, getIndex, makeCells } from './utils.js';
import { createPanelOpen, closePanel, panelOutOpen} from './panel.js';

// ファイル分割の過程で一時的にmain.jsからインポートしている形
import { checkEdge, CheckOccupied, addBorder } from './main.js'; 

// =============== < タイルをクリックしたときの処理 > ===========================================================================

// タイルを左クリック時の分岐
export function tileLeftClick() {
    const sectionTiles = document.querySelector('.section-tiles');
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
export function tileRightClick() {
    const sectionTiles = document.querySelector('.section-tiles');
    // [main] >
    const rightClickPanel = document.querySelector('.section-rightclick-panel'); 
    // [main] > [.section-rightclick-panel] > [.rightclick-panel-main] >
    const rightclickPanelName = document.querySelector('.rightclick-panel-name'); 
    const rightclickPanelUrl = document.querySelector('.rightclick-panel-url'); 
    const rightclickPanelMemo = document.querySelector('.rightclick-panel-memo'); 
    // [main] > 
    const textTileRightclickPanel = document.querySelector('.section-textTile-rightclick-panel');
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