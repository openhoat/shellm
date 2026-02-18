import type { Page } from '@playwright/test'
import type { VideoCaptureResult } from './video-capture-types'

/**
 * Start video capture using Electron's desktopCapturer API
 * This captures the app window directly, independent of screen position
 */
export async function startVideoCapture(page: Page): Promise<void> {
  await page.evaluate(async () => {
    // @ts-expect-error - Electron's desktopCapturer is available in renderer
    const { desktopCapturer } = window.require('electron')

    // Get the current window ID
    const sources = await desktopCapturer.getSources({ types: ['window'] })

    // Find our app window (usually the first one or match by name)
    const appSource =
      sources.find(
        (source: { name: string }) =>
          source.name.includes('Termaid') || source.name.includes('Electron')
      ) || sources[0]

    if (!appSource) {
      throw new Error('Could not find app window for video capture')
    }

    // Get the MediaStream from the desktop capturer
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        // @ts-expect-error - mandatory for desktop capture
        mandatory: {
          chromeMediaSource: 'desktop',
          chromeMediaSourceId: appSource.id,
        },
      },
    })

    // Create MediaRecorder
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: 'video/webm;codecs=vp9',
      videoBitsPerSecond: 2500000,
    })

    // Store chunks
    const chunks: Blob[] = []
    mediaRecorder.ondataavailable = event => {
      if (event.data.size > 0) {
        chunks.push(event.data)
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

    // Stop recording
    return new Promise<VideoCaptureResult>(resolve => {
      mediaRecorder.onstop = async () => {
        // Stop all tracks
        for (const track of stream.getTracks()) {
          track.stop()
        }

        // Create blob from chunks
        const blob = new Blob(chunks, { type: 'video/webm' })

        // Convert to base64 for transfer
        const arrayBuffer = await blob.arrayBuffer()
        const base64 = btoa(
          new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
        )

        // Cleanup
        // @ts-expect-error - cleanup
        window.__videoRecorder = undefined
        // @ts-expect-error - cleanup
        window.__videoStream = undefined
        // @ts-expect-error - cleanup
        window.__videoChunks = undefined

        resolve({
          base64Data: base64,
          mimeType: 'video/webm',
          size: blob.size,
        })
      }

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
