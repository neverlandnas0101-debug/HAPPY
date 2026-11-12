// ================= 全局資料與狀態 (加入自動讀檔功能) =================
// 嘗試從瀏覽器存檔中讀取資料，如果沒有存檔，就給予初始值
let globalMoney = parseInt(localStorage.getItem('farm_money')) || 150000; 
let maxLevelUnlocked = parseInt(localStorage.getItem('farm_level')) || 1;
let ownedUpgrades = JSON.parse(localStorage.getItem('farm_upgrades')) || []; 
let currentLevel = 0;
let selectedShopItem = null;

// ================= 自動存檔函數 =================
function saveGame() {
    localStorage.setItem('farm_money', globalMoney);
    localStorage.setItem('farm_level', maxLevelUnlocked);
    localStorage.setItem('farm_upgrades', JSON.stringify(ownedUpgrades));
    console.log("遊戲已自動存檔！");
}

// 關卡與作物設定
const levels = Array.from({length: 15}, (_, i) => ({
    day: i + 1,
    time: 90 + (i * 10),
    target: { pumpkin: 2 + i, cabbage: i >= 2 ? i : 0 }
}));

const cropInfo = {
    pumpkin: { icon: '🎃', basePrice: 35, cost: 10 },
    cabbage: { icon: '🥬', basePrice: 60, cost: 20 }
};

// ================= 完整商店商品清單 =================
const shopItems = [
    { id: 'cabbage_seed', name: '高麗菜種子', price: 100, side: 'left', icon: '🥬', desc: '解鎖高麗菜種植' },
    { id: 'sheep1', name: '綿羊', price: 800, side: 'left', icon: '🐑', desc: '每 12 秒生產羊毛 🧶' },
    { id: 'house1', name: '茅草屋', price: 1000, side: 'left', icon: '<img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT86hdH8Pb7JBzKbpkAOzJ8YZ-H688_pkEIowCbcaL-5GZIFV9c1Mn6TnqK&s=10" style="width: 45px;">', desc: '【Buff】每局時間上限 +10 秒' },
    { id: 'windmill', name: '風車', price: 1200, side: 'left', icon: '🎐', desc: '【Buff】高麗菜售價 +$20' },
    { id: 'chicken', name: '小雞', price: 1500, side: 'left', icon: '🐥', desc: '每 8 秒生產雞蛋 🥚' },
    { id: 'turkey', name: '火雞', price: 1800, side: 'left', icon: '🦃', desc: '每 15 秒生產火雞腿 🍗' },
    { id: 'goat', name: '山羊', price: 2000, side: 'left', icon: '🐐', desc: '每 14 秒生產羊奶 🥛' },
    { id: 'cow1', name: '乳牛', price: 2500, side: 'left', icon: '🐄', desc: '每 15 秒生產牛奶 🍼' },
    { id: 'barn', name: '穀倉', price: 2500, side: 'left', icon: '🏚️', desc: '【Buff】每局時間上限 +20 秒' },
    { id: 'pie', name: '派餅屋', price: 4000, side: 'left', icon: '🥧', desc: '【Buff】南瓜售價 +$20' },
    { id: 'pear_tree', name: '果樹', price: 4000, side: 'left', icon: '🌳', desc: '每 10 秒掉落水梨 🍐' },
    { id: 'brown_cow', name: '棕色牛', price: 5000, side: 'left', icon: '🐂', desc: '每 20 秒生產高級奶油 🧈' },
    { id: 'yarn_house', name: '紡織工坊', price: 12000, side: 'left', icon: '🧶', desc: '【Buff】羊毛價值 +$30' },
    { id: 'clothes', name: '服飾店', price: 14000, side: 'left', icon: '👕', desc: '【Buff】所有動物產品價值 x2' },

    { id: 'hoe', name: '鐵鋤頭', price: 400, side: 'right', icon: '⛏️', desc: '專業農夫裝飾' },
    { id: 'scythe', name: '鐮刀', price: 600, side: 'right', icon: '🔪', desc: '專業農夫裝飾' },
    { id: 'wooden_box', name: '木箱', price: 1200, side: 'right', icon: '📦', desc: '【功能】一次可拿取 3 個蔬菜' },
    { id: 'basket', name: '高級採收籃', price: 1500, side: 'right', icon: '🧺', desc: '【功能】一次可拿取 5 個蔬菜' },
    { id: 'well2', name: '石磚水井', price: 1800, side: 'right', icon: '<img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRyHeY2jTfI096FxpAPx21lL0_Mjb0vrVYVAtZl6SRyIw&s=10" style="width: 45px;">', desc: '【功能】打水一次可澆 3 次' },
    { id: 'boots', name: '工作靴', price: 2800, side: 'right', icon: '🥾', desc: '【功能】走路速度變快' },
    { id: 'gloves', name: '工作手套', price: 3400, side: 'right', icon: '🧤', desc: '【功能】作物生長速度減半' },
    { id: 'farm_exp', name: '農田擴建', price: 4700, side: 'right', icon: '🟫', desc: '【功能】農田擴充為 9 塊地' },
    { id: 'scooter', name: '小機車', price: 6500, side: 'right', icon: '🛵', desc: '【功能】升級送貨載具' },
    { id: 'fence', name: '木柵欄', price: 8000, side: 'right', icon: '🚧', desc: '保護農場的圍欄' },
    { id: 'fertilizer', name: '特效肥料', price: 14000, side: 'right', icon: '🧪', desc: '高級裝飾' },
    { id: 'motorcycle', name: '重型機車', price: 14000, side: 'right', icon: '🏍️', desc: '【功能】升級極速載具' },
    { id: 'pump', name: '抽水馬達', price: 25000, side: 'right', icon: '⛲', desc: '【功能】無限水！不用再打水' },
    { id: 'blue_truck', name: '藍色貨車', price: 25000, side: 'right', icon: '🚚', desc: '【功能】升級大型貨車' },
    { id: 'pink_truck', name: '粉紅大卡車', price: 45000, side: 'right', icon: '🚛', desc: '【功能】終極神速卡車' }
];

