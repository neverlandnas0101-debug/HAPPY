const player = new Player();

// 擴充商品資料庫 (注意：動物的 sell 已經改成「每次收成」賺的錢)
const itemsDB = {
    'cabbage': { class: Crop, emoji: '🥬', cost: 10, sell: 35, time: 10, reqLv: 1 },
    'carrot':  { class: Crop, emoji: '🥕', cost: 40, sell: 120, time: 20, reqLv: 2 },
    'tomato':  { class: Crop, emoji: '🍅', cost: 100, sell: 300, time: 30, reqLv: 3 },
    'corn':    { class: Crop, emoji: '🌽', cost: 200, sell: 650, time: 60, reqLv: 4 },
    'strawberry': { class: Crop, emoji: '🍓', cost: 400, sell: 1400, time: 120, reqLv: 5 },
    'watermelon': { class: Crop, emoji: '🍉', cost: 800, sell: 3000, time: 300, reqLv: 6 },
    
    // 動物：sell 是「單次收益」，hearts 是「可生產次數(血量)」。單次收益 x 血量 = 一生的總收益
    'chicken': { class: Animal, emoji: '🐔', cost: 30, sell: 30, time: 15, hearts: 3, reqLv: 1, feed: 5 },
    'duck':    { class: Animal, emoji: '🦆', cost: 90, sell: 56, time: 30, hearts: 5, reqLv: 2, feed: 15 },
    'eagle':   { class: Animal, emoji: '🦅', cost: 270, sell: 95, time: 60, hearts: 9, reqLv: 3, feed: 45 },
    'pig':     { class: Animal, emoji: '🐖', cost: 500, sell: 135, time: 120, hearts: 12, reqLv: 4, feed: 80 },
    'sheep':   { class: Animal, emoji: '🐑', cost: 1000, sell: 235, time: 240, hearts: 15, reqLv: 5, feed: 150 },
    'cow':     { class: Animal, emoji: '🐄', cost: 2500, sell: 450, time: 600, hearts: 20, reqLv: 6, feed: 300 }
};

const fieldEl = document.getElementById('field');
const pastureEl = document.getElementById('pasture');
let cropPage = 1, animalPage = 1;

const unlockReqs = [
    {lv: 1, price: 0}, {lv: 1, price: 0}, {lv: 2, price: 50}, {lv: 2, price: 100}, {lv: 3, price: 200}, {lv: 3, price: 400}, {lv: 4, price: 800}, {lv: 4, price: 1500}, {lv: 5, price: 3000},
    {lv: 5, price: 5000}, {lv: 6, price: 8000}, {lv: 6, price: 12000}, {lv: 7, price: 20000}, {lv: 7, price: 35000}, {lv: 8, price: 50000}, {lv: 8, price: 80000}, {lv: 9, price: 120000}, {lv: 10, price: 200000}
];

let gridData = { field: [], pasture: [] };

function initGrids() {
    fieldEl.innerHTML = ''; pastureEl.innerHTML = '';
    gridData.field = []; gridData.pasture = [];

    for(let i=0; i<18; i++) {
        const cCell = document.createElement('div');
        cCell.className = 'cell crop-cell';
        cCell.dataset.index = i;
        cCell.dataset.reqLv = unlockReqs[i].lv;
        cCell.dataset.price = unlockReqs[i].price;
        fieldEl.appendChild(cCell);
        gridData.field.push({ unlocked: false, item: null, plantedAt: null, state: null, currentHearts: 0 });

        const aCell = document.createElement('div');
        aCell.className = 'cell animal-cell';
        aCell.dataset.index = i;
        aCell.dataset.reqLv = unlockReqs[i].lv;
        aCell.dataset.price = unlockReqs[i].price;
        pastureEl.appendChild(aCell);
        gridData.pasture.push({ unlocked: false, item: null, plantedAt: null, state: null, currentHearts: 0 });
    }
    updatePaginationUI();
}

function updatePaginationUI() {
    document.querySelectorAll('#field .cell').forEach((cell, idx) => {
        cell.classList.toggle('active-page', (cropPage === 1 && idx < 9) || (cropPage === 2 && idx >= 9));
    });
    document.querySelectorAll('#pasture .cell').forEach((cell, idx) => {
        cell.classList.toggle('active-page', (animalPage === 1 && idx < 9) || (animalPage === 2 && idx >= 9));
    });
    document.getElementById('crop-page-num').innerText = cropPage;
    document.getElementById('animal-page-num').innerText = animalPage;
    document.getElementById('crop-prev').disabled = (cropPage === 1);
    document.getElementById('crop-next').disabled = (cropPage === 2);
    document.getElementById('animal-prev').disabled = (animalPage === 1);
    document.getElementById('animal-next').disabled = (animalPage === 2);
}

document.getElementById('crop-prev').onclick = () => { if(cropPage > 1) { cropPage--; updatePaginationUI(); }};
document.getElementById('crop-next').onclick = () => { if(cropPage < 2) { cropPage++; updatePaginationUI(); }};
document.getElementById('animal-prev').onclick = () => { if(animalPage > 1) { animalPage--; updatePaginationUI(); }};
document.getElementById('animal-next').onclick = () => { if(animalPage < 2) { animalPage++; updatePaginationUI(); }};

