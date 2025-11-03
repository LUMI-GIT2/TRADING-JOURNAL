// View Trades functionality
class ViewTrades {
    constructor() {
        this.currentFilters = {
            status: 'ALL',
            pair: 'ALL',
            type: 'ALL'
        };
        
        this.init();
    }

    init() {
        this.loadTrades();
        this.setupFilters();
        this.setupModal();
    }

    loadTrades() {
        const trades = tradingApp.getTrades(this.currentFilters);
        const tableBody = document.getElementById('tradesTableBody');
        const noTradesMessage = document.getElementById('noTradesMessage');

        if (trades.length === 0) {
            tableBody.innerHTML = '';
            noTradesMessage.style.display = 'block';
            return;
        }

        noTradesMessage.style.display = 'none';
        
        tableBody.innerHTML = trades.map(trade => `
            <tr>
                <td>${this.formatDate(trade.timestamp)}</td>
                <td>${trade.currencyPair}</td>
                <td class="type-${trade.tradeType.toLowerCase()}">${trade.tradeType}</td>
                <td>${trade.entryPrice}</td>
                <td>${trade.lotSize}</td>
                <td>${trade.stopLoss || '-'}</td>
                <td>${trade.takeProfit || '-'}</td>
                <td>${trade.exitPrice || '-'}</td>
                <td class="status-${trade.status.toLowerCase()}">${trade.status}</td>
                <td class="action-buttons">
                    <button onclick="viewTrades.showTradeDetails('${trade.id}')" class="btn-secondary btn-small">View</button>
                    <button onclick="viewTrades.deleteTrade('${trade.id}')" class="btn-secondary btn-small" style="background: #ef4444;">Delete</button>
                </td>
            </tr>
        `).join('');
    }

    setupFilters() {
        const statusFilter = document.getElementById('statusFilter');
        const pairFilter = document.getElementById('pairFilter');
        const typeFilter = document.getElementById('typeFilter');
        const clearFiltersBtn = document.getElementById('clearFilters');

        // Populate pairs filter
        const pairs = tradingApp.getCurrencyPairs();
        pairs.forEach(pair => {
            const option = document.createElement('option');
            option.value = pair;
            option.textContent = pair;
            pairFilter.appendChild(option);
        });

        statusFilter.addEventListener('change', (e) => {
            this.currentFilters.status = e.target.value;
            this.loadTrades();
        });

        pairFilter.addEventListener('change', (e) => {
            this.currentFilters.pair = e.target.value;
            this.loadTrades();
        });

        typeFilter.addEventListener('change', (e) => {
            this.currentFilters.type = e.target.value;
            this.loadTrades();
        });

        clearFiltersBtn.addEventListener('click', () => {
            this.currentFilters = { status: 'ALL', pair: 'ALL', type: 'ALL' };
            statusFilter.value = 'ALL';
            pairFilter.value = 'ALL';
            typeFilter.value = 'ALL';
            this.loadTrades();
        });
    }

    setupModal() {
        const modal = document.getElementById('tradeDetailsModal');
        const closeBtn = document.getElementById('closeDetailsBtn');

        closeBtn.addEventListener('click', () => this.hideTradeDetails());

        // Close modal when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.hideTradeDetails();
            }
        });
    }

    showTradeDetails(tradeId) {
        const trade = tradingApp.trades.find(t => t.id === tradeId);
        if (!trade) return;

        const modalContent = document.getElementById('tradeDetailsContent');
        modalContent.innerHTML = `
            <div class="trade-details">
                <div class="detail-row">
                    <span class="detail-label">Currency Pair:</span>
                    <span class="detail-value">${trade.currencyPair}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Trade Type:</span>
                    <span class="detail-value ${trade.tradeType.toLowerCase()}">${trade.tradeType}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Status:</span>
                    <span class="detail-value status-${trade.status.toLowerCase()}">${trade.status}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Entry Price:</span>
                    <span class="detail-value">${trade.entryPrice}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Lot Size:</span>
                    <span class="detail-value">${trade.lotSize}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Stop Loss:</span>
                    <span class="detail-value">${trade.stopLoss || '-'}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Take Profit:</span>
                    <span class="detail-value">${trade.takeProfit || '-'}</span>
                </div>
                ${trade.exitPrice ? `
                <div class="detail-row">
                    <span class="detail-label">Exit Price:</span>
                    <span class="detail-value">${trade.exitPrice}</span>
                </div>
                ` : ''}
                <div class="detail-row">
                    <span class="detail-label">Date:</span>
                    <span class="detail-value">${this.formatDate(trade.timestamp)}</span>
                </div>
                ${trade.reason ? `
                <div class="detail-row full-width">
                    <span class="detail-label">Reason:</span>
                    <div class="detail-value reason-text">${trade.reason}</div>
                </div>
                ` : ''}
                ${trade.voiceNote ? `
                <div class="detail-row full-width">
                    <span class="detail-label">Voice Note:</span>
                    <div class="detail-value">
                        <audio controls src="${trade.voiceNote}"></audio>
                    </div>
                </div>
                ` : ''}
            </div>
        `;

        // Add CSS for trade details
        const style = document.createElement('style');
        style.textContent = `
            .trade-details {
                display: flex;
                flex-direction: column;
                gap: 1rem;
            }
            .detail-row {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                padding: 0.5rem 0;
                border-bottom: 1px solid #334155;
            }
            .detail-row.full-width {
                flex-direction: column;
                gap: 0.5rem;
            }
            .detail-label {
                font-weight: 600;
                color: #e2e8f0;
                min-width: 120px;
            }
            .detail-value {
                color: #94a3b8;
                text-align: right;
            }
            .reason-text {
                background: #0f172a;
                padding: 1rem;
                border-radius: 0.5rem;
                border: 1px solid #334155;
                text-align: left;
                line-height: 1.5;
            }
        `;
        if (!document.querySelector('#trade-details-style')) {
            style.id = 'trade-details-style';
            document.head.appendChild(style);
        }

        document.getElementById('tradeDetailsModal').style.display = 'flex';
    }

    hideTradeDetails() {
        document.getElementById('tradeDetailsModal').style.display = 'none';
    }

    deleteTrade(tradeId) {
        if (confirm('Are you sure you want to delete this trade? This action cannot be undone.')) {
            tradingApp.deleteTrade(tradeId);
            this.loadTrades();
            this.showMessage('Trade deleted successfully!', 'success');
        }
    }

    formatDate(timestamp) {
        return new Date(timestamp).toLocaleString();
    }

    showMessage(message, type) {
        const messageDiv = document.createElement('div');
        messageDiv.textContent = message;
        messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: 0.5rem;
            color: white;
            font-weight: 500;
            z-index: 1000;
            background: ${type === 'success' ? '#10b981' : '#ef4444'};
        `;
        
        document.body.appendChild(messageDiv);
        
        setTimeout(() => {
            document.body.removeChild(messageDiv);
        }, 3000);
    }
}

// Initialize view trades page
const viewTrades = new ViewTrades();