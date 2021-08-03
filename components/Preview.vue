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
            :width='`${desiredWidth}`'
            :height='`${desiredHeight}`'
            ref="previewZone"
            class="canvas"
            v-show="false"
          ></canvas>
          <canvas
            :width='`${desiredWidth}`'
            :height='`${desiredHeight}`'
            ref="wipeZone"
            class="canvas"
            v-show="false"
          ></canvas>
          <canvas
            :width='`${desiredWidth}`'
            :height='`${desiredHeight}`'
            ref="mergedZone"
            class="canvas"
          ></canvas>
        </div>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <p>Slide control</p>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-btn
          @click="pageBack"
          v-if="showBackBtn"
        >Back</v-btn>
      </v-col>
      <v-col>
        <v-btn
          @click="pageForward"
          v-if="showForwardBtn"
        >Forward</v-btn>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <p>Video control</p>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-btn
          @click="setWipeMode('left-top')"
        >Left top</v-btn>
      </v-col>
      <v-col>
        <v-btn
          @click="setWipeMode('right-top')"
        >Right top</v-btn>
      </v-col>
      <v-col>
        <v-btn
          @click="setWipeMode('fullscreen')"
        >Fullscreen</v-btn>
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

    <video width='300px' height='200px' class="preview" ref="wipe" muted v-show="false"></video>

  </v-container>

</template>
<script>
import { loadPdf } from '~/utils'

const DESIRED_WIDTH = 1280
const DESIRED_HEIGHT = 720
const WIPE_SMALL_WIDTH = 240
const WIPE_SMALL_HEIGHT = 240
const WIPE_FS_WIDTH = 1280
const WIPE_FS_HEIGHT = 960
const WIPE_FS_OFFSET_Y = -120

export default {
  props: ['slidePdfFile'],
  data() {
    return {
      recState: 'ready',
      pdf: null,
      currentPageNum: 1,
      renderingTask: null,
      scaleCanvas: 1,
      desiredWidth: DESIRED_WIDTH,
      desiredHeight: DESIRED_HEIGHT,
      wipeMode: 'left-top',
      recorder: null,
      recordedVideoUrl: '',
      intervals: [],
      timeouts: [],
      streams: [],
    }
  },
  async mounted() {
    this.pdf = await loadPdf(this.slidePdfFile)
    this.currentPageNum = 1
    this.renderPage()
    this.handleResize()
    window.addEventListener('resize', this.handleResize)

    const webcamStream = await this.initWipe()
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
      this.recordedVideoUrl = window.URL.createObjectURL(e.data) // videoタグが扱えるように、記録データを加工
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
      return DESIRED_HEIGHT * this.scaleCanvas
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
    wipeWidth() {
      if (this.wipeMode === 'left-top' || this.wipeMode === 'right-top') {
        return WIPE_SMALL_WIDTH
      }

      if (this.wipeMode === 'fullscreen') {
        return WIPE_FS_WIDTH
      }
    },
    wipeHeight() {
      if (this.wipeMode === 'left-top' || this.wipeMode === 'right-top') {
        return WIPE_SMALL_HEIGHT
      }

      if (this.wipeMode === 'fullscreen') {
        return WIPE_FS_HEIGHT
      }
    },
    wipeTop() {
      if (this.wipeMode === 'left-top' || this.wipeMode === 'right-top') {
        return 0
      }

      if (this.wipeMode === 'fullscreen') {
        return WIPE_FS_OFFSET_Y
      }
    },
    wipeLeft() {
      if (this.wipeMode === 'left-top' || this.wipeMode === 'fullscreen') {
        return 0
      }

      if (this.wipeMode === 'right-top') {
        return DESIRED_WIDTH - this.wipeWidth
      }
    }
  },
  methods: {
    handleResize (event) {
      if (this.$refs.previewZoneContainer) {
        const displayWidth = this.$refs.previewZoneContainer.clientWidth
        this.scaleCanvas = displayWidth / DESIRED_WIDTH
      }
    },
    async initWipe() {
      const webcamStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: "environment" },
        audio: true,
      })

      const preview = this.$refs.wipe
      preview.srcObject = webcamStream
      preview.play()

      const renderWipeInterval = setInterval(() => {
        this.renderVideo()
      }, 1000/30)
      this.intervals.push(renderWipeInterval)

      return webcamStream
    },
    setWipeMode(mode) {
      this.wipeMode = mode
      this.clearWipe()
      this.renderPage()
    },
    clearWipe() {
      const canvas = this.$refs.wipeZone
      const context = canvas.getContext('2d')
      context.clearRect(0, 0, DESIRED_WIDTH, DESIRED_HEIGHT)
    },
    clearPreview() {
      const canvas = this.$refs.previewZone
      const context = canvas.getContext('2d')
      context.clearRect(0, 0, DESIRED_WIDTH, DESIRED_HEIGHT)
    },
    async rendermerged() {
      const preview = this.$refs.previewZone
      const wipe = this.$refs.wipeZone

      const canvas = this.$refs.mergedZone
      const context = canvas.getContext('2d')
      context.drawImage(preview, 0, 0)
      context.drawImage(wipe, 0, 0)
    },
    async renderVideo() {
      const wipe = this.$refs.wipe
      const canvas = this.$refs.wipeZone
      const context = canvas.getContext('2d')
      context.drawImage(wipe, 80, 0, 480, 480, this.wipeLeft, this.wipeTop, this.wipeWidth, this.wipeHeight)
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
        DESIRED_WIDTH / viewport.width,
        DESIRED_HEIGHT / viewport.height
      )
      const scaledViewport = page.getViewport({ scale: scale })
      const offsetX = (DESIRED_WIDTH - scaledViewport.width) / 2
      const offsetY = (DESIRED_HEIGHT - scaledViewport.height) / 2

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
      const a = document.createElement("a")
      document.body.appendChild(a)
      a.style = "display: none"
      a.href = this.recordedVideoUrl
      a.download = "out.webm"
      a.click(this.recordedVideoUrl)
      window.URL.revokeObjectURL(this.recordedVideoUrl)
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