// ================= UI 切換 =================
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => {
        s.classList.remove('active');
        if (s.id === screenId) {
            s.style.display = (screenId === 'screen-shop' || screenId === 'screen-stats') ? 'flex' : 'block';
        } else {
            s.style.display = 'none';
        }
    });
    if (screenId === 'screen-map') renderMap();
    if (screenId === 'screen-shop') renderShop();
}

// ================= 1. 地圖與商店 =================
function renderMap() {
    const mapPath = document.getElementById('map-path');
    mapPath.innerHTML = '';
    for(let i = 0; i < 15; i++) {
        let star = document.createElement('div');
        star.className = 'level-star ' + (i + 1 > maxLevelUnlocked ? 'locked' : '');
        star.innerHTML = i + 1 > maxLevelUnlocked ? '⭐' : (i+1 === maxLevelUnlocked ? '🌟' : '⭐');
        let x = 100 + (i % 5) * 120;
        if (Math.floor(i / 5) % 2 === 1) x = 580 - (i % 5) * 120; 
        star.style.left = x + 'px';
        star.style.top = (50 + Math.floor(i / 5) * 120) + 'px';
        star.onclick = () => { if(i + 1 <= maxLevelUnlocked) { currentLevel = i; startLevel(); } };
        mapPath.appendChild(star);
    }
}

function renderShop() {
    document.getElementById('shop-money-display').innerText = globalMoney;
    const leftCol = document.getElementById('shop-left');
    const rightCol = document.getElementById('shop-right');
    leftCol.innerHTML = ''; rightCol.innerHTML = '';

    shopItems.forEach(item => {
        let el = document.createElement('div');
        el.className = 'shop-item ' + (ownedUpgrades.includes(item.id) ? 'owned' : '');
        el.innerHTML = `<div style="font-size:30px">${item.icon}</div><div>$${item.price}</div>`;
        el.onclick = () => {
            if(!ownedUpgrades.includes(item.id)) {
                document.querySelectorAll('.shop-item').forEach(i => i.classList.remove('selected'));
                el.classList.add('selected');
                selectedShopItem = item;
                document.getElementById('shop-desc').innerHTML = `<b>${item.name}</b><br>${item.desc}`;
            }
        };
        if(item.side === 'left') leftCol.appendChild(el); else rightCol.appendChild(el);
    });
}

