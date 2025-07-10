import { ref } from 'vue'

export function useTTS() {
  const isGenerating = ref(false)

  const generateAudio = async (text) => {
    isGenerating.value = true
    
    try {
      // 使用Web Speech API作为备用方案
      return await generateWithWebSpeech(text)
    } catch (error) {
      console.error('TTS generation failed:', error)
      throw new Error('音声生成に失敗しました')
    } finally {
      isGenerating.value = false
    }
  }

  const generateWithWebSpeech = (text) => {
    return new Promise((resolve, reject) => {
      if (!('speechSynthesis' in window)) {
        reject(new Error('ブラウザが音声合成をサポートしていません'))
        return
      }

      // 创建语音合成
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'ja-JP'
      utterance.rate = 0.8
      utterance.pitch = 1.0
      utterance.volume = 1.0

      // 尝试选择日语语音
      const voices = speechSynthesis.getVoices()
      const japaneseVoice = voices.find(voice => 
        voice.lang.includes('ja') || voice.lang.includes('JP')
      )
      if (japaneseVoice) {
        utterance.voice = japaneseVoice
      }

      let resolved = false

      utterance.onstart = () => {
        console.log('Speech synthesis started')
      }

      utterance.onend = () => {
        if (!resolved) {
          resolved = true
          // 创建虚拟音频数据
          resolve({
            blob: null,
            isWebSpeech: true,
            text: text,
            duration: estimateDuration(text),
            utterance: utterance
          })
        }
      }

      utterance.onerror = (error) => {
        if (!resolved) {
          resolved = true
          reject(new Error('音声合成エラー: ' + error.error))
        }
      }

      // 确保语音列表已加载
      if (speechSynthesis.getVoices().length === 0) {
        speechSynthesis.addEventListener('voiceschanged', () => {
          const voices = speechSynthesis.getVoices()
          const japaneseVoice = voices.find(voice => 
            voice.lang.includes('ja') || voice.lang.includes('JP')
          )
          if (japaneseVoice) {
            utterance.voice = japaneseVoice
          }
          speechSynthesis.speak(utterance)
        }, { once: true })
      } else {
        speechSynthesis.speak(utterance)
      }

      // 超时保护
      setTimeout(() => {
        if (!resolved) {
          resolved = true
          speechSynthesis.cancel()
          reject(new Error('音声生成がタイムアウトしました'))
        }
      }, 30000)
    })
  }

  const estimateDuration = (text) => {
    // 基于文本长度估算音频时长（日语平均语速）
    const charactersPerSecond = 8
    return Math.max(2, text.length / charactersPerSecond)
  }

  return {
    generateAudio,
    isGenerating
  }
}