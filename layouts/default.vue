<template>
  <v-app dark>
    <v-main>
      <v-container>
        <v-row justify="center" align="center">
          <v-col cols="12" sm="10" md="8">
            <v-card>
              <nuxt />
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
    <v-footer
      :absolute="!fixed"
      app
    >
      <v-row>
        <v-col>
        </v-col>

        <v-col justify="right" class="copyright">
          <span>&copy; 2021 Tedder</span>
        </v-col>
      </v-row>
    </v-footer>
  </v-app>
</template>

<script>
export default {
  data () {
    return {
      fixed: false,
      title: 'Tedder'
    }
  }
}
</script>
<style>
a {
  text-decoration: none;
}

.link {
  cursor: pointer;
}

.no-padding {
  padding: 0;
}

.half-padding {
  padding: 6px;
}
</style>
<style scoped>
.footer-link {
  color: white;
  margin-right: 24px;
}
.copyright {
  text-align: right;
}
</style>