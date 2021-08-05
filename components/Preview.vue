<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" align="center">
        <nuxt-link :to="{ name: 'index' }">
          <v-img
            class="link"
            contain
            max-width="120"
            src="/logo_transparent.png"
          ></v-img>
        </nuxt-link>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <div
          class="previewZoneContainer"
          ref="previewZoneContainer"
          :style="`height: ${containerHeight}px; transform: scale(${scaleCanvas}); transform-origin: 0 0`"
        >
          <canvas
            :width='`${videoConfig.width}`'
            :height='`${videoConfig.height}`'
            ref="previewZone"
            class="canvas"
          ></canvas>
          <canvas
            :width='`${videoConfig.width}`'
            :height='`${videoConfig.height}`'
            ref="bubbleZone"
            class="canvas"
          ></canvas>
          <canvas
            :width='`${videoConfig.width}`'
            :height='`${videoConfig.height}`'
            ref="mergedZone"
            class="canvas"
            v-show="false"
          ></canvas>
        </div>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-row>
          <v-col>
            <p>Slide control</p>
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <v-btn
              @click="pageBack"
              :disabled="!showBackBtn"
            >Back</v-btn>
          </v-col>
          <v-col>
            <v-btn
              @click="pageForward"
              :disabled="!showForwardBtn"
            >Forward</v-btn>
          </v-col>
        </v-row>
      </v-col>
      <v-col>
        <v-row>
          <v-col>
            <p>Video control</p>
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <v-btn
              @click="setBubbleMode('left-top')"
            >Left top</v-btn>
          </v-col>
          <v-col>
            <v-btn
              @click="setBubbleMode('right-top')"
            >Right top</v-btn>
          </v-col>
          <v-col>
            <v-btn
              @click="setBubbleMode('fullscreen')"
            >Fullscreen</v-btn>
          </v-col>
        </v-row>
      </v-col>
    </v-row>

    <v-row>
      <v-col>
        <p>Recording control</p>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-btn
          @click="startRecord"
          v-if="recState === 'ready'"
        >Record</v-btn>
        <v-btn
          @click="finishRecord"
          v-if="recState === 'recording'"
        >Finish</v-btn>
        <v-btn
          @click="downloadVideo"
          v-if="recState === 'downloadPreparing'"
          disabled
        >Waiting...</v-btn>
        <v-btn
          @click="downloadVideo"
          v-if="recState === 'downloadable'"
        >Download Video</v-btn>
      </v-col>
    </v-row>

    <video width='300px' height='200px' class="preview" ref="bubble" muted v-show="false"></video>

  </v-container>

</template>
<script>
import { loadPdf, downloadFile } from '~/utils'
import {
  videoWidth, videoHeight, webcamSourceWidth, webcamSourceHeight,
  sBubbleWidth, sBubbleHeight, sBubbleOffsetX, sBubbleOffsetY,
  dBubbleWidth, dBubbleHeight, dBubbleOffsetX, dBubbleOffsetY,
  bubbleConfig,
} from '~/utils/video.js'

