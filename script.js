// Voice recording functionality
        const recordBtn = document.getElementById('record-btn');
        const recordingStatus = document.getElementById('recording-status');
        const timerDisplay = document.getElementById('timer');
        const audioPlayback = document.getElementById('audio-playback');

        let mediaRecorder;
        let audioChunks = [];
        let recordingTimer;
        let seconds = 0;

        recordBtn.addEventListener('click', async () => {
            if (!mediaRecorder || mediaRecorder.state === 'inactive') {
                // Start recording
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                    mediaRecorder = new MediaRecorder(stream);
                    
                    mediaRecorder.ondataavailable = (event) => {
                        audioChunks.push(event.data);
                    };
                    
                    mediaRecorder.onstop = () => {
                        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                        const audioUrl = URL.createObjectURL(audioBlob);
                        audioPlayback.src = audioUrl;
                        audioPlayback.style.display = 'block';
                    };
                    
                    mediaRecorder.start();
                    recordBtn.innerHTML = '<i class="fas fa-stop"></i> Stop Recording';
                    recordingStatus.style.display = 'flex';
                    startTimer();
                    
                } catch (error) {
                    alert('Error accessing microphone: ' + error.message);
                }
            } else {
                // Stop recording
                mediaRecorder.stop();
                recordBtn.innerHTML = '<i class="fas fa-microphone"></i> Start Recording';
                recordingStatus.style.display = 'none';
                stopTimer();
            }
        });

        function startTimer() {
            seconds = 0;
            recordingTimer = setInterval(() => {
                seconds++;
                timerDisplay.textContent = seconds + 's';
            }, 1000);
        }

        function stopTimer() {
            clearInterval(recordingTimer);
        }

        // Trade storage and management
        let trades = JSON.parse(localStorage.getItem('trades')) || [];

        // Form submission
        const tradeForm = document.getElementById('trade-form');

        tradeForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const trade = {
                id: Date.now(),
                currencyPair: document.getElementById('currency-pair').value,
                tradeType: document.getElementById('trade-type').value,
                entryPrice: parseFloat(document.getElementById('entry-price').value),
                stopLoss: document.getElementById('stop-loss').value ? parseFloat(document.getElementById('stop-loss').value) : null,
                takeProfit: document.getElementById('take-profit').value ? parseFloat(document.getElementById('take-profit').value) : null,
                reason: document.getElementById('trade-reason').value,
                voiceNote: audioPlayback.src || null,
                timestamp: new Date().toISOString(),
                status: 'open'
            };
            
            trades.push(trade);
            localStorage.setItem('trades', JSON.stringify(trades));
            
            // Reset form
            tradeForm.reset();
            audioPlayback.style.display = 'none';
            audioPlayback.src = '';
            
            alert('Trade saved successfully!');
            displayTrades();
            updateDashboard();
        });

        // Display trades function
        function displayTrades(filter = 'all') {
            const tradesList = document.getElementById('trades-list');
            const filteredTrades = trades.filter(trade => {
                if (filter === 'all') return true;
                return trade.status === filter;
            });
            
            if (filteredTrades.length === 0) {
                tradesList.innerHTML = '<p class="no-trades">No trades found</p>';
                return;
            }
            
            tradesList.innerHTML = filteredTrades.map(trade => `
                <div class="trade-card ${trade.status}">
                    <div class="trade-header">
                        <span class="trade-pair">${trade.currencyPair}</span>
                        <span class="trade-type ${trade.tradeType}">${trade.tradeType.toUpperCase()}</span>
                    </div>
                    
                    <div class="trade-details">
                        <div class="trade-detail">
                            <span class="detail-label">Entry</span>
                            <span class="detail-value">${trade.entryPrice}</span>
                        </div>
                        <div class="trade-detail">
                            <span class="detail-label">Stop Loss</span>
                            <span class="detail-value">${trade.stopLoss || 'N/A'}</span>
                        </div>
                        <div class="trade-detail">
                            <span class="detail-label">Take Profit</span>
                            <span class="detail-value">${trade.takeProfit || 'N/A'}</span>
                        </div>
                        <div class="trade-detail">
                            <span class="detail-label">Date</span>
                            <span class="detail-value">${new Date(trade.timestamp).toLocaleDateString()}</span>
                        </div>
                    </div>
                    
                    ${trade.reason ? <div class="trade-reason">${trade.reason}</div> : ''}
                    
                    ${trade.voiceNote ? `
                        <div class="voice-note">
                            <audio controls style="width: 100%; margin-top: 10px;">
                                <source src="${trade.voiceNote}" type="audio/wav">
                            </audio>
                        </div>
                    ` : ''}
                    
                    ${trade.status === 'open' ? `
                        <div class="trade-actions">
                            <button class="btn btn-small btn-success" onclick="markTradeResult(${trade.id}, 'win')">
                                <i class="fas fa-check"></i> Win
                            </button>
                            <button class="btn btn-small btn-danger" onclick="markTradeResult(${trade.id}, 'loss')">
                                <i class="fas fa-times"></i> Loss
                            </button>
                        </div>
                    ` : `
                        <div class="trade-result ${trade.status}">
                            Result: <strong>${trade.status.toUpperCase()}</strong>
                        </div>
                    `}
                </div>
            `).join('');
        }

        // Filter functionality
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                displayTrades(btn.dataset.filter);
            });
        });

        // Mark trade result
        function markTradeResult(tradeId, result) {
            trades = trades.map(trade => {
                if (trade.id === tradeId) {
                    return { ...trade, status: result };
                }
                return trade;
            });
            localStorage.setItem('trades', JSON.stringify(trades));
            displayTrades();
            updateDashboard();
        }

        // Update dashboard stats
        function updateDashboard() {
            const totalTrades = trades.length;
            const winTrades = trades.filter(trade => trade.status === 'win').length;
            const lossTrades = trades.filter(trade => trade.status === 'loss').length;
            const winRate = totalTrades > 0 ? Math.round((winTrades / totalTrades) * 100) : 0;

            document.getElementById('total-trades').textContent = totalTrades;
            document.getElementById('win-trades').textContent = winTrades;
            document.getElementById('loss-trades').textContent = lossTrades;
            document.getElementById('win-rate').textContent = winRate + '%';
        }

        // Initialize
        displayTrades();
        updateDashboard();