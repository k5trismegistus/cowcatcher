<template>
  <v-container>
    <v-row>
      <v-col>
        <div
          class="previewZoneContainer"
          :style="`height: ${desiredHeight * scaleCanvas}px`"
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

  </v-container>

</template>
<script>
import * as PDFJS from 'pdfjs-dist'
PDFJS.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js'
import { readFileAsync } from '~/utils'

const DESIRED_WIDTH = 1280
const DESIRED_HEIGHT = 720

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
    }
  },
  async mounted() {
    const slidePdfData = await readFileAsync(this.slidePdfFile)
    this.pdf = await PDFJS.getDocument({
      data: slidePdfData,
      cMapUrl: '/cmaps/',
      cMapPacked: true
    }).promise
    this.currentPageNum = 1

    this.renderPage()

    this.handleResize()
    window.addEventListener('resize', this.handleResize)
  },
  beforeDestroy: function () {
    window.removeEventListener('resize', this.handleResize)
  },
  computed: {
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
    }
  },
  methods: {
    handleResize (event) {
      if (this.$refs.previewZoneContainer) {
        const displayWidth = this.$refs.previewZoneContainer.clientWidth
        this.scaleCanvas = displayWidth / DESIRED_WIDTH
      }
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