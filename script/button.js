'use strict';

import { state } from './state.js';
import { localStorageSave } from './storage.js';
import { makeTile } from './tile-render.js';
import { noneOneData, makeCells, resetBorder } from './utils.js';
import { recordPanelOpen, closePanel } from './panel.js';

// =============== < ボタン関係の処理 > ===========================================================================

// イベントキャッチ：✕ボタンが押されたら
export function closeButton() {
    const closeButtons = document.querySelectorAll('.close-button');
    for (const button of closeButtons) {
        button.addEventListener('click', () => {
            closePanel();
        });
    }
}

// イベントキャッチ：text-editボタンが押されたら1*1のテキストタイルを作成
export function textEditButton() {
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
export function editButton() {
    const editButtons = document.querySelectorAll('.edit-button');
    for (const button of editButtons) {
        button.addEventListener('click', () => {
            recordPanelOpen();
        })
    }
}

// イベントキャッチ：DELETEボタンが押されたら
export function deleteButton()  {
    const deleteButtons = document.querySelectorAll('.delete-button');
    for (const deleteButton of deleteButtons) {
        deleteButton.addEventListener('click', () => {
            // 値をtilesオブジェクトのi番目に空の値を入れる
            state.tiles[state.activeIndex] = noneOneData();
            // localStorageに保存する
            localStorageSave();
            // 新しくタイルを再構築
            makeTile();
            // パネルを閉じる
            closePanel();
        })
    }
}

// イベントキャッチ：パネル外が押されたら
export function clickPanelOut() {
    const panelOut = document.querySelector('.panel-background');
    panelOut.addEventListener('click', () => {
        // 全タイルのボーダーをリセット
        resetBorder();
        // 全パネルを非表示に
        closePanel();
    })
}

// イベントキャッチ：EDITパネル内の保存(送信)ボタンが押されたら
export function formSend() {
    const form = document.querySelector('form');
    const urlInput = document.querySelector('#url');
    const nameInput = document.querySelector('#name');
    const memoInput = document.querySelector('#memo');
    const tileOnName = document.querySelector('#title-on-name');
    const anotherWindow = document.querySelector('#another-window');
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

// イベントキャッチ：URL入力欄に変化があったら
export function faviconUpdate() {
    // [main] > [.section-record-panel] > [form] > [.form-main] >
    const faviconImg = document.querySelector('.favicon-img');
    const urlInput = document.querySelector('#url');
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

