#!/bin/bash
# Script to generate a demo video for Termaid
# Uses ffmpeg screen recording while the app runs visibly

set -e

echo "🎬 Generating Termaid demo video..."

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUTPUT_DIR="$PROJECT_ROOT/demo-output"
VIDEO_RAW="$OUTPUT_DIR/demo-raw.mp4"

# Clean previous output
rm -rf "$OUTPUT_DIR"
mkdir -p "$OUTPUT_DIR"

# Check if ffmpeg is available
if ! command -v ffmpeg &> /dev/null; then
  echo "❌ ffmpeg is required to record the demo video"
  echo "Install it with: sudo dnf install ffmpeg  # or apt install ffmpeg"
  exit 1
fi

# Find the display to use
DISPLAY_NUM="${DISPLAY:-:0}"
echo "📺 Using display: $DISPLAY_NUM"

# Start screen recording in background
# Record at 1600x900 to match the test viewport
echo "🎥 Starting screen recording..."
ffmpeg -y -f x11grab -video_size 1600x900 -i "$DISPLAY_NUM" -c:v libx264 -preset ultrafast -crf 28 -pix_fmt yuv420p "$VIDEO_RAW" 2>/dev/null &
FFMPEG_PID=$!

# Wait for ffmpeg to initialize
sleep 2

# Run the demo test with DEMO_VIDEO=1 to show the window (not minimized)
echo "🧪 Running demo test..."
cd "$PROJECT_ROOT"
DEMO_VIDEO=1 npx playwright test tests/e2e/demo.test.ts --reporter=list

# Wait a moment before stopping recording
sleep 1

# Stop recording
echo "🛑 Stopping recording..."
kill -INT $FFMPEG_PID 2>/dev/null || true
wait $FFMPEG_PID 2>/dev/null || true

# Check if video was created
if [ -f "$VIDEO_RAW" ]; then
  # Get video duration
  DURATION=$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$VIDEO_RAW" 2>/dev/null || echo "0")
  echo "📹 Raw video duration: ${DURATION}s"

  # Re-encode for better quality and smaller file size
  FINAL_VIDEO="$OUTPUT_DIR/demo.mp4"
  echo "🔄 Optimizing video..."
  ffmpeg -y -i "$VIDEO_RAW" -c:v libx264 -preset slow -crf 22 -pix_fmt yuv420p -movflags +faststart "$FINAL_VIDEO" 2>/dev/null

  # Copy to docs
  cp "$FINAL_VIDEO" "$PROJECT_ROOT/docs/public/demo.mp4"

  # Get final file size
  FILE_SIZE=$(du -h "$FINAL_VIDEO" | cut -f1)
  echo "✅ Demo video generated: $FINAL_VIDEO ($FILE_SIZE)"
  echo "✅ Demo video copied to: docs/public/demo.mp4"
else
  echo "❌ Failed to generate demo video"
  exit 1
fi

# Clean up test-results
rm -rf "$PROJECT_ROOT/test-results"

echo "🎉 Done!"
