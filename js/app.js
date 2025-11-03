// Shared functionality and data management
class TradingJournal {
    constructor() {
        this.trades = JSON.parse(localStorage.getItem('forexTrades')) || [];
        this.currencyPairs = JSON.parse(localStorage.getItem('currencyPairs')) || [
            'EUR/USD', 'GBP/USD', 'USD/JPY', 'AUD/USD', 
            'USD/CAD', 'USD/CHF', 'NZD/USD'
        ];
        this.init();
    }

    init() {
        this.saveCurrencyPairs();
    }

    // Trade Management
    saveTrade(tradeData) {
        const trade = {
            id: this.generateId(),
            timestamp: new Date().toISOString(),
            ...tradeData
        };
        
        this.trades.unshift(trade);
        this.saveToLocalStorage();
        return trade;
    }

    updateTrade(tradeId, updates) {
        const tradeIndex = this.trades.findIndex(trade => trade.id === tradeId);
        if (tradeIndex !== -1) {
            this.trades[tradeIndex] = { ...this.trades[tradeIndex], ...updates };
            this.saveToLocalStorage();
            return true;
        }
        return false;
    }

    deleteTrade(tradeId) {
        this.trades = this.trades.filter(trade => trade.id !== tradeId);
        this.saveToLocalStorage();
    }

    getTrades(filters = {}) {
        let filteredTrades = [...this.trades];

        if (filters.status && filters.status !== 'ALL') {
            filteredTrades = filteredTrades.filter(trade => trade.status === filters.status);
        }

        if (filters.pair && filters.pair !== 'ALL') {
            filteredTrades = filteredTrades.filter(trade => trade.currencyPair === filters.pair);
        }

        if (filters.type && filters.type !== 'ALL') {
            filteredTrades = filteredTrades.filter(trade => trade.tradeType === filters.type);
        }

        return filteredTrades;
    }

    // Currency Pair Management
    addCurrencyPair(pair) {
        if (!this.currencyPairs.includes(pair)) {
            this.currencyPairs.push(pair);
            this.saveCurrencyPairs();
            return true;
        }
        return false;
    }

    getCurrencyPairs() {
        return this.currencyPairs;
    }

    // Analytics
    getDashboardStats() {
        const totalTrades = this.trades.length;
        const winningTrades = this.trades.filter(trade => trade.status === 'WIN').length;
        const losingTrades = this.trades.filter(trade => trade.status === 'LOSS').length;
        const openTrades = this.trades.filter(trade => trade.status === 'OPEN').length;
        
        const winRate = totalTrades > 0 ? ((winningTrades / totalTrades) * 100).toFixed(1) : 0;

        return {
            totalTrades,
            winningTrades,
            losingTrades,
            openTrades,
            winRate
        };
    }

    getPerformanceByPair() {
        const pairPerformance = {};
        
        this.trades.forEach(trade => {
            const pair = trade.currencyPair;
            if (!pairPerformance[pair]) {
                pairPerformance[pair] = { wins: 0, losses: 0, total: 0 };
            }
            
            if (trade.status === 'WIN') pairPerformance[pair].wins++;
            if (trade.status === 'LOSS') pairPerformance[pair].losses++;
            pairPerformance[pair].total++;
        });

        return pairPerformance;
    }

    // Utility Methods
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    saveToLocalStorage() {
        localStorage.setItem('forexTrades', JSON.stringify(this.trades));
    }

    saveCurrencyPairs() {
        localStorage.setItem('currencyPairs', JSON.stringify(this.currencyPairs));
    }

    // Voice Recording
    async startRecording() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.mediaRecorder = new MediaRecorder(stream);
            this.audioChunks = [];

            this.mediaRecorder.ondataavailable = (event) => {
                this.audioChunks.push(event.data);
            };

            this.mediaRecorder.start();
            return true;
        } catch (error) {
            console.error('Error starting recording:', error);
            return false;
        }
    }

    stopRecording() {
        return new Promise((resolve) => {
            if (!this.mediaRecorder) {
                resolve(null);
                return;
            }

            this.mediaRecorder.onstop = () => {
                const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
                const audioUrl = URL.createObjectURL(audioBlob);
                resolve(audioUrl);
            };

            this.mediaRecorder.stop();
            this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
        });
    }
}

// Initialize the trading journal
const tradingApp = new TradingJournal();