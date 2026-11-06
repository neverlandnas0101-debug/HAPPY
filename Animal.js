class Animal {
    // 增加 feedCost 參數
    constructor(emoji, cost, recyclePrice, totalSeconds, maxHearts, feedCost) {
        this.emoji = emoji;
        this.cost = cost;
        this.recyclePrice = recyclePrice;
        this.totalSeconds = totalSeconds;
        this.maxHearts = maxHearts;
        this.feedCost = feedCost;
    }

    // 顯示飢餓、等待餵食的狀態
    showHungry(cellElement) {
        cellElement.innerHTML = `
            <div class="cell-info hungry-ui">
                <div class="feed-icon">🍽️</div>
                <div class="feed-btn">FOOD $${this.feedCost}</div>
            </div>
            <div class="cell-emoji">${this.emoji}</div>
        `;
        cellElement.classList.add('is-hungry');
    }

    // 餵食後開始成長
    raise(cellElement, onReady, plantedAt = Date.now()) {
        cellElement.classList.remove('is-hungry');
        
        cellElement.innerHTML = `
            <div class="cell-info">
                <div>⏱ <span class="time-val"></span>s</div>
                <div>❤️ <span class="heart-val"></span></div>
            </div>
            <div class="cell-emoji">${this.emoji}</div>
        `;

        const timer = setInterval(() => {
            const elapsed = Math.floor((Date.now() - plantedAt) / 1000);
            const timeLeft = this.totalSeconds - elapsed;
            let currentHearts = Math.floor((elapsed / this.totalSeconds) * this.maxHearts);
            if (currentHearts > this.maxHearts) currentHearts = this.maxHearts;
            
            const timeSpan = cellElement.querySelector('.time-val');
            const heartSpan = cellElement.querySelector('.heart-val');
            
            if(timeSpan) timeSpan.innerText = timeLeft > 0 ? timeLeft : 0;
            if(heartSpan) heartSpan.innerText = `${currentHearts}/${this.maxHearts}`;

            if (timeLeft <= 0) {
                clearInterval(timer);
                cellElement.querySelector('.cell-info').innerHTML = `<div class="pick-btn">PICK +$${this.recyclePrice}</div>`;
                cellElement.classList.add('ready-to-collect');
                onReady(this.recyclePrice);
            }
        }, 1000);
        
        return timer;
    }
}