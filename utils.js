'use strict';

// =============== < 多くの場所から呼ばれる汎用的な関数 > ==========================================================================================

// 中身が空っぽのデータ（一個）
export function noneOneDate() {
    const oneData = { 
        type: "none",
        cells: [],
        width: 0,
        height: 0,
        link: {
            url: "", 
            name: "", 
            memo: "", 
            tileOnName: false, 
            anotherWindow: false
        },
        text: {
            memo: ""
        }
    };
    return oneData;
}

// urlを受け取ってファビコンurlに加工して返す関数(sz=256)
export function convertToFavicon(url) {
    const domain = new URL(url).hostname;
    const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=256`;
    return faviconUrl
}

// 長過ぎるテキスト省略表示に変える関数
export function truncate(text, limit) {
    if (text.length <= limit) return text;
    return text.slice(0, limit) + '...';
}

// 引数(event) から操作中タイルのindexをリターンする関数
export function getIndex(event) {
    const tile = event.target.closest('.tile');
    if (!tile) return null;
    return Number(tile.dataset.index);
}

// 引数(index, width, height)からcellsを計算してリターンする関数
export function makeCells(index, width, height) {
    const cells = [];
    for (let r=0; r<height; r++) {
        for (let c=0; c<width; c++) {
            cells.push(index + (c) + (r*state.columns));
        }
    }
    return cells;
}