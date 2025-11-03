
class Dashboard {
    constructor() {
        this.performanceChart = null;
        this.pairsChart = null;
        this.init();
    }

    init() {
        this.loadStats();
        this.loadRecentTrades();
        this.initCharts();
        this.setupResponsiveHandlers();
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
        
        // Register charts for responsive handling
        if (window.responsiveCharts) {
            window.responsiveCharts.registerChart(this.performanceChart);
            window.responsiveCharts.registerChart(this.pairsChart);
        }
    }

    initPerformanceChart() {
        const ctx = document.getElementById('performanceChart');
        if (!ctx) return;
        
        const stats = tradingApp.getDashboardStats();
        
        this.performanceChart = new Chart(ctx, {
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
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#e2e8f0',
                            font: {
                                size: this.getResponsiveFontSize()
                            }
                        }
                    }
                }
            }
        });
    }

    initPairsChart() {
        const ctx = document.getElementById('pairsChart');
        if (!ctx) return;
        
        const pairPerformance = tradingApp.getPerformanceByPair();
        
        const pairs = Object.keys(pairPerformance);
        const winRates = pairs.map(pair => {
            const perf = pairPerformance[pair];
            return perf.total > 0 ? (perf.wins / perf.total * 100) : 0;
        });

        this.pairsChart = new Chart(ctx, {
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
                maintainAspectRatio: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            color: '#94a3b8',
                            font: {
                                size: this.getResponsiveFontSize()
                            }
                        },
                        grid: {
                            color: '#334155'
                        }
                    },
                    x: {
                        ticks: {
                            color: '#94a3b8',
                            font: {
                                size: this.getResponsiveFontSize()
                            }
                        },
                        grid: {
                            color: '#334155'
                        }
                    }
                },
                plugins: {
                    legend: {
                        labels: {
                            color: '#e2e8f0',
                            font: {
                                size: this.getResponsiveFontSize()
                            }
                        }
                    }
                }
            }
        });
    }

    getResponsiveFontSize() {
        if (window.innerWidth < 480) return 10;
        if (window.innerWidth < 768) return 11;
        return 12;
    }

    setupResponsiveHandlers() {
        // Update charts on resize
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                if (this.performanceChart) {
                    this.performanceChart.update();
                }
                if (this.pairsChart) {
                    this.pairsChart.update();
                }
            }, 250);
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