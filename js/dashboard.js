// Dashboard functionality
class Dashboard {
    constructor() {
        this.init();
    }

    init() {
        this.loadStats();
        this.loadRecentTrades();
        this.initCharts();
    }

    loadStats() {
        const stats = tradingApp.getDashboardStats();
        
        document.getElementById('totalTrades').textContent = stats.totalTrades;
        document.getElementById('winningTrades').textContent = stats.winningTrades;
        document.getElementById('losingTrades').textContent = stats.losingTrades;
        document.getElementById('winRate').textContent = `${stats.winRate}%`;
    }

    loadRecentTrades() {
        const recentTrades = tradingApp.getTrades().slice(0, 5);
        const container = document.getElementById('recentTradesList');
        
        if (recentTrades.length === 0) {
            container.innerHTML = '<div class="no-data">No trades yet. <a href="add-trade.html">Add your first trade!</a></div>';
            return;
        }

        container.innerHTML = recentTrades.map(trade => `
            <div class="trade-item ${trade.status.toLowerCase()}">
                <div class="trade-info">
                    <div class="trade-pair">${trade.currencyPair}</div>
                    <div class="trade-meta">
                        ${this.formatDate(trade.timestamp)} • 
                        ${trade.tradeType} • 
                        Lot: ${trade.lotSize}
                    </div>
                </div>
                <div class="trade-status ${trade.status.toLowerCase()}">
                    ${trade.status}
                </div>
            </div>
        `).join('');
    }

    initCharts() {
        this.initPerformanceChart();
        this.initPairsChart();
    }

    initPerformanceChart() {
        const ctx = document.getElementById('performanceChart').getContext('2d');
        const stats = tradingApp.getDashboardStats();
        
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Wins', 'Losses', 'Open'],
                datasets: [{
                    data: [stats.winningTrades, stats.losingTrades, stats.openTrades],
                    backgroundColor: ['#10b981', '#ef4444', '#f59e0b'],
                    borderWidth: 2,
                    borderColor: '#1e293b'
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#e2e8f0',
                            font: {
                                size: 12
                            }
                        }
                    }
                }
            }
        });
    }

    initPairsChart() {
        const ctx = document.getElementById('pairsChart').getContext('2d');
        const pairPerformance = tradingApp.getPerformanceByPair();
        
        const pairs = Object.keys(pairPerformance);
        const winRates = pairs.map(pair => {
            const perf = pairPerformance[pair];
            return perf.total > 0 ? (perf.wins / perf.total * 100) : 0;
        });

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: pairs,
                datasets: [{
                    label: 'Win Rate %',
                    data: winRates,
                    backgroundColor: '#3b82f6',
                    borderColor: '#2563eb',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            color: '#94a3b8'
                        },
                        grid: {
                            color: '#334155'
                        }
                    },
                    x: {
                        ticks: {
                            color: '#94a3b8'
                        },
                        grid: {
                            color: '#334155'
                        }
                    }
                },
                plugins: {
                    legend: {
                        labels: {
                            color: '#e2e8f0'
                        }
                    }
                }
            }
        });
    }

    formatDate(timestamp) {
        return new Date(timestamp).toLocaleDateString();
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new Dashboard();
});