'use strict';

import { state } from './state.js';
import { localStorageSave } from './storage.js';
import { makeTile } from './tile-render.js';
import { noneOneDate, getIndex, makeCells, resetBorder, addBorder, CheckOccupied, checkEdge } from './utils.js';

// =============== < タイルのドラッグ操作 > ===========================================================================

export function tileDrag() {
    const sectionTiles = document.querySelector('.section-tiles');
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