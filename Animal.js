class Animal {
    constructor(emoji, cost, productPrice, cycleSeconds, maxHearts, feedCost) {
        this.emoji = emoji;
        this.cost = cost;
        this.productPrice = productPrice; // 每次生產(雞蛋/牛奶)賺的錢
        this.cycleSeconds = cycleSeconds; // 每次生產需要的時間
        this.maxHearts = maxHearts;       // 總壽命 (最大生產次數)
        this.feedCost = feedCost;         // 初始飼料費
    }

    showHungry(cellElement) {
        cellElement.innerHTML = `
            <div class="cell-info hungry-ui">
                <div class="feed-icon">🍽️</div>
                <div class="feed-btn">FOOD $${this.feedCost}</div>
            </div>
            <div class="cell-emoji">${this.emoji}</div>
        `;
        cellElement.classList.add('is-hungry');
        cellElement.classList.remove('ready-to-collect');
    }

    // 加入 currentHearts 參數，讓動物知道自己剩幾滴血
    produce(cellElement, currentHearts, onReady, plantedAt = Date.now()) {
        cellElement.classList.remove('is-hungry');
        cellElement.classList.remove('ready-to-collect');
        
        cellElement.innerHTML = `
            <div class="cell-info">
                <div>⏱ <span class="time-val"></span>s</div>
                <div>❤️ <span class="heart-val">${currentHearts}/${this.maxHearts}</span></div>
            </div>
            <div class="cell-emoji">${this.emoji}</div>
        `;

        const timer = setInterval(() => {
            const elapsed = Math.floor((Date.now() - plantedAt) / 1000);
            const timeLeft = this.cycleSeconds - elapsed;
            
            const timeSpan = cellElement.querySelector('.time-val');
            if(timeSpan) timeSpan.innerText = timeLeft > 0 ? timeLeft : 0;

            if (timeLeft <= 0) {
                clearInterval(timer);
                // 生產完成，顯示 PICK 按鈕，並依然顯示剩餘血量
                cellElement.querySelector('.cell-info').innerHTML = `
                    <div class="pick-btn">PICK +$${this.productPrice}</div>
                    <div style="font-size:11px; margin-top:2px; color: #ffeb3b; font-weight:bold; text-shadow: 1px 1px 0 #000;">
                        ❤️ 壽命 ${currentHearts}/${this.maxHearts}
                    </div>
                `;
                cellElement.classList.add('ready-to-collect');
                onReady(this.productPrice); // 呼叫 main.js 處理收成與扣血
            }
        }, 1000);
        
        return timer;
    }
}
