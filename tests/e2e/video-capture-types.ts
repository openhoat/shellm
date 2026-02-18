/**
 * Video capture result returned after stopping a recording
 */
export interface VideoCaptureResult {
  /** Base64 encoded video data */
  base64Data: string
  /** MIME type of the video (e.g., 'video/webm') */
  mimeType: string
  /** Size of the video data in bytes */
  size: number
}