function saveGame() {
    localStorage.setItem('farmSave', JSON.stringify({ player: { money: player.money, level: player.level, exp: player.exp }, grids: gridData }));
}

function loadGame() {
    const saved = JSON.parse(localStorage.getItem('farmSave'));
    initGrids(); 
    if (saved) {
        player.money = saved.player.money;
        player.level = saved.player.level;
        player.exp = saved.player.exp || 0;
        ['field', 'pasture'].forEach(areaId => {
            saved.grids[areaId].forEach((data, i) => {
                gridData[areaId][i] = data;
                const cell = document.getElementById(areaId).children[i];
                if (data.unlocked) {
                    unlockCell(cell, false);
                    if (data.item) {
                        plantItem(cell, data.item, data.plantedAt, data.state || 'growing', false, data.currentHearts);
                    }
                }
            });
        });
    }
    player.updateUI();
    updateGridsState();
}

document.getElementById('btn-save').onclick = () => { saveGame(); alert("存檔成功！"); };
document.getElementById('btn-reset').onclick = () => { if(confirm("確定要刪除進度嗎？")) { localStorage.removeItem('farmSave'); location.reload(); }};
setInterval(saveGame, 5000); 

let selectedItemKey = null;

function updateGridsState() {
    document.querySelectorAll('.cell').forEach(cell => {
        const areaId = cell.parentElement.id;
        const idx = cell.dataset.index;
        if (gridData[areaId][idx].unlocked) return; 
        const reqLv = parseInt(cell.getAttribute('data-req-lv'));
        cell.className = `cell ${areaId==='field'?'crop-cell':'animal-cell'} active-page ${player.level < reqLv ? 'locked-level' : 'locked-buy'}`;
        cell.innerHTML = '';
        if (reqLv <= player.level && parseInt(cell.getAttribute('data-price')) === 0) unlockCell(cell, true);
    });
    updatePaginationUI(); 
}

function unlockCell(cell, saveToData = true) {
    const areaId = cell.parentElement.id;
    const idx = cell.dataset.index;
    cell.removeAttribute('data-price');
    cell.removeAttribute('data-req-lv');
    cell.className = `cell ${areaId==='field'?'crop-cell':'animal-cell'} active-page`;
    cell.innerHTML = '';
    if(saveToData) gridData[areaId][idx].unlocked = true;
}

// === 核心：動植物的種植與扣血邏輯 ===
function plantItem(cell, itemKey, plantedAt, state = 'growing', chargeMoney = true, savedHearts = null) {
    const itemData = itemsDB[itemKey];
    const areaId = cell.parentElement.id;
    const idx = cell.dataset.index;

    if (chargeMoney && !player.spendMoney(itemData.cost)) return false;

    gridData[areaId][idx].item = itemKey;
    gridData[areaId][idx].state = state;
    gridData[areaId][idx].plantedAt = plantedAt;
    
    // 如果是新買的動物，給予最大血量
    if (itemData.class === Animal) {
        gridData[areaId][idx].currentHearts = (savedHearts !== null) ? savedHearts : itemData.hearts;
    }

    if (itemData.class === Crop) {
        const item = new itemData.class(itemData.emoji, itemData.cost, itemData.sell, itemData.time);
        const onReady = (revenue) => {
            cell.harvestFunc = () => {
                player.earnMoney(revenue);
                cell.innerHTML = ''; 
                cell.classList.remove('ready-to-collect');
                delete cell.harvestFunc;
                gridData[areaId][idx] = { unlocked: true, item: null, plantedAt: null, state: null, currentHearts: 0 };
                saveGame();
            };
        };
        item.grow(cell, onReady, plantedAt);
    } else {
        const item = new itemData.class(itemData.emoji, itemData.cost, itemData.sell, itemData.time, itemData.hearts, itemData.feed);
        
        // 動物收成時的邏輯：扣血，判斷生死
        const onReady = (revenue) => {
            cell.harvestFunc = () => {
                player.earnMoney(revenue);
                gridData[areaId][idx].currentHearts -= 1; // 扣一滴血 (壽命-1)
                
                cell.classList.remove('ready-to-collect');
                delete cell.harvestFunc;

                if (gridData[areaId][idx].currentHearts > 0) {
                    // 血量 > 0：活著！馬上自動開始下一輪生產
                    gridData[areaId][idx].state = 'growing';
                    gridData[areaId][idx].plantedAt = Date.now();
                    item.produce(cell, gridData[areaId][idx].currentHearts, onReady, gridData[areaId][idx].plantedAt);
                } else {
                    // 血量 = 0：壽終正寢，清空格子
                    cell.innerHTML = ''; 
                    gridData[areaId][idx] = { unlocked: true, item: null, plantedAt: null, state: null, currentHearts: 0 };
                }
                saveGame();
            };
        };

        if (state === 'hungry') {
            item.showHungry(cell);
            cell.feedFunc = () => {
                if (player.spendMoney(item.feedCost)) {
                    gridData[areaId][idx].state = 'growing';
                    gridData[areaId][idx].plantedAt = Date.now();
                    delete cell.feedFunc;
                    item.produce(cell, gridData[areaId][idx].currentHearts, onReady, gridData[areaId][idx].plantedAt);
                    saveGame();
                }
            };
        } else {
            // 從存檔讀取，繼續生產
            item.produce(cell, gridData[areaId][idx].currentHearts, onReady, plantedAt);
        }
    }
    return true;
}