function buySelectedItem() {
    if(!selectedShopItem) return alert('請先選擇要購買的商品！');
    if(globalMoney >= selectedShopItem.price) {
        globalMoney -= selectedShopItem.price;
        ownedUpgrades.push(selectedShopItem.id);
        document.getElementById('shop-desc').innerHTML = `購買成功：${selectedShopItem.name}！`;
        selectedShopItem = null;
        if(ownedUpgrades.includes('cabbage_seed')) document.getElementById('btn-cabbage').style.display = 'block';
        
        saveGame(); // 【存檔點】買完東西後存檔
        renderShop();
    } else { alert('金幣不足！'); }
}

// ================= 3. 遊戲本體系統 =================
let timeRemaining = 0, timerInterval = null;
let levelEarnedMoney = 0; 
let levelProgress = {};
let animalIntervals = []; 
let plots = [];
let targetPlotId = null;

let player = { x: 365, y: 250, water: 0, crops: [], isMoving: false };

const dynamicStyle = document.createElement('style');
dynamicStyle.innerHTML = `#bike::after, #well::after { content: none !important; }`;
document.head.appendChild(dynamicStyle);

function startLevel() {
    showScreen('screen-game');
    const lvl = levels[currentLevel];
    
    let extraTime = 0;
    if(ownedUpgrades.includes('house1')) extraTime += 10;
    if(ownedUpgrades.includes('barn')) extraTime += 20;
    
    timeRemaining = lvl.time + extraTime;
    levelEarnedMoney = 0;
    levelProgress = { pumpkin: 0, cabbage: 0 };
    player.water = 0;
    player.crops = [];
    
    let pEl = document.getElementById('player');
    player.x = 365; player.y = 250;
    pEl.style.transition = 'none';
    pEl.style.left = '365px'; pEl.style.top = '250px';

    generatePlots();
    upgradeFacilities();
    renderDecorations();
    startAnimalSpawners(); 

    updateGameUI();
    if(timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        timeRemaining--;
        updateGameUI();
        if (timeRemaining <= 0) { 
            clearInterval(timerInterval); 
            animalIntervals.forEach(clearInterval); 
            alert("時間到！結算今日成績。"); 
            endLevel(false); 
        }
    }, 1000);
}

function generatePlots() {
    document.querySelectorAll('.plot').forEach(el => el.remove());
    const gameScreen = document.getElementById('screen-game');
    const isExpanded = ownedUpgrades.includes('farm_exp');
    const plotCount = isExpanded ? 9 : 5;
    plots = Array(plotCount).fill(null).map(() => ({ state: 'empty', cropType: null }));

    const positions = [
        {x: 200, y: 380}, {x: 360, y: 380}, {x: 520, y: 380}, {x: 280, y: 480}, {x: 440, y: 480},
        {x: 60, y: 380}, {x: 660, y: 380}, {x: 120, y: 480}, {x: 600, y: 480}
    ];

    for(let i = 0; i < plotCount; i++) {
        let div = document.createElement('div');
        div.className = 'plot';
        div.style.left = positions[i].x + 'px';
        div.style.top = positions[i].y + 'px';
        div.innerHTML = `<span class="status-icon"></span><span class="crop-img"></span>`;
        div.onclick = function() { handlePlotClick(i, div); };
        gameScreen.appendChild(div);
    }
}

function upgradeFacilities() {
    let bikeEl = document.getElementById('bike');
    if (ownedUpgrades.includes('pink_truck')) bikeEl.innerHTML = '🚛';
    else if (ownedUpgrades.includes('blue_truck')) bikeEl.innerHTML = '🚚';
    else if (ownedUpgrades.includes('motorcycle')) bikeEl.innerHTML = '🏍️';
    else if (ownedUpgrades.includes('scooter')) bikeEl.innerHTML = '🛵';
    else bikeEl.innerHTML = '🚲';

    let wellEl = document.getElementById('well');
    if (ownedUpgrades.includes('pump')) wellEl.innerHTML = '⛲';
    else if (ownedUpgrades.includes('well2')) wellEl.innerHTML = '<img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRyHeY2jTfI096FxpAPx21lL0_Mjb0vrVYVAtZl6SRyIw&s=10" style="width: 45px;">';
    else wellEl.innerHTML = '💧';
}

