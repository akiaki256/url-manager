'use strict';

// =============== < タイル描画の処理 > ===============

// タイル配列をローカルストレージから読み込む。なければ新たに配列を作成
function tilesLoad() {
    const saved = localStorage.getItem("tilesArray");
    let tilesArray;
    if (saved !== null) { 
        tilesArray = JSON.parse(saved); 
    } else {
        tilesArray = [];
        const squares = 180;
        for (let i=0; i<squares; i++) {
            tilesArray.push({ url: "", name: "", memo: "", tileOnName: false, anotherWindow: false});
        }
    }
    return tilesArray
}
// タイルの見た目部分をdataにindexをふりつつを生成
function makeTile(tilesArray) {
    // 要素を初期化
    sectionTiles.innerHTML = "";
    // タイル生成をデータ数だけループ
    for (let i = 0; i < tilesArray.length; i++) {
        // <div class="tile">
        //    <div class="tile-image">
        //      <img src="ファビコンURL">
        //      <i class="fa-regular fa-square-plus"></i>
        //    </div>    
        // </div>

        // アイコン全体タグを作成
        const tileTag = document.createElement('div');
        tileTag.className = 'tile';
        tileTag.dataset.index = i; 
        tileTag.draggable = true;
        // アイコンの見た目用タグを作成
        const tileImage = document.createElement('div');
        tileImage.className = 'tile-image';
        // もしurlが入っていれば画像を取得してタイルに貼る
        if (tilesArray[i].url !== "") {
            // urlをドメインに加工
            const urlImage = document.createElement('img');
            urlImage.className = 'tile-url-image'
            urlImage.src = convertToFavicon(tilesArray[i].url);
            // <div class="tile-image"></div>の中に入れ込む  
            tileImage.appendChild(urlImage);
        } //urlがないならアイコンに隠し+マークを仕込む
        else { 
            const plus = document.createElement('i');
            plus.className = "fa-regular fa-square-plus";
            // <div class="tile-image"></div>の中に入れ込む
            tileImage.appendChild(plus);
        }
        // タグを統合 
        tileTag.appendChild(tileImage);
        sectionTiles.appendChild(tileTag);

        // もしtileOnNameがtrueなら名前をタイル上に表示
        if (tilesArray[i].tileOnName) {
            const tileOnName = document.createElement('p');
            tileOnName.classList = 'on-name';
            //長過ぎるnameは省略表示に変えつつ挿入
            tileOnName.textContent = truncate(tilesArray[i].name, 17);
            tileTag.appendChild(tileOnName);
        }
    }
    console.log(sectionTiles);
}

// =============== < 部品的な処理 > ===============

// eventを受け取ってindexを返す関数
function indexFromEvent(event) {
    const tile = event.target.closest('.tile');
    if (!tile) return null;
    return Number(tile.dataset.index);
}
// urlを受け取ってファビコンurlに加工して返す関数(sz=256)
function convertToFavicon(url) {
    const domain = new URL(url).hostname;
    const faviconUrl = 'https://www.google.com/s2/favicons?domain=' + domain + '&sz=256';
    return faviconUrl
}
// tilesArrayを受け取ってlocalStorageに保存する関数
function localStorageSave(tilesArray) {
    localStorage.setItem("tilesArray", JSON.stringify(tilesArray));
}
// 長過ぎるテキスト省略表示に変える
function truncate(text, limit) {
    if (text.length <= limit) return text;
    return text.slice(0, limit) + '...';
}

// =============== < タイルをクリックしたときの処理 > ===============

