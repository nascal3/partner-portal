<template>
  <div class="align-center app--full-height">
    <app-drawer 
      :show-drawer="showDrawer"
      @closed="showDrawer = false"
    />

    <div class="app--main-content">
      <app-bar 
        @drawer="showDrawer = true" 
      />

      <v-container 
        class="app--content-container" 
        fluid
      >
        <router-view />
      </v-container>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';

export default {
  components: {
    'app-drawer': () => import('./includes/AppDrawer'),
    'app-bar': () => import('./includes/AppBar'),
  },

  data () {
    return {
      showDrawer: false
    }
  },

  computed: {
    isTiny () {
      const name = this.$vuetify.breakpoint.name
      return name == 'xs' || name == 'sm'
    }
  },

  mounted () {
    this.showDrawer = !this.isTiny
  }
}
</script>