/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { useCallback, useRef } from 'react'

export function useAudioPlayer() {
  const audioCtxRef = useRef<AudioContext | null>(null)
  const nextPlayTimeRef = useRef(0)

  const initAudio = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext({ sampleRate: 24000 })
      console.log('AudioContext initialized:', audioCtxRef.current.state)
    }
    return audioCtxRef.current
  }, [])

  const ensureAudioEnabled = useCallback(async () => {
    const audioCtx = initAudio()
    if (audioCtx.state === 'suspended') {
      await audioCtx.resume()
      console.log('AudioContext resumed:', audioCtx.state)
    }
  }, [initAudio])

  const playAudio = useCallback(
    async (base64: string) => {
      try {
        const audioCtx = initAudio()

        // Ensure AudioContext is running
        if (audioCtx.state === 'suspended') {
          await audioCtx.resume()
        }

        const bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0))
        const int16 = new Int16Array(bytes.buffer)
        const float32 = new Float32Array(int16.length)

        for (let i = 0; i < int16.length; i++) {
          float32[i] = int16[i] / 32768
        }

        const buffer = audioCtx.createBuffer(1, float32.length, 24000)
        buffer.getChannelData(0).set(float32)

        const src = audioCtx.createBufferSource()
        src.buffer = buffer
        src.connect(audioCtx.destination)

        nextPlayTimeRef.current = Math.max(
          nextPlayTimeRef.current,
          audioCtx.currentTime
        )
        src.start(nextPlayTimeRef.current)
        nextPlayTimeRef.current += buffer.duration
      } catch (error) {
        console.error('Error playing audio:', error)
      }
    },
    [initAudio]
  )

  return { playAudio, ensureAudioEnabled }
}
