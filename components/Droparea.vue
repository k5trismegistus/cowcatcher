<template>
  <div
    class="droparea"
    @drop.prevent="onDropfile"
    @dragover.prevent
  >

  </div>
</template>
<script>
export default {
  props: ["handleSetSlide"],
  methods: {
    onDropfile(event) {
      const files = [...event.dataTransfer.files]
      if (files.length > 1) {
        window.alert('1つだけにしてください')
        return
      }

      const file = files[0]
      if (file.type !== 'application/pdf') {
        window.alert('pdfだけです')
        return
      }

      this.handleSetSlide(file)
    }
  }
}
</script>
<style>
.droparea {
  width: 300px;
  height: 200px;
  border: solid 1px black;
}
</style>