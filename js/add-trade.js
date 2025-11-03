// Add Trade functionality
class AddTrade {
    constructor() {
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.isRecording = false;
        this.audioUrl = null;
        
        this.init();
    }

    init() {
        this.loadCurrencyPairs();
        this.setupEventListeners();
        this.setupModal();
    }

    loadCurrencyPairs() {
        const select = document.getElementById('currencyPair');
        const pairs = tradingApp.getCurrencyPairs();
        
        // Clear existing options except the first one
        while (select.options.length > 1) {
            select.remove(1);
        }
        
        // Add currency pairs
        pairs.forEach(pair => {
            const option = document.createElement('option');
            option.value = pair;
            option.textContent = pair;
            select.appendChild(option);
        });
    }

    setupEventListeners() {
        const form = document.getElementById('tradeForm');
        const recordBtn = document.getElementById('recordBtn');
        const clearBtn = document.getElementById('clearForm');
        const addPairBtn = document.getElementById('addPairBtn');

        form.addEventListener('submit', (e) => this.handleSubmit(e));
        recordBtn.addEventListener('click', () => this.toggleRecording());
        clearBtn.addEventListener('click', () => this.clearForm());
        addPairBtn.addEventListener('click', () => this.showAddPairModal());

        // Update exit price requirement based on status
        document.getElementById('tradeStatus').addEventListener('change', (e) => {
            const exitPrice = document.getElementById('exitPrice');
            if (e.target.value !== 'OPEN') {
                exitPrice.required = true;
            } else {
                exitPrice.required = false;
                exitPrice.value = '';
            }
        });
    }

    setupModal() {
        const modal = document.getElementById('addPairModal');
        const saveBtn = document.getElementById('savePairBtn');
        const cancelBtn = document.getElementById('cancelPairBtn');

        saveBtn.addEventListener('click', () => this.saveNewPair());
        cancelBtn.addEventListener('click', () => this.hideAddPairModal());

        // Close modal when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.hideAddPairModal();
            }
        });
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const tradeData = {
            currencyPair: document.getElementById('currencyPair').value,
            tradeType: document.getElementById('tradeType').value,
            entryPrice: parseFloat(document.getElementById('entryPrice').value),
            lotSize: parseFloat(document.getElementById('lotSize').value),
            stopLoss: document.getElementById('stopLoss').value ? parseFloat(document.getElementById('stopLoss').value) : null,
            takeProfit: document.getElementById('takeProfit').value ? parseFloat(document.getElementById('takeProfit').value) : null,
            exitPrice: document.getElementById('exitPrice').value ? parseFloat(document.getElementById('exitPrice').value) : null,
            status: document.getElementById('tradeStatus').value,
            reason: document.getElementById('tradeReason').value,
            voiceNote: this.audioUrl
        };

        // Validate exit price for closed trades
        if (tradeData.status !== 'OPEN' && !tradeData.exitPrice) {
            alert('Exit price is required for closed trades.');
            return;
        }

        try {
            tradingApp.saveTrade(tradeData);
            this.showSuccessMessage();
            this.clearForm();
        } catch (error) {
            this.showErrorMessage(error.message);
        }
    }

    async toggleRecording() {
        const recordBtn = document.getElementById('recordBtn');
        const status = document.getElementById('recordingStatus');
        const audioPlayback = document.getElementById('audioPlayback');

        if (!this.isRecording) {
            // Start recording
            const started = await tradingApp.startRecording();
            if (started) {
                this.isRecording = true;
                recordBtn.textContent = '⏹ Stop Recording';
                status.textContent = 'Recording...';
                status.classList.add('recording');
            }
        } else {
            // Stop recording
            this.audioUrl = await tradingApp.stopRecording();
            this.isRecording = false;
            recordBtn.textContent = '🎤 Start Recording';
            status.textContent = 'Recording saved';
            status.classList.remove('recording');

            // Show audio playback
            if (this.audioUrl) {
                audioPlayback.src = this.audioUrl;
                audioPlayback.style.display = 'block';
            }
        }
    }

    showAddPairModal() {
        document.getElementById('addPairModal').style.display = 'flex';
        document.getElementById('newPairInput').value = '';
        document.getElementById('newPairInput').focus();
    }

    hideAddPairModal() {
        document.getElementById('addPairModal').style.display = 'none';
    }

    saveNewPair() {
        const newPair = document.getElementById('newPairInput').value.trim().toUpperCase();
        
        if (!newPair) {
            alert('Please enter a currency pair.');
            return;
        }

        // Basic validation for currency pair format (e.g., EUR/USD)
        if (!/^[A-Z]{3}\/[A-Z]{3}$/.test(newPair)) {
            alert('Please enter a valid currency pair format (e.g., EUR/USD)');
            return;
        }

        const success = tradingApp.addCurrencyPair(newPair);
        if (success) {
            this.loadCurrencyPairs();
            document.getElementById('currencyPair').value = newPair;
            this.hideAddPairModal();
            this.showMessage('Currency pair added successfully!', 'success');
        } else {
            this.showMessage('Currency pair already exists!', 'error');
        }
    }

    clearForm() {
        document.getElementById('tradeForm').reset();
        this.audioUrl = null;
        document.getElementById('audioPlayback').style.display = 'none';
        document.getElementById('recordingStatus').textContent = 'Not recording';
    }

    showSuccessMessage() {
        this.showMessage('Trade saved successfully!', 'success');
    }

    showErrorMessage(message) {
        this.showMessage(message, 'error');
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

// Initialize add trade page
document.addEventListener('DOMContentLoaded', () => {
    new AddTrade();
});