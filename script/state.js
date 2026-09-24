'use strict';

// 状態管理用のオブジェクトを作成
export const state = {
    tiles: [],
    columns: 20,
    rows: 9,
    activeIndex: null,    // アクティブタイルのインデックス
    occupied: new Set(),  // 使用中のインデックスを記録する集合
    rightEdge: new Set(), // 右画面端のインデックスの集合
    leftEdge: new Set(),  // 左画面端のインデックスの集合
    bottomEdge: new Set(),// 下画面端のインデックスの集合
};

// 右の画面端の集合
function makeRightIndexSet() {
    const rightEdge = new Set();
    for (let i=0; i<state.rows; i++) rightEdge.add((state.columns-1) + (i*state.columns));
    return rightEdge;
}
// 左の画面端の集合
function makeLeftIndexSet() {
    const leftEdge = new Set();
    for (let i=0; i<state.rows; i++) leftEdge.add(0 + (i*state.columns));
    return leftEdge;
}
// 下の画面端の集合
function makeBottomIndexSet () {
    const bottomEdge= new Set();
    for (let i=0; i<state.columns; i++) bottomEdge.add((state.columns*state.rows-state.columns) + i);
    return bottomEdge;
}

// タイルの端の集合を作成
state.rightEdge = makeRightIndexSet();
state.leftEdge = makeLeftIndexSet();
state.bottomEdge = makeBottomIndexSet();