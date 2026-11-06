class Crop {
    constructor(emoji, cost, sellPrice, totalSeconds) {
        this.emoji = emoji;
        this.cost = cost;
        this.sellPrice = sellPrice;
        this.totalSeconds = totalSeconds;
    }

    // 加入 plantedAt 參數，如果是讀取存檔就會帶入過去的時間
    grow(cellElement, onReady, plantedAt = Date.now()) {
        cellElement.innerHTML = `
            <div class="cell-info"><div>⏱ <span class="time-val"></span>s</div></div>
            <div class="cell-emoji">🌱</div>
        `;

        const timer = setInterval(() => {
            // 計算真實經過的秒數 (支援離線進度)
            const elapsed = Math.floor((Date.now() - plantedAt) / 1000);
            const timeLeft = this.totalSeconds - elapsed;

            const timeSpan = cellElement.querySelector('.time-val');
            if(timeSpan) timeSpan.innerText = timeLeft > 0 ? timeLeft : 0;

            if (timeLeft <= 0) {
                clearInterval(timer);
                cellElement.querySelector('.cell-emoji').innerText = this.emoji;
                cellElement.querySelector('.cell-info').innerHTML = `<div class="pick-btn">PICK +$${this.sellPrice}</div>`;
                cellElement.classList.add('ready-to-collect');
                onReady(this.sellPrice);
            }
        }, 1000);
        
        return timer; // 回傳 timer 方便重置
    }
}