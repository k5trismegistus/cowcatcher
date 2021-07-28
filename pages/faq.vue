<template>
  <v-container>
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
        <v-col cols="12">
          <h1>FAQ</h1>
        </v-col>
      </v-row>

      <v-row>
        <v-col>
          <h2 class='q-question'>I have a trouble</h2>
          <p class='q-answer'>
            At first, this service is tested only on Chrome. If you are using other web browsers, Please try chrome.<br />
            And avoid using iPhone/iPad.<br />
          </p>
        </v-col>
      </v-row>
    </v-container>
  </v-container>
</template>
<script>
export default {
  head: { title: 'FAQ' },
}
</script>
<style scoped>
.q-question {
  line-height: 1.2em;
  margin-bottom: 1rem;
}

.q-answer {
  line-height: 1.4em;
  margin-bottom: 1.2em;
}

.here-link {
  color: white;
  text-decoration: underline;
}
</style>