import { ref, Ref } from 'vue'

interface AudioResult {
  blob: Blob | null
  isWebSpeech: boolean
  text: string
  duration: number
}

export function useTTS() {
  const isGenerating: Ref<boolean> = ref(false)

  const generateAudio = async (text: string): Promise<AudioResult> => {
    isGenerating.value = true

    try {
      // 使用Web Speech API，但不直接播放
      return await generateWithWebSpeech(text)
    } catch (error) {
      console.error('TTS generation failed:', error)
      throw new Error('音声生成に失敗しました')
    } finally {
      isGenerating.value = false
    }
  }

  const generateWithWebSpeech = (text: string): Promise<AudioResult> => {
    return new Promise((resolve, reject) => {
      if (!('speechSynthesis' in window)) {
        reject(new Error('ブラウザが音声合成をサポートしていません'))
        return
      }

      // 立即返回数据，不进行播放
      resolve({
        blob: null,
        isWebSpeech: true,
        text: text,
        duration: estimateDuration(text),
      })
    })
  }

  const estimateDuration = (text: string): number => {
    // 基于文本长度估算音频时长（日语平均语速）
    const charactersPerSecond = 8
    return Math.max(2, text.length / charactersPerSecond)
  }

  // 创建可控制的语音合成函数
  const createControlledSpeech = (text: string): SpeechSynthesisUtterance => {
    if (!('speechSynthesis' in window)) {
      throw new Error('ブラウザが音声合成をサポートしていません')
    }

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'ja-JP'
    utterance.rate = 0.8
    utterance.pitch = 1.0
    utterance.volume = 1.0

    // 设置日语语音
    const setJapaneseVoice = () => {
      const voices = speechSynthesis.getVoices()
      const japaneseVoice = voices.find(
        (voice) => voice.lang.includes('ja') || voice.lang.includes('JP')
      )
      if (japaneseVoice) {
        utterance.voice = japaneseVoice
      }
    }

    // 如果语音列表还没加载，等待加载
    if (speechSynthesis.getVoices().length === 0) {
      speechSynthesis.addEventListener('voiceschanged', setJapaneseVoice, { once: true })
    } else {
      setJapaneseVoice()
    }

    return utterance
  }

  return {
    generateAudio,
    isGenerating,
    createControlledSpeech,
  }
}
