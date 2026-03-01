import type { Page } from '@playwright/test'

/**
 * Start video recording using getDisplayMedia API
 * This captures the current tab/window for demo video generation
 * Returns a promise that resolves when recording starts
 */
export async function startVideoRecording(page: Page): Promise<void> {
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

    const chunks: Blob[] = []

    mediaRecorder.ondataavailable = (event: BlobEvent) => {
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

    // Store in window for later access
    // @ts-expect-error - storing state in window
    window.__videoRecording = { mediaRecorder, chunks, stream }

    // Start recording with 100ms chunks
    mediaRecorder.start(100)
  })
}

/**
 * Stop video recording and return video data as base64 string
 * The caller is responsible for saving the file
 */
export async function stopVideoRecording(page: Page): Promise<string> {
  const base64Video = await page.evaluate(async () => {
    // @ts-expect-error - accessing stored state
    const recording = window.__videoRecording
    if (!recording || !recording.mediaRecorder) {
      throw new Error('No active video recording')
    }

    return new Promise<string>((resolve, reject) => {
      const { mediaRecorder, chunks, stream } = recording

      // Set up handlers BEFORE calling stop()
      mediaRecorder.onstop = () => {
        // Stop all tracks to release the stream
        for (const track of stream.getTracks()) {
          track.stop()
        }

        // Create blob from chunks and convert to base64
        const blob = new Blob(chunks, { type: 'video/webm' })
        const reader = new FileReader()
        reader.onloadend = () => {
          const base64 = reader.result as string
          // Remove data URL prefix
          const base64Data = base64.split(',')[1]
          resolve(base64Data)
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

  return base64Video
}