// タイルを左クリック時の分岐
function tileLeftClick(tilesArray) {
    // タイルセクションにイベントをセット
    sectionTiles.addEventListener('click', (event) => {
        // activeIndexを更新
        activeIndex = indexFromEvent(event); 
        // タイルの上でなかったら無視
        if (activeIndex === null) {return};
        // tilesArrayからactiveIndexで探し、urlの有無を確認して分岐                
        if (tilesArray[activeIndex].url !== '') {
            if (tilesArray[activeIndex].anotherWindow === true) {
                window.open(tilesArray[activeIndex].url, '_blank', 'width=1080,height=960');
            } else {
                window.open(tilesArray[activeIndex].url, '_blank');
            }
        } else {
            // urlがなかったら".record-panel"を表示
            recordPanelOpen(tilesArray);
        }
    });
}
// 右クリック時にメニューを出す
function tileRightClick(tilesArray) {
    // タイルセクションにイベントをセット
    sectionTiles.addEventListener("contextmenu", (event) => {
        // activeIndexを更新
        activeIndex = indexFromEvent(event); 
        // タイルの上でなかったら無視
        if (activeIndex === null) {return};
        //urlが登録してあるならメニューを出す
        if (tilesArray[activeIndex].url !== '') {
            // 標準メニューをブロック
            event.preventDefault(); 
            // 開いているパネルを全て閉じから処理に入る
            closePanel();
            // クリックしたらパネルが閉じる層を出す
            panelOutOpen();
            // 長過ぎるurlとnameは省略表示に変えつつ挿入
            rightclickPanelName.textContent = truncate(tilesArray[activeIndex].name, 11);
            rightclickPanelUrl.textContent = truncate(tilesArray[activeIndex].url, 24);
            rightclickPanelMemo.textContent = tilesArray[activeIndex].memo;
            // スタイルにクリックした座標を渡す
            rightClickPanel.style.left = event.clientX + "px";
            rightClickPanel.style.top = event.clientY + "px";
            // "/right-click-panel"を表示させる
            rightClickPanel.classList.remove('close');
            rightClickPanel.classList.add('show');
        }
    });
}
// =============== < タイルのドラッグ操作 > ===============
function tileDrag(tilesArray) {
    // イベントキャッチ：ドラッグスタート（'dragStartIndex'を、掴んだタイルのインデックスに更新）
    sectionTiles.addEventListener('dragstart', (event) => {
        dragStartIndex = indexFromEvent(event);
    })
    //イベントキャッチ：ドラッグオーバー（'dragOverIndex'を、通過したタイルのインデックスに更新）
    sectionTiles.addEventListener('dragover', (event) => {
        const tiles = document.querySelectorAll('.tile');
        // 標準の“ドロップ禁止”を打ち消す
        event.preventDefault(); 
        // ドラッグ操作通過中のインデックスを記録
        dragOverIndex = indexFromEvent(event);
        // もしタイルの上でなければ発火を無視
        if (dragOverIndex === null) return;
        // 全タイルのボーダーをリセット
        for (const tile of tiles) {
            tile.style.border = "";
        }
        // 今通過中のタイルにボーダーをつける
        const dragOverTile = document.querySelector('[data-index="' + dragOverIndex + '"]');
        dragOverTile.style.border = "1px green solid";
    })
    //イベントキャッチ：ドラッグドロップ（'dragDropIndex'を、落としたタイルのインデックスに更新）
    sectionTiles.addEventListener('drop', (event) => {
        const tiles = document.querySelectorAll('.tile');
        dragDropIndex = indexFromEvent(event);
        // 全タイルのボーダーをリセット
        for (const tile of tiles) {
            tile.style.border = "";
        }
        // もしタイルの上でなければ発火を無視
        if (dragDropIndex === null) return;
        // もしスタートとドロップが同じ場所なら何もしない
        if (dragStartIndex === dragDropIndex) return;
        // タイルデータをスワップする
        [tilesArray[dragStartIndex], tilesArray[dragDropIndex]] = [tilesArray[dragDropIndex], tilesArray[dragStartIndex]];
        // localStorageに保存する
        localStorageSave(tilesArray);

        // 新しくタイルを再構築
        makeTile(tilesArray);
    })
}
// =============== < パネルの出しれ処理 > ===============

// 記録パネルを出す関数(もしすでに値が入っているなら入力された状態で出す) 
function recordPanelOpen(tilesArray) {
    // 開いているパネルを全て閉じから処理に入る
    closePanel();
    // クリックしたらパネルが閉じる層を出す
    panelOutOpen();
    // 入力欄にtilesArrayの値を入れる
    urlInput.value = tilesArray[activeIndex].url;
    nameInput.value = tilesArray[activeIndex].name;
    memoInput.value = tilesArray[activeIndex].memo;
    // もしURL空なら"img/noimage.png"を表示、URLがあればファビコン画像を取りに行って埋め込む
    if (tilesArray[activeIndex].url === '') {
        faviconImg.src = "img/noimage.png";
    } else {
        faviconImg.src = convertToFavicon(tilesArray[activeIndex].url);
    }
    // チェックリストのcheckedをつける
    tileOnName.checked = tilesArray[activeIndex].tileOnName;
    anotherWindow.checked = tilesArray[activeIndex].anotherWindow;
    // ".record-panel"を表示させる
    recordPanel.classList.remove('close');
    recordPanel.classList.add('show'); 
}
// 開いている.panelを全て閉じる関数
function closePanel() {
    const panels = document.querySelectorAll(".panel");
    for (const panel of panels) {
        panel.classList.remove("show");
        panel.classList.add("close");
    }
}
// クリックしたらパネルが閉じるバックグラウンドを出す関数
function panelOutOpen() {
    const panelOut = document.querySelector('.panel-background');
    panelOut.classList.remove("close");
    panelOut.classList.add("show")
}

// =============== < ボタン関係の処理 > ===============

