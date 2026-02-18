#!/bin/bash
# Script to generate a demo GIF for Termaid
# Runs the demo E2E test which captures screenshot frames,
# then assembles them into an optimized animated GIF.

set -e

echo "🎬 Generating Termaid demo GIF..."

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUTPUT_DIR="$PROJECT_ROOT/demo-output"
FRAME_DIR="$PROJECT_ROOT/test-results/demo-frames"

# Clean previous output
rm -rf "$OUTPUT_DIR"
mkdir -p "$OUTPUT_DIR"

# Check if ffmpeg is available
if ! command -v ffmpeg &> /dev/null; then
  echo "❌ ffmpeg is required to convert frames to GIF"
  echo "Install it with: sudo dnf install ffmpeg  # or apt install ffmpeg"
  exit 1
fi

# Run the demo test (captures screenshot frames at 10 fps)
echo "🧪 Running demo test (frame capture)..."
cd "$PROJECT_ROOT"
DEMO_VIDEO=1 npx playwright test tests/e2e/demo.test.ts --reporter=list --timeout=120000 || true

# Verify frames exist
FRAME_COUNT=$(find "$FRAME_DIR" -name "frame-*.png" 2>/dev/null | wc -l)
if [ "$FRAME_COUNT" -eq 0 ]; then
  echo "❌ No frames captured in $FRAME_DIR"
  exit 1
fi
echo "📸 Captured $FRAME_COUNT frames"

# Assemble frames into optimized GIF (10 fps, palette-optimized)
echo "🔄 Assembling GIF from frames..."
ffmpeg -y -framerate 10 -i "$FRAME_DIR/frame-%05d.png" \
  -vf "fps=10,scale=800:-1:flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=128[p];[s1][p]paletteuse=dither=bayer" \
  -loop 0 \
  "$OUTPUT_DIR/demo.gif" 2>/dev/null

# Also generate an optimized MP4 as fallback
echo "🔄 Generating optimized MP4..."
ffmpeg -y -framerate 10 -i "$FRAME_DIR/frame-%05d.png" \
  -c:v libx264 -preset slow -crf 22 -pix_fmt yuv420p -movflags +faststart \
  "$OUTPUT_DIR/demo.mp4" 2>/dev/null

# Copy GIF to docs
cp "$OUTPUT_DIR/demo.gif" "$PROJECT_ROOT/docs/public/demo.gif"

# Report sizes
GIF_SIZE=$(du -h "$OUTPUT_DIR/demo.gif" | cut -f1)
MP4_SIZE=$(du -h "$OUTPUT_DIR/demo.mp4" | cut -f1)
echo "✅ Demo GIF: demo-output/demo.gif ($GIF_SIZE, $FRAME_COUNT frames)"
echo "✅ Demo MP4: demo-output/demo.mp4 ($MP4_SIZE)"
echo "✅ Copied to: docs/public/demo.gif"

# Clean up test artifacts
rm -rf "$PROJECT_ROOT/test-results"

echo "🎉 Done!"
