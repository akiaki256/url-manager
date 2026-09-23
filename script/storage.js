'use strict';

import { state } from './state.js';

// =============== < localstorageの読み書きを含む処理 > ==========================================================================================

// タイル配列をローカルストレージから読み込む。なければ新たに配列を作成
export function tilesLoad() {
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

// tilesをlocalStorageに保存する関数
export function localStorageSave() {
    localStorage.setItem("tiles", JSON.stringify(state.tiles));
}