// イベントキャッチ：✕ボタンが押されたら
function closeButton() {
    const closeButtons = document.querySelectorAll('.close-button');
    for (const button of closeButtons) {
        button.addEventListener('click', () => {
            closePanel();
        });
    }
}
// イベントキャッチ：EDITボタンが押されたら
function editButton() {
    const editButton = document.querySelector('.edit-button');
    editButton.addEventListener('click', () => {
        recordPanelOpen(tilesArray);
    })
}
// イベントキャッチ：DELETEボタンが押されたら
function deleteButton(tilesArray)  {
    const deleteButton = document.querySelector('.delete-button');
    deleteButton.addEventListener('click', () => {
        // 値をtilesオブジェクトのi番目に空の値を入れる
        tilesArray[activeIndex].url = "";
        tilesArray[activeIndex].name = "";
        tilesArray[activeIndex].memo = "";
        tilesArray[activeIndex].tileOnName = false;
        tilesArray[activeIndex].anotherWindow = false;
        // localStorageに保存する
        localStorageSave(tilesArray);
        // 新しくタイルを再構築
        makeTile(tilesArray);
        // パネルを閉じる
        closePanel();
    })
}
// イベントキャッチ：EDITパネル内の保存(送信)ボタンが押されたら
function formSend(tilesArray) {
    form.addEventListener("submit", (event) => {
        // 再読み込み防止
        event.preventDefault(); 
        // 'http://'で始まらないURLが入力されていたら送信を取り消す
        if (urlInput.value.startsWith('http://') || urlInput.value.startsWith('https://')) {
            // tileArrayのactionIndex番目に値を入れる
            tilesArray[activeIndex].url = urlInput.value;
            tilesArray[activeIndex].name = nameInput.value;
            tilesArray[activeIndex].memo = memoInput.value;
            tilesArray[activeIndex].tileOnName = tileOnName.checked;
            tilesArray[activeIndex].anotherWindow = anotherWindow.checked;
            // localStorageに保存する
            localStorageSave(tilesArray);
            // 新しくタイルを再構築
            makeTile(tilesArray);
            // パネルを閉じる
            closePanel();
        } else {
            alert('URLが無効です');
            return
        }
    });
}
// イベントキャッチ：パネル外が押されたら
function clickPanelOut() {
    const panelOut = document.querySelector('.panel-background');
    panelOut.addEventListener('click', () => {
        closePanel();
    })
}
// イベントキャッチ：URL入力欄に変化があったら
function faviconUpdate() {
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





// =============== < 処理 > ===============


//""""""""""""""" < 起動処理 > """""""""""""""

// 使い回すエレメントを定数化

// [main] >
const sectionTiles = document.querySelector('.section-tiles');

// [main] >
const rightClickPanel = document.querySelector('.section-rightclick-panel'); 
// [main] > [.section-rightclick-panel] > [.rightclick-panel-main] >
const rightclickPanelName = document.querySelector('.rightclick-panel-name'); 
const rightclickPanelUrl = document.querySelector('.rightclick-panel-url'); 
const rightclickPanelMemo = document.querySelector('.rightclick-panel-memo'); 

// [main] > 
const recordPanel = document.querySelector('.section-record-panel');
// [main] > [.section-record-panel] > 
const form = document.querySelector('form');
// [main] > [.section-record-panel] > [form] > [.form-main] >
const faviconImg = document.querySelector('.favicon-img');
const urlInput = document.querySelector('#url');
const nameInput = document.querySelector('#name');
const memoInput = document.querySelector('#memo');
const tileOnName = document.querySelector('#title-on-name');
const anotherWindow = document.querySelector('#another-window');


//""""""""""""""" < 初期値を設定 > """""""""""""""

// タイルデータがあれば持ってきてなければtileオブジェクトを生成
let tilesArray = tilesLoad();
// タイルの見た目を生成(data-index付き)
makeTile(tilesArray);
// アクティブタイルのインデックス
let activeIndex = null;
// ドラッグで操作用のインデクス
let dragStartIndex = null;
let dragOverIndex = null;
let dragDropIndex = null;


//""""""""""""""" < メイン処理 > """""""""""""""

// イベントキャッチ：タイル左クリック
tileLeftClick(tilesArray);
// イベントキャッチ：タイル右クリック
tileRightClick(tilesArray);
// イベントキャッチ：タイルのドラッグ操作
tileDrag(tilesArray)
// イベントキャッチ：✕ボタン
closeButton();
// イベントキャッチ：EDITボタン
editButton()
// イベントキャッチ：DELETEボタン
deleteButton(tilesArray)
// イベントキャッチ：フォーム送信ボタン
formSend(tilesArray);
// イベントキャッチ：パネル外が押されたら
clickPanelOut();
// イベントキャッチ：URL入力欄に変化があったら
faviconUpdate();