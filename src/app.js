// 日本語技術文書対話学習 - JavaScript with Edge-TTS

class JapaneseTTSDemo {
    constructor() {
        this.audioPlayer = null; // 移除HTML audio元素，使用动态创建的Audio对象
        this.currentScript = null;
        this.isPlaying = false;
        this.currentAudioBlob = null;
        this.ttsClient = null;
        this.hasAudioContent = false; // 添加音频内容状态
        this.audioList = []; // 音频列表
        
        this.initializeEdgeTTS();
        this.initializeEventListeners();
        this.initializeFileUpload();
        this.updateUIState(); // 初始化UI状态
        this.loadAudioListFromStorage(); // 从localStorage加载音频列表
    }

    async initializeEdgeTTS() {
        try {
            // 检查Edge-TTS是否可用
            if (typeof EdgeTTSClient !== 'undefined' && EdgeTTSClient.EdgeTTSClient) {
                // 初始化Edge-TTS客户端
                this.ttsClient = new EdgeTTSClient.EdgeTTSClient();
                
                // 设置日语语音
                await this.ttsClient.setMetadata(
                    'ja-JP-NanamiNeural', // 日语女声
                    EdgeTTSClient.OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3
                );
                
                console.log('Edge-TTS初始化成功');
            } else {
                console.log('Edge-TTS库未加载，将使用Web Speech API作为备用方案');
                this.ttsClient = null;
            }
        } catch (error) {
            console.error('Edge-TTS初始化失败:', error);
            console.log('回退到Web Speech API');
            // 如果Edge-TTS初始化失败，回退到Web Speech API
            this.ttsClient = null;
        }
    }

    initializeEventListeners() {
        // ファイルアップロード
        document.getElementById('uploadBtn').addEventListener('click', () => {
            document.getElementById('fileInput').click();
        });

        document.getElementById('fileInput').addEventListener('change', (e) => {
            this.handleFileSelect(e.target.files[0]);
        });

        // テキスト処理
        document.getElementById('processBtn').addEventListener('click', () => {
            this.processText();
        });

        // テキスト入力の変更を監視
        document.getElementById('textInput').addEventListener('input', () => {
            this.onTextInputChange();
        });

        // プレイヤーコントロール
        document.getElementById('playBtn').addEventListener('click', () => {
            this.togglePlayPause();
        });

        document.getElementById('pauseBtn').addEventListener('click', () => {
            this.pauseAudio();
        });

        document.getElementById('stopBtn').addEventListener('click', () => {
            this.stopAudio();
        });

        document.getElementById('downloadBtn').addEventListener('click', () => {
            this.downloadAudio();
        });

        document.getElementById('newAudioBtn').addEventListener('click', () => {
            this.resetForNewAudio();
        });


        // オーディオイベント
        if (this.audioPlayer) {
            this.audioPlayer.addEventListener('timeupdate', () => {
                this.updateProgress();
            });

            this.audioPlayer.addEventListener('loadedmetadata', () => {
                this.updateDuration();
            });

            this.audioPlayer.addEventListener('ended', () => {
                this.onAudioEnded();
            });
        }

        // プログレスバーのクリックイベント
        document.getElementById('progressBar').addEventListener('click', (e) => {
            if (this.hasAudioContent) {
                this.seekToPosition(e);
            }
        });

        // プログレスバーのドラッグ機能
        this.setupProgressBarDrag();
    }

    updateUIState() {
        const playBtn = document.getElementById('playBtn');
        const pauseBtn = document.getElementById('pauseBtn');
        const stopBtn = document.getElementById('stopBtn');
        const downloadBtn = document.getElementById('downloadBtn');
        const newAudioBtn = document.getElementById('newAudioBtn');
        const progressBar = document.getElementById('progressBar');

        // 根据是否有音频内容来启用/禁用按钮
        playBtn.disabled = !this.hasAudioContent;
        playBtn.textContent = this.isPlaying ? '⏸ 一時停止' : '▶ 再生';
        pauseBtn.disabled = !this.hasAudioContent || !this.isPlaying;
        stopBtn.disabled = !this.hasAudioContent || !this.isPlaying;
        downloadBtn.disabled = !this.hasAudioContent;
        newAudioBtn.disabled = !this.hasAudioContent; // 有音频内容时才能重新生成
        progressBar.disabled = !this.hasAudioContent;
    }