export default {
  props: ['slidePdfFile'],
  data() {
    const videoMode = 'hd' // Currently, only 'hd' is supported.
    const bubbleMode = 'left-top'

    return {
      recState: 'ready',
      pdf: null,
      currentPageNum: 1,
      renderingTask: null,
      scaleCanvas: 1,
      videoConfig: { mode: videoMode, width: videoWidth(videoMode), height: videoHeight(videoMode) },
      bubbleConfig: bubbleConfig(bubbleMode),
      bubbleMode: 'left-top',
      recorder: null,
      recordedVideoUrl: '',
      intervals: [],
      timeouts: [],
      streams: [],
    }
  },
  async mounted() {
    this.pdf = await loadPdf(this.slidePdfFile)
    this.renderPage()
    this.handleResize()
    window.addEventListener('resize', this.handleResize)

    const webcamStream = await this.initBubble()
    const mergedStream = this.$refs.mergedZone.captureStream()

    const recordStream = new MediaStream()

    const tracks = [
      mergedStream.getVideoTracks()[0],
      webcamStream.getAudioTracks()[0],
    ]
    tracks.forEach((t) => recordStream.addTrack(t))

    this.recorder = new MediaRecorder(recordStream)
    this.recorder.ondataavailable = (e) => {
      this.recState = 'downloadable'
      this.recordedVideoUrl = window.URL.createObjectURL(e.data)
    }

    const rendermergedInterval = setInterval(() => {
      this.rendermerged()
    }, 1000/30)
    this.intervals.push(rendermergedInterval)

    const strms = [webcamStream, mergedStream, recordStream]
    strms.forEach((strm) => this.streams.push(strm))
  },
  beforeDestroy: function () {
    window.removeEventListener('resize', this.handleResize)

    this.intervals.forEach((i) => { clearInterval(i) })
    this.streams.forEach((strm) => {
      strm.getTracks().forEach((track) => {
        if (track.readyState == 'live') {
            track.stop()
        }
      })
    })
  },
  computed: {
    containerHeight() {
      return this.videoConfig.height * this.scaleCanvas
    },
    totalPage() {
      if (!this.pdf) {
        return 0
      }
      return this.pdf.numPages
    },
    showBackBtn() {
      return this.currentPageNum > 1
    },
    showForwardBtn() {
      return this.currentPageNum < this.totalPage
    },
  },
  methods: {
    handleResize (event) {
      if (this.$refs.previewZoneContainer) {
        const displayWidth = this.$refs.previewZoneContainer.clientWidth
        this.scaleCanvas = displayWidth / this.videoConfig.width
      }
    },
    async initBubble() {
      const webcamStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: this.bubbleConfig.webcamSource.width,
          height: this.bubbleConfig.webcamSource.height,
          facingMode: "user"
        },
        audio: true,
      })

      const preview = this.$refs.bubble
      preview.srcObject = webcamStream
      preview.play()

      const renderBubbleInterval = setInterval(() => {
        this.renderBubble()
      }, 1000/30)
      this.intervals.push(renderBubbleInterval)

      return webcamStream
    },
    setBubbleMode(mode) {
      this.bubbleConfig = bubbleConfig(mode)

      this.clearBubble()
      this.renderPage()
    },
    clearBubble() {
      const canvas = this.$refs.bubbleZone
      const context = canvas.getContext('2d')
      context.clearRect(0, 0, this.videoConfig.width, this.videoConfig.height)
    },
    clearPreview() {
      const canvas = this.$refs.previewZone
      const context = canvas.getContext('2d')
      context.clearRect(0, 0, this.videoConfig.width, this.videoConfig.height)
    },
    async rendermerged() {
      const preview = this.$refs.previewZone
      const bubble = this.$refs.bubbleZone

      const canvas = this.$refs.mergedZone
      const context = canvas.getContext('2d')
      context.drawImage(preview, 0, 0)
      context.drawImage(bubble, 0, 0)
    },
    async renderBubble() {
      const bubble = this.$refs.bubble
      const canvas = this.$refs.bubbleZone
      const context = canvas.getContext('2d')

      const source = this.bubbleConfig.source
      const dest = this.bubbleConfig.dest

      context.drawImage(bubble, source.offsetX, source.offsetY, source.width, source.height, dest.offsetX, dest.offsetY, dest.width, dest.height)

    },
    async renderPage() {
      if (this.renderingTask) {
        await this.renderingTask.cancel()
        this.renderingTask = null
      }

      const page = await this.pdf.getPage(this.currentPageNum)
      const canvas = this.$refs.previewZone
      const viewport = page.getViewport({ scale: 1 })
      const scale = Math.min(
        this.videoConfig.width / viewport.width,
        this.videoConfig.height / viewport.height
      )
      const scaledViewport = page.getViewport({ scale: scale })
      const offsetX = (this.videoConfig.width - scaledViewport.width) / 2
      const offsetY = (this.videoConfig.height - scaledViewport.height) / 2

      const vp = page.getViewport({
        scale: scale,
        offsetX: offsetX,
        offsetY: offsetY,
      })

      this.clearPreview()

      const context = canvas.getContext('2d')
      this.renderingTask = page.render({
        canvasContext: context,
        viewport: vp,
      })
      this.renderingTask._internalRenderTask.callback = () => {
        this.renderingTask = null
      }

      await this.renderingTask.promise
    },
    async pageBack() {
      this.currentPageNum = this.currentPageNum - 1
      await this.renderPage()
    },
    async pageForward() {
      this.currentPageNum = this.currentPageNum + 1
      await this.renderPage()
    },
    startRecord() {
      this.recorder.start()
      this.recState = 'recording'
    },
    finishRecord() {
      this.recorder.stop()
      this.recState = 'downloadPreparing'
    },
    downloadVideo() {
      downloadFile(this.recordedVideoUrl, 'download.webm')
    },
  }
}
</script>
<style>
.previewZoneContainer {
  width: 100%
}
.canvas {
  position: absolute;
  top: 0;
  left: 0;
}
</style>