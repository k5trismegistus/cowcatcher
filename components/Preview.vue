<template>
  <v-container>
    <v-row>
      <v-col>
        <div
          class="previewZoneContainer"
          :style="`height: ${containerHeight}px`"
          ref="previewZoneContainer"
        >
          <canvas
            :width='`${desiredWidth}`'
            :height='`${desiredHeight}`'
            :style="`transform: scale(${scaleCanvas}); transform-origin: 0 0`"
            ref="previewZone"
            class='previewZone'
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
const WIPE_FS_HEIGHT = 720

export default {
  props: ['slidePdfFile'],
  data() {
    return {
      pdf: null,
      currentPageNum: 1,
      renderingTask: null,
      scaleCanvas: 1,
      desiredWidth: DESIRED_WIDTH,
      desiredHeight: DESIRED_HEIGHT,
      wipeMode: 'left-top',
      intervals: [],
      timeouts: [],
    }
  },
  async mounted() {
    this.pdf = await loadPdf(this.slidePdfFile)
    this.currentPageNum = 1
    this.renderPage()
    this.handleResize()
    window.addEventListener('resize', this.handleResize)


    await this.initWipe()
  },
  beforeDestroy: function () {
    window.removeEventListener('resize', this.handleResize)

    this.intervals.forEach((i) => {
      clearInterval(i)
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
      if (this.wipeMode === 'left-top') {
        return WIPE_SMALL_WIDTH
      }

      if (this.wipeMode === 'right-top') {
        return WIPE_SMALL_WIDTH
      }
    },
    wipeHeight() {
      if (this.wipeMode === 'left-top') {
        return WIPE_SMALL_HEIGHT
      }

      if (this.wipeMode === 'right-top') {
        return WIPE_SMALL_HEIGHT
      }
    },
    wipeTop() {
      if (this.wipeMode === 'left-top') {
        return 0
      }

      if (this.wipeMode === 'right-top') {
        return 0
      }
    },
    wipeLeft() {
      if (this.wipeMode === 'left-top') {
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
        audio: false,
      })

      const preview = this.$refs.wipe
      preview.srcObject = webcamStream
      preview.play()

      const renderWipeInterval = setInterval(() => {
        this.renderVideo()
      }, 1000/30)

      this.intervals.push(renderWipeInterval)
    },
    setWipeMode(mode) {
      this.wipeMode = mode

      const canvas = this.$refs.previewZone
      const context = canvas.getContext('2d')

      context.clearRect(0, 0, DESIRED_WIDTH, DESIRED_HEIGHT)
      this.renderPage()
    },
    async renderVideo() {
      const wipe = this.$refs.wipe
      const canvas = this.$refs.previewZone
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

      const context = canvas.getContext('2d')
      this.renderingTask = page.render({
        canvasContext: context,
        viewport: scaledViewport,
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
  }
}
</script>
<style>
.previewZoneContainer {
  width: 100%
}
</style>