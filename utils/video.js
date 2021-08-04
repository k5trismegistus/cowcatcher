const BUBBLE_SMALL_WIDTH = 240
const BUBBLE_SMALL_HEIGHT = 240
const BUBBLE_FS_WIDTH = 1280
const BUBBLE_FS_HEIGHT = 960
const BUBBLE_FS_OFFSET_Y = -120

export const WEBCAM_SOURCE_WIDTH_HD = 640
export const WEBCAM_SOURCE_HEIGHT_HD = 480

export const VIDEO_WIDTH_HD = 1280
export const VIDEO_HEIGHT_HD = 720

export const videoWidth = (videoMode) => {
  return VIDEO_WIDTH_HD
}

export const videoHeight = (videoMode) => {
  return VIDEO_HEIGHT_HD
}

export const webcamSourceWidth = (webcamMode) => {
  return WEBCAM_SOURCE_WIDTH_HD
}

export const webcamSourceHeight = (webcamMode) => {
  return WEBCAM_SOURCE_HEIGHT_HD
}

export const sBubbleWidth = (bubbleMode) => {
  if (bubbleMode === 'left-top' || bubbleMode === 'right-top') {
    return WEBCAM_SOURCE_HEIGHT_HD // Use height to make square
  }

  if (bubbleMode === 'fullscreen') {
    return WEBCAM_SOURCE_WIDTH_HD
  }
}

export const sBubbleHeight = (bubbleMode) => {
  if (bubbleMode === 'left-top' || bubbleMode === 'right-top') {
    return WEBCAM_SOURCE_HEIGHT_HD
  }

  if (bubbleMode === 'fullscreen') {
    return WEBCAM_SOURCE_HEIGHT_HD
  }
}

export const sBubbleOffsetX = (bubbleMode) => {
  if (bubbleMode === 'left-top' || bubbleMode === 'right-top') {
    return (WEBCAM_SOURCE_WIDTH_HD - WEBCAM_SOURCE_HEIGHT_HD) / 2
  }

  if (bubbleMode === 'fullscreen') {
    return 0
  }
}

export const sBubbleOffsetY = (bubbleMode) => {
  if (bubbleMode === 'left-top' || bubbleMode === 'right-top') {
    return 0
  }

  if (bubbleMode === 'fullscreen') {
    return (WEBCAM_SOURCE_HEIGHT_HD - (WEBCAM_SOURCE_WIDTH_HD * 9 / 16)) / 2
  }
}

export const dBubbleWidth = (bubbleMode) => {
  if (bubbleMode === 'left-top' || bubbleMode === 'right-top') {
    return BUBBLE_SMALL_WIDTH
  }

  if (bubbleMode === 'fullscreen') {
    return BUBBLE_FS_WIDTH
  }
}

export const dBubbleHeight = (bubbleMode) => {
  if (bubbleMode === 'left-top' || bubbleMode === 'right-top') {
    return BUBBLE_SMALL_HEIGHT
  }

  if (bubbleMode === 'fullscreen') {
    return BUBBLE_FS_HEIGHT
  }
}

export const dBubbleOffsetX = (bubbleMode) => {
  if (bubbleMode === 'left-top' || bubbleMode === 'fullscreen') {
    return 0
  }

  if (bubbleMode === 'right-top') {
    return VIDEO_WIDTH_HD - dBubbleWidth(bubbleMode)
  }
}

export const dBubbleOffsetY = (bubbleMode) => {
  if (bubbleMode === 'left-top' || bubbleMode === 'right-top') {
    return 0
  }

  if (bubbleMode === 'fullscreen') {
    return BUBBLE_FS_OFFSET_Y
  }
}

export const bubbleConfig = (bubbleMode) => {
  return {
    mode: bubbleMode,
    webcamSource: { width: webcamSourceWidth(), height: webcamSourceHeight() },
    source: { width: sBubbleWidth(bubbleMode), height: sBubbleHeight(bubbleMode), offsetX: sBubbleOffsetX(bubbleMode), offsetY: sBubbleOffsetY(bubbleMode) },
    dest: { width: dBubbleWidth(bubbleMode), height: dBubbleHeight(bubbleMode), offsetX: dBubbleOffsetX(bubbleMode), offsetY: dBubbleOffsetY(bubbleMode) },
  }
}