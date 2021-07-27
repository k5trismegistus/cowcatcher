<template>
  <v-container ref="main">
    <v-container v-if="!slideFile">
      <Droparea
        :handleSetSlide="handleSetSlide"
      />
    </v-container>
    <v-container v-else>
      <Preview
        :slidePdfFile="slideFile"
      />
    </v-container>
  </v-container>
</template>

<script>
import Droparea from '~/components/Droparea.vue'
import Preview from '~/components/Preview.vue'

export default {
  components: { Droparea, Preview },
  head: { title: 'Top' },
  data() {
    return {
      slideFile: null
    }
  },
  methods: {
    handleSetSlide(file) {
      this.slideFile = file
    }
  }
}
</script>
<style scoped>
</style>
