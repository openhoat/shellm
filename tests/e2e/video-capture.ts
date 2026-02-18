import type { Page } from '@playwright/test'
import type { VideoCaptureResult } from './video-capture-types'

/**
 * Start video capture using getDisplayMedia API
 * This captures the current tab/window for demo video generation
 */
export async function startVideoCapture(page: Page): Promise<void> {
  await page.evaluate(async () => {
    // Check supported MIME type
    const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
      ? 'video/webm;codecs=vp9'
      : MediaRecorder.isTypeSupported('video/webm')
        ? 'video/webm'
        : 'video/mp4'

    // Get display media stream - prefer current tab
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: {
        width: { ideal: 1600 },
        height: { ideal: 900 },
        frameRate: { ideal: 30 },
      },
      audio: false,
      // @ts-expect-error - preferCurrentTab is a newer API
      preferCurrentTab: true,
    } as MediaStreamConstraints)

    // Create MediaRecorder with supported mime type
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType,
      videoBitsPerSecond: 2500000,
    })

    // Store chunks
    const chunks: Blob[] = []
    mediaRecorder.ondataavailable = event => {
      if (event.data.size > 0) {
        chunks.push(event.data)
      }
    }

    // Handle stream end (user stops sharing)
    stream.getVideoTracks()[0].onended = () => {
      if (mediaRecorder.state === 'recording') {
        mediaRecorder.stop()
      }
    }

    // Store recorder and chunks in window for later access
    // @ts-expect-error - storing in window for access in stopVideoCapture
    window.__videoRecorder = mediaRecorder
    // @ts-expect-error - storing in window for access in stopVideoCapture
    window.__videoChunks = chunks
    // @ts-expect-error - storing in window for access in stopVideoCapture
    window.__videoStream = stream

    // Start recording
    mediaRecorder.start(100) // Collect data every 100ms
  })
}

/**
 * Stop video capture and return the video data
 */
export async function stopVideoCapture(page: Page): Promise<VideoCaptureResult> {
  return page.evaluate(async () => {
    // @ts-expect-error - accessing stored recorder
    const mediaRecorder = window.__videoRecorder as MediaRecorder
    // @ts-expect-error - accessing stored stream
    const stream = window.__videoStream as MediaStream
    // @ts-expect-error - accessing stored chunks
    const chunks = window.__videoChunks as Blob[]

    if (!mediaRecorder || !stream || !chunks) {
      throw new Error('Video capture was not started')
    }

    // Stop recording with proper handler setup
    return new Promise<VideoCaptureResult>((resolve, reject) => {
      // Set handlers BEFORE calling stop()
      mediaRecorder.onstop = async () => {
        // Stop all tracks
        for (const track of stream.getTracks()) {
          track.stop()
        }

        // Create blob from chunks
        const blob = new Blob(chunks, { type: 'video/webm' })

        // Convert to base64 using FileReader for better memory handling
        const reader = new FileReader()
        reader.onloadend = () => {
          const base64 = reader.result as string
          const base64Data = base64.split(',')[1] // Remove data URL prefix

          // Cleanup
          // @ts-expect-error - cleanup
          window.__videoRecorder = undefined
          // @ts-expect-error - cleanup
          window.__videoStream = undefined
          // @ts-expect-error - cleanup
          window.__videoChunks = undefined

          resolve({
            base64Data,
            mimeType: 'video/webm',
            size: blob.size,
          })
        }
        reader.onerror = () => reject(new Error('Failed to read blob'))
        reader.readAsDataURL(blob)
      }

      mediaRecorder.onerror = event => {
        const errorEvent = event as ErrorEvent & { error?: Error }
        reject(new Error(`MediaRecorder error: ${errorEvent.error?.message || 'unknown error'}`))
      }

      // Stop the recorder
      mediaRecorder.stop()
    })
  })
}

/**
 * Save video data to a file via Node.js
 */
export async function saveVideoToFile(
  page: Page,
  videoData: VideoCaptureResult,
  outputPath: string
): Promise<void> {
  await page.evaluate(
    async ({ base64Data, outputPath }: { base64Data: string; outputPath: string }) => {
      // @ts-expect-error - Electron's fs is available via preload or require
      const fs = window.require('fs')
      const buffer = Buffer.from(base64Data, 'base64')
      fs.writeFileSync(outputPath, buffer)
    },
    { base64Data: videoData.base64Data, outputPath }
  )
}
