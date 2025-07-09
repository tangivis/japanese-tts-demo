// 日本語技術文書対話学習 - JavaScript

class JapaneseTTSDemo {
    constructor() {
        this.audioPlayer = document.getElementById('audioPlayer');
        this.currentScript = null;
        this.isPlaying = false;
        
        this.initializeEventListeners();
        this.initializeFileUpload();
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

        // プレイヤーコントロール
        document.getElementById('playBtn').addEventListener('click', () => {
            this.playAudio();
        });

        document.getElementById('pauseBtn').addEventListener('click', () => {
            this.pauseAudio();
        });

        document.getElementById('stopBtn').addEventListener('click', () => {
            this.stopAudio();
        });

        document.getElementById('showScriptBtn').addEventListener('click', () => {
            this.toggleScript();
        });

        // オーディオイベント
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

        uploadArea.addEventListener('click', () => {
            document.getElementById('fileInput').click();
        });
    }

    async handleFileSelect(file) {
        if (!file) return;

        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            alert('ファイルサイズが大きすぎます。5MB以下のファイルを選択してください。');
            return;
        }

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

        const processBtn = document.getElementById('processBtn');
        processBtn.textContent = '処理中...';
        processBtn.disabled = true;

        try {
            // デモ用のモック処理
            await this.simulateProcessing();
            
            // デモ用の対話スクリプト生成
            const dialogueScript = this.generateMockDialogue(text);
            
            // プレイヤーセクションを表示
            this.showPlayerSection(dialogueScript);
            
        } catch (error) {
            console.error('処理エラー:', error);
            alert('テキストの処理に失敗しました。');
        } finally {
            processBtn.textContent = '対話を生成';
            processBtn.disabled = false;
        }
    }

    async simulateProcessing() {
        // デモ用の遅延
        return new Promise(resolve => {
            setTimeout(resolve, 2000);
        });
    }

    generateMockDialogue(originalText) {
        // デモ用のダイアログ生成
        const dialogue = [
            {
                speaker: 'senior',
                text: `今日は、「${originalText.substring(0, 20)}...」について説明しますね。`
            },
            {
                speaker: 'junior', 
                text: 'はい、よろしくお願いします。この技術について詳しく教えてください。'
            },
            {
                speaker: 'senior',
                text: 'まず基本的な概念から始めましょう。この技術の核となる部分は...'
            },
            {
                speaker: 'junior',
                text: 'なるほど、とても興味深いですね。実際の実装ではどのような点に注意すべきでしょうか？'
            },
            {
                speaker: 'senior',
                text: '良い質問ですね。実装時の重要なポイントは次の通りです...'
            }
        ];

        return dialogue;
    }

    showPlayerSection(dialogueScript) {
        this.currentScript = dialogueScript;
        
        // プレイヤーセクションを表示
        document.getElementById('playerSection').style.display = 'block';
        
        // スクリプト内容を更新
        this.updateScriptDisplay();
        
        // デモ用音声ファイル（実際には生成されたTTSファイル）
        // 今はデモ用のダミー音声URLを設定
        this.loadDemoAudio();
        
        // プレイヤーセクションにスクロール
        document.getElementById('playerSection').scrollIntoView({ 
            behavior: 'smooth' 
        });
    }

    loadDemoAudio() {
        // デモ用: Web Speech API を使用してテスト音声を生成
        if ('speechSynthesis' in window) {
            this.generateTestAudio();
        } else {
            // フォールバック: サイレント音声
            console.log('音声合成がサポートされていません');
        }
    }

    generateTestAudio() {
        // Web Speech API でテスト音声を生成
        const utterance = new SpeechSynthesisUtterance(
            'これはデモ用の音声です。実際のシステムでは、高品質な日本語音声が生成されます。'
        );
        
        utterance.lang = 'ja-JP';
        utterance.rate = 0.9;
        utterance.pitch = 1.0;
        
        // 音声データの代わりにプレイヤーを有効化
        setTimeout(() => {
            console.log('デモ音声準備完了');
        }, 1000);
    }

    updateScriptDisplay() {
        const scriptContent = document.getElementById('scriptContent');
        scriptContent.innerHTML = '';

        if (!this.currentScript) return;

        this.currentScript.forEach((entry, index) => {
            const dialogueDiv = document.createElement('div');
            dialogueDiv.className = 'dialogue-entry';
            
            const speakerDiv = document.createElement('div');
            speakerDiv.className = `speaker ${entry.speaker}`;
            speakerDiv.textContent = entry.speaker === 'senior' ? '先輩：' : '新人：';
            
            const textDiv = document.createElement('div');
            textDiv.className = 'text';
            textDiv.textContent = entry.text;
            
            dialogueDiv.appendChild(speakerDiv);
            dialogueDiv.appendChild(textDiv);
            scriptContent.appendChild(dialogueDiv);
        });
    }

    playAudio() {
        if ('speechSynthesis' in window) {
            // Web Speech API でデモ再生
            const text = this.currentScript 
                ? this.currentScript.map(entry => `${entry.speaker === 'senior' ? '先輩' : '新人'}：${entry.text}`).join('。')
                : 'テスト音声です。';
                
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'ja-JP';
            utterance.rate = 0.8;
            
            speechSynthesis.speak(utterance);
            this.isPlaying = true;
            
            utterance.onend = () => {
                this.onAudioEnded();
            };
        } else {
            console.log('音声再生がサポートされていません');
        }
    }

    pauseAudio() {
        if ('speechSynthesis' in window) {
            speechSynthesis.pause();
            this.isPlaying = false;
        }
    }

    stopAudio() {
        if ('speechSynthesis' in window) {
            speechSynthesis.cancel();
            this.isPlaying = false;
        }
    }

    toggleScript() {
        const scriptSection = document.getElementById('scriptSection');
        const isVisible = scriptSection.style.display !== 'none';
        
        scriptSection.style.display = isVisible ? 'none' : 'block';
        
        if (!isVisible) {
            scriptSection.scrollIntoView({ behavior: 'smooth' });
        }
    }

    updateProgress() {
        if (this.audioPlayer.duration) {
            const progress = (this.audioPlayer.currentTime / this.audioPlayer.duration) * 100;
            document.getElementById('progressBar').value = progress;
            
            document.getElementById('currentTime').textContent = 
                this.formatTime(this.audioPlayer.currentTime);
        }
    }

    updateDuration() {
        document.getElementById('totalTime').textContent = 
            this.formatTime(this.audioPlayer.duration);
    }

    onAudioEnded() {
        this.isPlaying = false;
        document.getElementById('progressBar').value = 0;
        document.getElementById('currentTime').textContent = '00:00';
    }

    formatTime(seconds) {
        if (isNaN(seconds)) return '00:00';
        
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
}

// アプリケーション初期化
document.addEventListener('DOMContentLoaded', () => {
    new JapaneseTTSDemo();
    console.log('Japanese TTS Demo 初期化完了');
});