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
          <h1>About</h1>
        </v-col>
      </v-row>

      <v-row>
        <v-col>
          <h2 class='q-question'>Tedder</h2>
          <p class='q-answer'>
            Record your presentation<br />
          </p>
        </v-col>
      </v-row>
    </v-container>
  </v-container>
</template>
<script>
export default {
  head: { title: 'About' },
}
</script>