function renderDecorations() {
    document.querySelectorAll('.visual-decor, .fence-border').forEach(el => el.remove());
    const gameScreen = document.getElementById('screen-game');
    
    if (ownedUpgrades.includes('fence')) {
        let fenceDiv = document.createElement('div');
        fenceDiv.className = 'fence-border';
        fenceDiv.style.cssText = `
            position: absolute; top: 40px; left: 0; width: 100%; height: calc(100% - 40px);
            border: 15px dashed #8b4513; border-radius: 10px; box-sizing: border-box;
            pointer-events: none; z-index: 2; opacity: 0.8;
        `;
        gameScreen.appendChild(fenceDiv);
    }

    // 【終極防卡版座標】將所有動物的 Y軸 (top) 往上壓縮，絕對不碰到下方農田
    const decorPositions = {
        // 左側動物 (排緊密一點，全部往上提)
        'sheep1': { left: '10px', top: '140px' },
        'cow1': { left: '80px', top: '210px' },
        'brown_cow': { left: '10px', top: '280px' }, // 安全距離！遠離農田的 380px
        
        // 右側動物 (同樣往上提)
        'goat': { left: '720px', top: '140px' },
        'chicken': { left: '650px', top: '210px' },
        'turkey': { left: '720px', top: '280px' },   // 安全距離！
        'pear_tree': { left: '560px', top: '170px' }, 
        
        // 農舍保持在最上方
        'house1': { left: '260px', top: '70px' },
        'barn': { left: '460px', top: '70px' }
    };

    ownedUpgrades.forEach(id => {
        if (decorPositions[id]) {
            let item = shopItems.find(i => i.id === id);
            let div = document.createElement('div');
            div.className = 'visual-decor';
            div.id = 'decor-' + id; 
            div.innerHTML = item.icon; 
            div.style.cssText = `position: absolute; left: ${decorPositions[id].left}; top: ${decorPositions[id].top}; font-size: 55px; z-index: 5; text-shadow: 2px 2px 4px rgba(0,0,0,0.5); pointer-events: none;`;
            gameScreen.appendChild(div);
        }
    });
}

function startAnimalSpawners() {
    animalIntervals.forEach(clearInterval);
    animalIntervals = [];
    function setupDrop(animalId, icon, basePrice, delay) {
        if(ownedUpgrades.includes(animalId)) {
            let timer = setInterval(() => spawnDrop(animalId, icon, basePrice), delay);
            animalIntervals.push(timer);
        }
    }
    setupDrop('chicken', '🥚', 20, 8000);
    setupDrop('sheep1', '🧶', 40, 12000);
    setupDrop('goat', '🥛', 50, 14000);
    setupDrop('cow1', '🍼', 60, 15000);
    setupDrop('turkey', '🍗', 70, 15000);
    setupDrop('brown_cow', '🧈', 100, 20000);
    setupDrop('pear_tree', '🍐', 50, 10000);
}

function spawnDrop(animalId, icon, basePrice) {
    let parent = document.getElementById('decor-' + animalId);
    if(!parent || parent.querySelector('.drop')) return; 

    let drop = document.createElement('div');
    drop.className = 'drop';
    drop.innerHTML = icon; 
    drop.style.cssText = `position: absolute; top: -30px; left: 10px; font-size: 30px; cursor: pointer; animation: bounce 1s infinite alternate; z-index: 50; pointer-events: auto;`;
    
    drop.onclick = (e) => {
        let finalPrice = basePrice;
        if(ownedUpgrades.includes('clothes')) finalPrice *= 2; 
        else if(ownedUpgrades.includes('yarn_house') && icon === '🧶') finalPrice += 30;

        globalMoney += finalPrice;
        levelEarnedMoney += finalPrice;
        drop.remove();
        showFloatingText(`+$${finalPrice}`, e.clientX, e.clientY);
        updateGameUI();
    };
    parent.appendChild(drop);
}

function showFloatingText(text, x, y) {
    let el = document.createElement('div');
    el.innerText = text;
    el.style.cssText = `position: fixed; left: ${x}px; top: ${y}px; color: gold; font-weight: bold; font-size: 30px; text-shadow: 2px 2px #000; z-index: 9999; transition: all 1s; pointer-events: none;`;
    document.body.appendChild(el);
    setTimeout(() => { el.style.top = (y - 50) + 'px'; el.style.opacity = '0'; }, 50);
    setTimeout(() => el.remove(), 1000);
}

