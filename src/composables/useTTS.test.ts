import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useTTS } from './useTTS'

// Mock SpeechSynthesisUtterance
class MockSpeechSynthesisUtterance {
  text: string
  lang: string = 'ja-JP'
  rate: number = 0.8
  pitch: number = 1.0
  volume: number = 1.0
  voice: any = null

  constructor(text: string) {
    this.text = text
  }
}

// Mock speechSynthesis
const mockSpeechSynthesis = {
  getVoices: vi.fn(() => [
    { name: 'Japanese Voice', lang: 'ja-JP' },
    { name: 'English Voice', lang: 'en-US' }
  ]),
  addEventListener: vi.fn(),
  cancel: vi.fn(),
  pause: vi.fn(),
  resume: vi.fn(),
  speak: vi.fn()
}

Object.defineProperty(window, 'speechSynthesis', {
  value: mockSpeechSynthesis,
  writable: true
})

Object.defineProperty(window, 'SpeechSynthesisUtterance', {
  value: MockSpeechSynthesisUtterance,
  writable: true
})

describe('useTTS', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset speechSynthesis mock
    Object.defineProperty(window, 'speechSynthesis', {
      value: mockSpeechSynthesis,
      writable: true
    })
    Object.defineProperty(window, 'SpeechSynthesisUtterance', {
      value: MockSpeechSynthesisUtterance,
      writable: true
    })
  })

  it('should generate audio with text', async () => {
    const { generateAudio } = useTTS()
    
    const result = await generateAudio('こんにちは')
    
    expect(result).toEqual({
      blob: null,
      isWebSpeech: true,
      text: 'こんにちは',
      duration: expect.any(Number)
    })
  })

  it('should estimate duration based on text length', async () => {
    const { generateAudio } = useTTS()
    
    const shortText = await generateAudio('短い')
    const longText = await generateAudio('これは長いテキストです。時間がかかります。')
    
    expect(longText.duration).toBeGreaterThan(shortText.duration)
  })

  it('should create controlled speech utterance', () => {
    const { createControlledSpeech } = useTTS()
    
    const utterance = createControlledSpeech('テスト')
    
    expect(utterance.text).toBe('テスト')
    expect(utterance.lang).toBe('ja-JP')
    expect(utterance.rate).toBe(0.8)
    expect(utterance.pitch).toBe(1.0)
    expect(utterance.volume).toBe(1.0)
  })

  it('should handle speech synthesis not supported', () => {
    // Mock speechSynthesis as undefined
    Object.defineProperty(window, 'speechSynthesis', {
      value: undefined,
      writable: true
    })

    // Mock SpeechSynthesisUtterance as undefined
    Object.defineProperty(window, 'SpeechSynthesisUtterance', {
      value: undefined,
      writable: true
    })

    expect(() => {
      const { createControlledSpeech } = useTTS()
      createControlledSpeech('テスト')
    }).toThrow(/ブラウザが音声合成をサポートしていません|SpeechSynthesisUtterance is not a constructor/)
  })

  it('should set isGenerating during audio generation', async () => {
    const { generateAudio, isGenerating } = useTTS()
    
    expect(isGenerating.value).toBe(false)
    
    const promise = generateAudio('テスト')
    
    await promise
    
    expect(isGenerating.value).toBe(false)
  })
})