<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" align="center">
        <v-img
          class="link"
          contain
          max-width="240"
          src="/logo_transparent.png"
        ></v-img>
      </v-col>
    </v-row>

    <v-row>
      <v-col>
        <div
          class="droparea"
          @drop.prevent="onDropfile"
          @dragover.prevent
        >
          <p>Drag and drop PDF file here</p>
          <input type="file" @change="onSelectfile" />
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>
<script>
export default {
  props: ["handleSetSlide"],
  methods: {
    onDropfile(event) {
      const files = [...event.dataTransfer.files]
      this.setFile(files)
    },
    onSelectfile(event) {
      const files = [...event.target.files]
      this.setFile(files)
    },
    setFile(files) {
      if (files.length > 1) {
        window.alert('Upload only 1 file')
        return
      }

      const file = files[0]
      if (file.type !== 'application/pdf') {
        window.alert('This app supports only PDF without password')
        return
      }

      this.handleSetSlide(file)
    }
  }
}
</script>
<style>
.droparea {
  width: 100%;
  height: 200px;
  border: solid 1px black;

}
</style>