function updateGameUI() {
    document.getElementById('coins-display').innerText = globalMoney;
    let m = Math.floor(timeRemaining / 60).toString().padStart(2, '0');
    let s = (timeRemaining % 60).toString().padStart(2, '0');
    document.getElementById('timer-display').innerText = `⏱️ ${m}:${s}`;

    let lvl = levels[currentLevel];
    let goalsText = `Day ${lvl.day} 目標: `;
    for(let crop in lvl.target) {
        if(lvl.target[crop] > 0) goalsText += `${cropInfo[crop].icon} ${levelProgress[crop]}/${lvl.target[crop]} `;
    }
    document.getElementById('level-goals').innerHTML = goalsText; 

    let handStr = '';
    if (player.water > 0) {
        if (ownedUpgrades.includes('pump')) handStr = '⛲∞';
        else handStr = `🪣x${player.water}`;
    } else if (player.crops.length > 0) {
        let pCount = player.crops.filter(c => c === 'pumpkin').length;
        let cCount = player.crops.filter(c => c === 'cabbage').length;
        if(pCount>0) handStr += `${cropInfo['pumpkin'].icon}x${pCount} `;
        if(cCount>0) handStr += `${cropInfo['cabbage'].icon}x${cCount}`;
    }
    document.getElementById('player-hand').innerHTML = handStr; 

    const plotEls = document.querySelectorAll('.plot');
    plots.forEach((pData, idx) => {
        const el = plotEls[idx];
        const iconEl = el.querySelector('.status-icon');
        const cropEl = el.querySelector('.crop-img');
        
        iconEl.style.display = 'none';
        cropEl.innerHTML = '';
        el.style.backgroundColor = pData.state !== 'empty' ? 'rgba(92, 58, 33, 0.8)' : 'rgba(139, 90, 43, 0.6)';

        if (pData.state === 'thirsty') { iconEl.innerText = '💧'; iconEl.style.display = 'block'; cropEl.innerHTML = '🌱'; } 
        else if (pData.state === 'growing') { cropEl.innerHTML = '🌿'; } 
        else if (pData.state === 'weedy') { iconEl.innerText = '🌾'; iconEl.style.display = 'block'; cropEl.innerHTML = '🌿'; } 
        else if (pData.state === 'ripe') { cropEl.innerHTML = cropInfo[pData.cropType].icon; el.style.backgroundColor = 'rgba(218, 165, 32, 0.8)'; }
    });
}

function walkTo(targetEl, callback) {
    if (player.isMoving) return;
    document.getElementById('seed-menu').style.display = 'none';
    player.isMoving = true;
    
    const targetRect = targetEl.getBoundingClientRect();
    const gameRect = document.getElementById('screen-game').getBoundingClientRect();
    const pEl = document.getElementById('player');
    
    const endX = targetRect.left - gameRect.left + (targetRect.width / 2) - (pEl.offsetWidth / 2);
    const endY = targetRect.top - gameRect.top + (targetRect.height / 2) - (pEl.offsetHeight / 2) - 20;
    const dist = Math.sqrt(Math.pow(endX - player.x, 2) + Math.pow(endY - player.y, 2));
    
    let speed = 300;
    if (ownedUpgrades.includes('pink_truck')) speed = 800;
    else if (ownedUpgrades.includes('blue_truck')) speed = 700;
    else if (ownedUpgrades.includes('motorcycle')) speed = 600;
    else if (ownedUpgrades.includes('scooter')) speed = 500;
    else if (ownedUpgrades.includes('boots')) speed = 450; 
    
    const time = (dist / speed) * 1000;

    pEl.style.transition = `left ${time}ms linear, top ${time}ms linear`;
    pEl.style.left = endX + 'px';
    pEl.style.top = endY + 'px';
    player.x = endX; player.y = endY;

    setTimeout(() => { player.isMoving = false; if (callback) callback(); }, time);
}

document.getElementById('well').onclick = function() {
    walkTo(this, () => {
        if (player.crops.length > 0) return alert("手上拿著蔬菜不能打水！");
        
        // 【新增倒水功能】如果手上已經有水了，再點一次水井就是把水倒掉
        if (player.water > 0) {
            player.water = 0;
            updateGameUI();
            return; // 提早結束，不執行下面的裝水動作
        }
        
        let maxWater = 1;
        if (ownedUpgrades.includes('pump')) maxWater = 999; 
        else if (ownedUpgrades.includes('well2')) maxWater = 3; 
        
        player.water = maxWater;
        updateGameUI();
    });
};