document.getElementById('btn-levelup').addEventListener('click', () => {
    if (player.tryLevelUp()) { updateGridsState(); saveGame(); }
});

document.querySelectorAll('.buy-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const itemKey = e.target.getAttribute('data-id');
        if (player.level < itemsDB[itemKey].reqLv) return alert(`等級不足！需要 Lv.${itemsDB[itemKey].reqLv}`);
        document.querySelectorAll('.buy-btn').forEach(b => b.classList.remove('selected'));
        e.target.classList.add('selected');
        selectedItemKey = itemKey;
    });
});

document.querySelector('.farm-container').addEventListener('click', (event) => {
    const cell = event.target.closest('.cell');
    if (!cell) return;

    const character = document.getElementById('character');
    const targetRect = cell.getBoundingClientRect();
    character.style.left = `${targetRect.left + (targetRect.width / 2)}px`;
    character.style.top = `${targetRect.top + (targetRect.height / 2)}px`;

    // 買格子
    if (cell.classList.contains('locked-buy')) {
        if (player.spendMoney(parseInt(cell.getAttribute('data-price')))) { unlockCell(cell); saveGame(); }
        return;
    }

    // 餵食飢餓的動物
    if (cell.classList.contains('is-hungry')) {
        if (typeof cell.feedFunc === 'function') cell.feedFunc();
        return;
    }

    if (cell.classList.contains('locked-level') || (cell.innerHTML !== '' && !cell.classList.contains('ready-to-collect'))) return; 
    
    // 收成
    if (cell.classList.contains('ready-to-collect')) {
        if(typeof cell.harvestFunc === 'function') cell.harvestFunc();
        return;
    }

    // 放置新品種
    if (cell.innerHTML === '' && selectedItemKey) {
        const isCropSpace = cell.parentElement.id === 'field';
        const itemData = itemsDB[selectedItemKey];
        if ((itemData.class === Crop && !isCropSpace) || (itemData.class === Animal && isCropSpace)) return alert("放置區域錯誤！");
        
        const initialState = isCropSpace ? 'growing' : 'hungry';
        const initialTime = isCropSpace ? Date.now() : null;

        if (plantItem(cell, selectedItemKey, initialTime, initialState, true, null)) saveGame();
    }
});

loadGame();

// ==========================================
// 4. 鍵盤控制人物自由走路 (WASD /  방향키)
// ==========================================
const char = document.getElementById('character');
let charX = window.innerWidth / 2;
let charY = window.innerHeight / 2;
let isMoving = false;
const speed = 10; // 走路速度
const keys = { w: false, a: false, s: false, d: false, ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false };

// 初始化人物位置
char.style.left = `${charX}px`;
char.style.top = `${charY}px`;
// 取消原本 CSS 的 transition，改由 JavaScript 即時控制，走起來才流暢
char.style.transition = 'none'; 

// 監聽鍵盤按下
window.addEventListener('keydown', (e) => {
    if (keys.hasOwnProperty(e.key)) {
        keys[e.key] = true;
        if (!isMoving) {
            isMoving = true;
            requestAnimationFrame(gameLoop);
        }
    }
});

// 監聽鍵盤放開
window.addEventListener('keyup', (e) => {
    if (keys.hasOwnProperty(e.key)) {
        keys[e.key] = false;
        // 檢查是否還有按鍵被按著
        if (!Object.values(keys).some(v => v)) {
            isMoving = false;
        }
    }
});

// 遊戲主迴圈 (控制平滑移動)
function gameLoop() {
    if (!isMoving) return;

    if (keys.w || keys.ArrowUp) charY -= speed;
    if (keys.s || keys.ArrowDown) charY += speed;
    if (keys.a || keys.ArrowLeft) charX -= speed;
    if (keys.d || keys.ArrowRight) charX += speed;

    char.style.left = `${charX}px`;
    char.style.top = `${charY}px`;

    requestAnimationFrame(gameLoop);
}

// 覆蓋原本滑鼠點擊移動的邏輯 (避免衝突)
document.querySelector('.farm-container').addEventListener('click', (event) => {
    // 移除原本計算 targetRect 並設定 left/top 的那兩行程式碼
    // 現在人物必須靠鍵盤走到格子旁邊才能點擊 (可以加入距離判定，這裡先保留原本的點擊直接互動)
    /*
    const character = document.getElementById('character');
    const targetRect = cell.getBoundingClientRect();
    character.style.left = ... // 移除這段
    */
    
    // ... 下方的買格子、種植、收成邏輯保持不變 ...
});