    resetAudioState() {
        // 清理之前的音频状态和资源
        this.isPlaying = false;
        this.hasAudioContent = false;
        this.currentScript = null;
        this.currentAudioBlob = null;
        
        // 停止当前播放的音频
        if (this.audioPlayer) {
            if (this.isWebSpeechMode) {
                speechSynthesis.cancel();
                this.stopTimeTracking();
            } else {
                this.audioPlayer.pause();
            }
            this.audioPlayer = null;
        }
        
        // 清理Web Speech API相关状态
        this.isWebSpeechMode = false;
        this.webSpeechText = null;
        this.webSpeechUtterance = null;
        
        // 重置UI显示
        document.getElementById('progressBar').value = 0;
        document.getElementById('currentTime').textContent = '00:00';
        document.getElementById('totalTime').textContent = '00:00';
        
        // 更新按钮状态
        this.updateUIState();
        
        // 重置处理按钮状态
        this.resetProcessButton();
        
        console.log('音频状态已重置');
    }

    resetForNewAudio() {
        // 确认用户是否要重新生成音频
        if (confirm('新しい音声を生成しますか？現在の音声は削除されます。')) {
            this.resetAudioState();
            
            // 滚动到文本输入区域
            document.getElementById('textInput').scrollIntoView({ 
                behavior: 'smooth',
                block: 'center'
            });
            
            // 聚焦到文本输入框
            document.getElementById('textInput').focus();
            
            console.log('新しい音声生成の準備が完了しました');
        }
    }

    onTextInputChange() {
        // 如果有音频内容，提示用户需要重新生成
        if (this.hasAudioContent) {
            const processBtn = document.getElementById('processBtn');
            if (processBtn.textContent === '音声を生成') {
                processBtn.textContent = '音声を再生成';
                processBtn.style.backgroundColor = '#ffc107';
                processBtn.style.borderColor = '#ffc107';
                processBtn.style.color = '#212529';
            }
        }
    }

    resetProcessButton() {
        const processBtn = document.getElementById('processBtn');
        processBtn.textContent = '音声を生成';
        processBtn.style.backgroundColor = '';
        processBtn.style.borderColor = '';
        processBtn.style.color = '';
    }

    setupProgressBarDrag() {
        const progressBar = document.getElementById('progressBar');
        let isDragging = false;

        progressBar.addEventListener('mousedown', (e) => {
            if (this.hasAudioContent) {
                isDragging = true;
                this.seekToPosition(e);
            }
        });

        document.addEventListener('mousemove', (e) => {
            if (isDragging && this.hasAudioContent) {
                this.seekToPosition(e);
            }
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
        });

        // タッチイベント対応
        progressBar.addEventListener('touchstart', (e) => {
            if (this.hasAudioContent) {
                isDragging = true;
                e.preventDefault();
                const touch = e.touches[0];
                this.seekToPosition(touch);
            }
        });

        document.addEventListener('touchmove', (e) => {
            if (isDragging && this.hasAudioContent) {
                e.preventDefault();
                const touch = e.touches[0];
                this.seekToPosition(touch);
            }
        });

        document.addEventListener('touchend', () => {
            isDragging = false;
        });
    }