document.getElementById('bike').onclick = function() {
    walkTo(this, () => {
        if (player.crops.length > 0) {
            let totalGain = 0;
            player.crops.forEach(c => {
                let price = cropInfo[c].basePrice;
                if(c === 'pumpkin' && ownedUpgrades.includes('pie')) price += 20;
                if(c === 'cabbage' && ownedUpgrades.includes('windmill')) price += 20;
                totalGain += price;
                levelProgress[c]++;
            });
            
            globalMoney += totalGain;
            levelEarnedMoney += totalGain;
            player.crops = []; 
            
            showFloatingText(`+$${totalGain}`, player.x + 30, player.y - 20);
            updateGameUI();
            checkWin();
        }
    });
};

function handlePlotClick(id, el) {
    if (player.isMoving) return;
    let pData = plots[id];

    if (pData.state === 'empty') {
        targetPlotId = id;
        let menu = document.getElementById('seed-menu');
        menu.style.display = 'flex';
        menu.style.left = (parseInt(el.style.left) + 80) + 'px';
        menu.style.top = (parseInt(el.style.top) - 30) + 'px';
        return;
    }

    walkTo(el, () => {
        const growDelay = ownedUpgrades.includes('gloves') ? 1500 : 3000;

        if (pData.state === 'thirsty') {
            if (player.water > 0) {
                player.water--; 
                pData.state = 'growing'; updateGameUI();
                setTimeout(() => { if (plots[id].state === 'growing') { plots[id].state = 'weedy'; updateGameUI(); }}, growDelay);
            } else {
                alert("水桶空了，去左上角打水！");
            }
        } 
        else if (pData.state === 'weedy') {
            pData.state = 'growing'; updateGameUI();
            setTimeout(() => { if (plots[id].state === 'growing') { plots[id].state = 'ripe'; updateGameUI(); }}, growDelay);
        }
        else if (pData.state === 'ripe') {
            let maxCapacity = 1;
            if (ownedUpgrades.includes('basket')) maxCapacity = 5;
            else if (ownedUpgrades.includes('wooden_box')) maxCapacity = 3;

            // 【修復 Bug 的關鍵】
            // 如果手上有水（包含無限水），走到成熟的蔬菜旁邊時，就讓農夫「自動把水桶放下」！
            if (player.water > 0) {
                player.water = 0; 
            }

            // 放下水桶後，就可以正常採收了
            if (player.crops.length < maxCapacity) {
                player.crops.push(pData.cropType);
                pData.state = 'empty'; pData.cropType = null; 
                updateGameUI();
            } else {
                alert("手上拿不下了！快去右邊賣掉！");
            }
        }
    });
}

function buySeed(type) {
    let cost = cropInfo[type].cost;
    if (globalMoney >= cost) {
        let targetEl = document.querySelectorAll('.plot')[targetPlotId];
        walkTo(targetEl, () => {
            globalMoney -= cost;
            plots[targetPlotId].state = 'thirsty';
            plots[targetPlotId].cropType = type;
            document.getElementById('seed-menu').style.display = 'none';
            updateGameUI();
        });
    } else alert("金幣不足！");
}
function closeMenu() { document.getElementById('seed-menu').style.display = 'none'; }

function checkWin() {
    let lvl = levels[currentLevel];
    let win = true;
    for(let crop in lvl.target) {
        if(levelProgress[crop] < lvl.target[crop]) win = false;
    }
    if(win) {
        clearInterval(timerInterval);
        animalIntervals.forEach(clearInterval); 
        setTimeout(() => endLevel(true), 500);
    }
}

function endLevel(isWin) {
    if(isWin && currentLevel + 1 === maxLevelUnlocked) maxLevelUnlocked++; 
    let totalSold = (levelProgress.pumpkin || 0) + (levelProgress.cabbage || 0);
    document.getElementById('stat-sold').innerText = totalSold;
    document.getElementById('stat-earned').innerText = levelEarnedMoney;
    document.getElementById('stat-total').innerText = globalMoney;
    
    saveGame(); // 【存檔點】過關結算後存檔
    showScreen('screen-stats');
}

// ================= 重置遊戲功能 =================
// 如果你想重新測試，可以在網頁按下 F12，在 Console 輸入 clearSave()
window.clearSave = function() {
    localStorage.removeItem('farm_money');
    localStorage.removeItem('farm_level');
    localStorage.removeItem('farm_upgrades');
    alert('存檔已清除，請重新整理網頁！');
};

showScreen('screen-map');