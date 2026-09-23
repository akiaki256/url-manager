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