    initializeFileUpload() {
        const uploadArea = document.getElementById('uploadArea');

        // ドラッグ&ドロップ
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.handleFileSelect(files[0]);
            }
        });

        // uploadArea click handler removed to prevent duplicate file dialogs
    }

    async handleFileSelect(file) {
        if (!file) return;

        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            alert('ファイルサイズが大きすぎます。5MB以下のファイルを選択してください。');
            return;
        }

        // 重置之前的音频状态
        this.resetAudioState();

        try {
            const text = await this.readFile(file);
            document.getElementById('textInput').value = text;
            console.log('ファイル読み込み完了:', file.name);
        } catch (error) {
            console.error('ファイル読み込みエラー:', error);
            alert('ファイルの読み込みに失敗しました。');
        }
    }

    readFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                resolve(e.target.result);
            };
            
            reader.onerror = () => {
                reject(new Error('ファイル読み込みエラー'));
            };
            
            reader.readAsText(file, 'UTF-8');
        });
    }

    async processText() {
        const textInput = document.getElementById('textInput');
        const text = textInput.value.trim();

        if (!text) {
            alert('処理するテキストを入力してください。');
            return;
        }

        // 重置之前的音频状态
        this.resetAudioState();

        const processBtn = document.getElementById('processBtn');
        processBtn.textContent = '処理中...';
        processBtn.disabled = true;

        try {
            // 直接从文本生成音频，不创建对话脚本
            await this.generateAudioFromText(text);
            
        } catch (error) {
            console.error('処理エラー:', error);
            alert('テキストの処理に失敗しました。');
        } finally {
            processBtn.textContent = '音声を生成';
            processBtn.disabled = false;
        }
    }

    async generateAudioFromText(text) {
        try {
            let audioBlob = null;
            
            if (this.ttsClient) {
                // 优先使用Edge-TTS生成音频
                audioBlob = await this.generateAudioWithEdgeTTS(text);
            }
            
            if (!audioBlob) {
                // 如果Edge-TTS失败，使用Web Speech API录制音频
                console.log('Edge-TTS不可用，使用Web Speech API作为备用');
                audioBlob = await this.generateAudioWithWebSpeech(text);
            }
            
            if (audioBlob) {
                this.currentAudioBlob = audioBlob;
                this.createAudioPlayer(audioBlob);
                this.hasAudioContent = true;
                this.updateUIState();
                
                // 保存到音频列表
                this.saveToAudioList(text, audioBlob);
                
                console.log('音声生成完了');
            } else {
                throw new Error('音声生成に失敗しました。ブラウザが音声合成をサポートしていません。');
            }
        } catch (error) {
            console.error('音声生成エラー:', error);
            alert('音声の生成に失敗しました: ' + error.message);
            throw error;
        }
    }

    async simulateProcessing() {
        // デモ用の遅延
        return new Promise(resolve => {
            setTimeout(resolve, 2000);
        });
    }

    async generateAudioWithEdgeTTS(text) {
        try {
            // 设置语音参数
            const options = new EdgeTTSClient.ProsodyOptions();
            options.rate = 1.0;  // 正常语速
            options.pitch = 'medium';  // 中等音调
            options.volume = 90;  // 90%音量
            
            // 生成音频流
            const audioStream = this.ttsClient.toStream(text, options);
            
            // 将流转换为Blob
            const chunks = [];
            const reader = audioStream.getReader();
            
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                chunks.push(value);
            }
            
            return new Blob(chunks, { type: 'audio/mpeg' });
        } catch (error) {
            console.error('Edge-TTS生成失败:', error);
            return null;
        }
    }

    async generateAudioWithWebSpeech(text) {
        return new Promise((resolve, reject) => {
            try {
                // 检查Web Speech API支持
                if (!('speechSynthesis' in window)) {
                    reject(new Error('このブラウザは音声合成をサポートしていません。'));
                    return;
                }

                // 创建语音合成实例
                const utterance = new SpeechSynthesisUtterance(text);
                utterance.lang = 'ja-JP';
                utterance.rate = 0.8;
                utterance.pitch = 1.0;
                utterance.volume = 1.0;
                
                let isRecording = false;
                
                utterance.onstart = () => {
                    console.log('Web Speech API开始合成');
                    isRecording = true;
                };
                
                utterance.onend = () => {
                    console.log('Web Speech API合成完成');
                    isRecording = false;
                    // 由于无法直接录制Web Speech API的输出，我们创建一个简单的解决方案
                    // 使用一个非常短的静音音频作为占位符，实际播放时会使用Web Speech API
                    this.createSimpleAudioBlob().then(blob => {
                        // 存储原始文本以便播放时使用
                        blob.originalText = text;
                        blob.isWebSpeechAudio = true;
                        resolve(blob);
                    }).catch(reject);
                };
                
                utterance.onerror = (error) => {
                    console.error('Web Speech API错误:', error);
                    reject(error);
                };
                
                // 暂时将音量设置为0.01（最小可听音量）来避免干扰
                const originalVolume = utterance.volume;
                utterance.volume = 0.01;
                
                // 开始语音合成
                speechSynthesis.speak(utterance);
                
                // 恢复音量
                setTimeout(() => {
                    utterance.volume = originalVolume;
                }, 100);
                
                // 超时保护
                setTimeout(() => {
                    if (isRecording) {
                        speechSynthesis.cancel();
                        reject(new Error('合成超时'));
                    }
                }, 30000);
                
            } catch (error) {
                console.error('Web Speech API录制失败:', error);
                reject(error);
            }
        });
    }

    async createSimpleAudioBlob() {
        try {
            // 创建一个简短的静音音频blob作为占位符
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            const audioContext = new AudioContextClass();
            const buffer = audioContext.createBuffer(1, audioContext.sampleRate * 0.1, audioContext.sampleRate);
            
            // 将buffer转换为blob
            const arrayBuffer = new ArrayBuffer(buffer.length * 2);
            const view = new DataView(arrayBuffer);
            
            for (let i = 0; i < buffer.length; i++) {
                view.setInt16(i * 2, 0, true); // 静音
            }
            
            await audioContext.close();
            return new Blob([arrayBuffer], { type: 'audio/wav' });
        } catch (error) {
            console.error('创建音频blob失败:', error);
            // 如果AudioContext不可用，返回一个简单的空blob
            return new Blob([''], { type: 'audio/wav' });
        }
    }

    createAudioPlayer(audioBlob) {
        // 创建新的Audio对象
        if (this.audioPlayer) {
            this.audioPlayer.pause();
            this.audioPlayer = null;
        }
        
        // 检查是否是Web Speech API生成的音频
        if (audioBlob.isWebSpeechAudio) {
            // 对于Web Speech API音频，我们需要特殊处理
            this.isWebSpeechMode = true;
            this.webSpeechText = audioBlob.originalText;
            // 创建一个虚拟的音频播放器
            this.createVirtualAudioPlayer();
        } else {
            // 普通的音频blob
            this.isWebSpeechMode = false;
            this.audioPlayer = new Audio(URL.createObjectURL(audioBlob));
            
            // 添加事件监听器
            this.audioPlayer.addEventListener('timeupdate', () => {
                this.updateProgress();
            });

            this.audioPlayer.addEventListener('loadedmetadata', () => {
                this.updateDuration();
            });

            this.audioPlayer.addEventListener('ended', () => {
                this.onAudioEnded();
            });
        }
    }

    createVirtualAudioPlayer() {
        // 创建一个虚拟的音频播放器用于Web Speech API
        this.audioPlayer = {
            duration: 10, // 假设10秒长度，实际会根据文本动态计算
            currentTime: 0,
            paused: true,
            ended: false,
            
            play: () => {
                if (this.webSpeechUtterance) {
                    speechSynthesis.cancel();
                }
                
                this.webSpeechUtterance = new SpeechSynthesisUtterance(this.webSpeechText);
                this.webSpeechUtterance.lang = 'ja-JP';
                this.webSpeechUtterance.rate = 0.8;
                this.webSpeechUtterance.pitch = 1.0;
                this.webSpeechUtterance.volume = 1.0;
                
                this.webSpeechUtterance.onstart = () => {
                    this.audioPlayer.paused = false;
                    this.audioPlayer.ended = false;
                    this.startTimeTracking();
                };
                
                this.webSpeechUtterance.onend = () => {
                    this.audioPlayer.paused = true;
                    this.audioPlayer.ended = true;
                    this.stopTimeTracking();
                    this.onAudioEnded();
                };
                
                this.webSpeechUtterance.onerror = () => {
                    this.audioPlayer.paused = true;
                    this.stopTimeTracking();
                };
                
                speechSynthesis.speak(this.webSpeechUtterance);
            },
            
            pause: () => {
                if (this.webSpeechUtterance) {
                    speechSynthesis.pause();
                    this.audioPlayer.paused = true;
                    this.stopTimeTracking();
                }
            },
            
            addEventListener: (event, callback) => {
                // 虚拟事件监听器
                if (!this.audioPlayerEvents) {
                    this.audioPlayerEvents = {};
                }
                if (!this.audioPlayerEvents[event]) {
                    this.audioPlayerEvents[event] = [];
                }
                this.audioPlayerEvents[event].push(callback);
            }
        };
        
        // 估算音频长度（基于文本长度和语速）
        const estimatedDuration = Math.max(3, this.webSpeechText.length * 0.1);
        this.audioPlayer.duration = estimatedDuration;
    }

    startTimeTracking() {
        this.stopTimeTracking();
        this.timeTrackingInterval = setInterval(() => {
            if (!this.audioPlayer.paused && !this.audioPlayer.ended) {
                this.audioPlayer.currentTime += 0.1;
                if (this.audioPlayer.currentTime >= this.audioPlayer.duration) {
                    this.audioPlayer.currentTime = this.audioPlayer.duration;
                    this.stopTimeTracking();
                }
                this.updateProgress();
            }
        }, 100);
    }

    stopTimeTracking() {
        if (this.timeTrackingInterval) {
            clearInterval(this.timeTrackingInterval);
            this.timeTrackingInterval = null;
        }
    }

    // 音频列表管理方法
    saveToAudioList(text, audioBlob) {
        const audioItem = {
            id: Date.now().toString(),
            text: text.substring(0, 50) + (text.length > 50 ? '...' : ''),
            fullText: text,
            timestamp: new Date().toLocaleString('ja-JP'),
            // 注意：不能直接存储audioBlob到localStorage，所以我们创建一个URL
            audioUrl: URL.createObjectURL(audioBlob),
            audioBlob: audioBlob // 保存引用用于下载
        };
        
        this.audioList.unshift(audioItem); // 添加到开头
        
        // 限制列表长度，避免内存过大
        if (this.audioList.length > 10) {
            const removedItem = this.audioList.pop();
            URL.revokeObjectURL(removedItem.audioUrl); // 清理URL
        }
        
        this.updateAudioListDisplay();
        this.saveAudioListToStorage();
    }

    loadAudioListFromStorage() {
        try {
            const stored = localStorage.getItem('audioList');
            if (stored) {
                const list = JSON.parse(stored);
                // 注意：从localStorage加载时audioBlob和audioUrl会丢失，需要重新生成
                this.audioList = list.map(item => ({
                    ...item,
                    audioUrl: null,
                    audioBlob: null
                }));
                this.updateAudioListDisplay();
            }
        } catch (error) {
            console.error('音频列表加载失败:', error);
        }
    }

    saveAudioListToStorage() {
        try {
            // 只保存基本信息，不保存blob
            const listToSave = this.audioList.map(item => ({
                id: item.id,
                text: item.text,
                fullText: item.fullText,
                timestamp: item.timestamp
            }));
            localStorage.setItem('audioList', JSON.stringify(listToSave));
        } catch (error) {
            console.error('音频列表保存失败:', error);
        }
    }

    updateAudioListDisplay() {
        const audioListContainer = document.getElementById('audioList');
        
        if (this.audioList.length === 0) {
            audioListContainer.innerHTML = '<p class="no-audio-message">まだ音声が生成されていません</p>';
            return;
        }
        
        audioListContainer.innerHTML = '';
        
        this.audioList.forEach((item, index) => {
            const audioItem = document.createElement('div');
            audioItem.className = 'audio-item';
            audioItem.innerHTML = `
                <div class="audio-item-content">
                    <div class="audio-item-text">${item.text}</div>
                    <div class="audio-item-timestamp">${item.timestamp}</div>
                </div>
                <div class="audio-item-controls">
                    <button class="play-btn" onclick="app.replayAudio(app.audioList[${index}])">▶ 再生</button>
                    <button class="delete-btn" onclick="app.deleteAudioItem('${item.id}')">🗑 削除</button>
                </div>
            `;
            audioListContainer.appendChild(audioItem);
        });
        
        console.log('音频列表更新:', this.audioList.length, '项');
    }

    async replayAudio(audioItem) {
        if (audioItem.audioBlob) {
            // 如果有audioBlob，直接播放
            this.createAudioPlayer(audioItem.audioBlob);
            this.hasAudioContent = true;
            this.updateUIState();
            this.playAudio();
        } else {
            // 重新生成音频
            try {
                await this.generateAudioFromText(audioItem.fullText);
                this.playAudio();
            } catch (error) {
                console.error('音频重新生成失败:', error);
                alert('音声の再生成に失敗しました。Edge-TTSが必要です。');
            }
        }
    }

    deleteAudioItem(itemId) {
        const index = this.audioList.findIndex(item => item.id === itemId);
        if (index !== -1) {
            const item = this.audioList[index];
            if (item.audioUrl) {
                URL.revokeObjectURL(item.audioUrl);
            }
            this.audioList.splice(index, 1);
            this.updateAudioListDisplay();
            this.saveAudioListToStorage();
        }
    }

    togglePlayPause() {
        if (!this.hasAudioContent || !this.audioPlayer) {
            console.log('音声コンテンツまたはプレイヤーがありません');
            return;
        }
        
        if (this.isPlaying) {
            this.pauseAudio();
        } else {
            this.resumeAudio();
        }
    }

    playAudio() {
        if (!this.hasAudioContent || !this.audioPlayer) {
            console.log('音声コンテンツまたはプレイヤーがありません');
            return;
        }
        
        // 从头播放，重置时间
        if (this.isWebSpeechMode) {
            this.audioPlayer.currentTime = 0;
        } else {
            this.audioPlayer.currentTime = 0;
        }
        
        this.audioPlayer.play();
        this.isPlaying = true;
        this.updateUIState();
    }

    resumeAudio() {
        if (!this.hasAudioContent || !this.audioPlayer) {
            console.log('音声コンテンツまたはプレイヤーがありません');
            return;
        }
        
        // 从当前位置继续播放
        this.audioPlayer.play();
        this.isPlaying = true;
        this.updateUIState();
    }

    pauseAudio() {
        if (this.audioPlayer) {
            if (this.isWebSpeechMode) {
                if (this.webSpeechUtterance) {
                    speechSynthesis.pause();
                    this.audioPlayer.paused = true;
                    this.stopTimeTracking();
                }
            } else {
                this.audioPlayer.pause();
            }
            this.isPlaying = false;
            this.updateUIState();
        }
    }

    stopAudio() {
        if (this.audioPlayer) {
            if (this.isWebSpeechMode) {
                if (this.webSpeechUtterance) {
                    speechSynthesis.cancel();
                    this.audioPlayer.paused = true;
                    this.audioPlayer.currentTime = 0;
                    this.stopTimeTracking();
                }
            } else {
                this.audioPlayer.pause();
                this.audioPlayer.currentTime = 0;
            }
            this.isPlaying = false;
            this.updateUIState();
        }
    }

    seekToPosition(event) {
        if (!this.audioPlayer || !this.audioPlayer.duration) {
            console.log('音声プレイヤーまたは音声データがありません');
            return;
        }
        
        const progressBar = document.getElementById('progressBar');
        const rect = progressBar.getBoundingClientRect();
        const clickX = event.clientX - rect.left;
        const barWidth = rect.width;
        const clickPercent = Math.max(0, Math.min(1, clickX / barWidth)); // 0-1の範囲にクランプ
        
        const newTime = clickPercent * this.audioPlayer.duration;
        
        if (this.isWebSpeechMode) {
            // Web Speech API不支持位置跳转，我们只能重新开始播放
            this.audioPlayer.currentTime = newTime;
            if (!this.audioPlayer.paused) {
                this.stopAudio();
                this.playAudio();
            }
        } else {
            this.audioPlayer.currentTime = newTime;
        }
        
        this.updateProgress();
    }

    updateProgress() {
        if (this.audioPlayer && this.audioPlayer.duration) {
            const progress = (this.audioPlayer.currentTime / this.audioPlayer.duration) * 100;
            document.getElementById('progressBar').value = progress;
            
            document.getElementById('currentTime').textContent = 
                this.formatTime(this.audioPlayer.currentTime);
        }
    }

    updateDuration() {
        if (this.audioPlayer && this.audioPlayer.duration) {
            document.getElementById('totalTime').textContent = 
                this.formatTime(this.audioPlayer.duration);
        }
    }

    onAudioEnded() {
        this.isPlaying = false;
        this.updateUIState();
        document.getElementById('progressBar').value = 0;
        document.getElementById('currentTime').textContent = '00:00';
    }

    formatTime(seconds) {
        if (isNaN(seconds)) return '00:00';
        
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    // 清理音频资源
    cleanupAudio() {
        if (this.currentAudioBlob) {
            URL.revokeObjectURL(this.audioPlayer.src);
            this.currentAudioBlob = null;
        }
    }

    // 下载音频文件
    downloadAudio() {
        if (this.currentAudioBlob) {
            // 如果有录制的音频Blob，直接下载
            const url = URL.createObjectURL(this.currentAudioBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `japanese-tts-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.wav`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } else {
            // 如果没有录制的音频，重新生成并下载
            this.generateAndDownloadAudio();
        }
    }

    async generateAndDownloadAudio() {
        if (!this.currentScript) {
            alert('音声データがありません。まず対話を生成してください。');
            return;
        }

        const downloadBtn = document.getElementById('downloadBtn');
        const originalText = downloadBtn.textContent;
        downloadBtn.textContent = '生成中...';
        downloadBtn.disabled = true;

        try {
            // スクリプトから音声テキストを作成
            const fullText = this.currentScript.map(entry => 
                `${entry.speaker === 'senior' ? '先輩' : '新人'}：${entry.text}`
            ).join('。');
            
            // 音声を録制
            let audioBlob = null;
            
            // 优先使用Edge-TTS生成音频
            if (this.ttsClient) {
                audioBlob = await this.generateAudioWithEdgeTTS(fullText);
                console.log('Edge-TTS音声生成完了');
            }
            
            // 如果Edge-TTS失败，回退到Web Speech API
            if (!audioBlob) {
                audioBlob = await this.recordSpeechSynthesis(fullText);
                console.log('Web Speech API音声生成完了');
            }
            
            if (audioBlob) {
                // 成功した場合、音声をダウンロード
                const url = URL.createObjectURL(audioBlob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `japanese-tts-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.${this.ttsClient ? 'mp3' : 'wav'}`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                
                console.log('音声ダウンロード完了');
            } else {
                // 音声生成失败，提供文本下载作为替代
                this.downloadScriptAsText();
            }
        } catch (error) {
            console.error('音声生成エラー:', error);
            alert('音声の生成に失敗しました。スクリプトをテキストファイルとしてダウンロードします。');
            this.downloadScriptAsText();
        } finally {
            downloadBtn.textContent = originalText;
            downloadBtn.disabled = false;
        }
    }

    downloadScriptAsText() {
        if (!this.currentScript) return;
        
        const scriptText = this.currentScript.map(entry => 
            `${entry.speaker === 'senior' ? '先輩' : '新人'}：${entry.text}`
        ).join('\n\n');
        
        const blob = new Blob([scriptText], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `japanese-tts-script-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        console.log('スクリプトダウンロード完了');
    }

    // 清理音频资源
    cleanupAudio() {
        if (this.currentAudioBlob) {
            URL.revokeObjectURL(this.audioPlayer.src);
            this.currentAudioBlob = null;
        }
        
        // 清理Edge-TTS客户端
        if (this.ttsClient) {
            try {
                this.ttsClient.close();
            } catch (error) {
                console.error('Edge-TTS客户端关闭失败:', error);
            }
        }
    }
}

// アプリケーション初期化
let app; // 全局变量，供HTML onclick使用
document.addEventListener('DOMContentLoaded', () => {
    app = new JapaneseTTSDemo();
    console.log('Japanese TTS Demo 初期化完了');
});