class Player {
    constructor() {
        this.money = 150;
        this.level = 1;
        this.exp = 0; // 經驗值 0~4
        this.levelUpBaseCost = 80;
    }

    // 每次特訓只要付總金額的 1/5
    getClickCost() { 
        const totalLevelCost = this.level * this.levelUpBaseCost;
        return Math.floor(totalLevelCost / 5); 
    }

    tryLevelUp() {
        const cost = this.getClickCost();
        if (this.spendMoney(cost)) {
            this.exp++;
            if (this.exp >= 5) {
                this.level++;
                this.exp = 0;
            }
            this.updateUI();
            return true;
        }
        return false;
    }

    spendMoney(amount) {
        if (this.money >= amount) {
            this.money -= amount;
            this.updateUI();
            return true;
        }
        alert("金錢不足！");
        return false;
    }

    earnMoney(amount) {
        this.money += amount;
        this.updateUI();
    }

    updateUI() {
        document.getElementById('money-display').innerText = this.money;
        document.getElementById('level-display').innerText = this.level;
        document.getElementById('levelup-cost').innerText = this.getClickCost();
        
        // 更新經驗條 (綠色實心 🟩 代表獲得，白色空心 ⬜ 代表未獲得)
        let expString = "";
        for(let i=0; i<5; i++) {
            expString += (i < this.exp) ? "🟩" : "⬜";
        }
        document.getElementById('exp-bar').innerText = expString;
    }
}