<script setup>
import { useTheme } from 'vuetify'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import { useEndPoints } from '@/composables/useEndPoints'
import { useItemsMenu } from './composables/useItemsMenu'
import { useFilterStore } from '@/stores/filterStore'

const { setDesa,setProd, env } = useEndPoints()

const storeFilter = useFilterStore()

//setProd()
setDesa()
storeFilter.setConfig()

const { itemsMenu, setItemsMenu } = useItemsMenu();

// access the `store` variable anywhere in the component ✨
const store = useUserStore()

const theme = useTheme()
const router = useRouter()
const drawer = ref(false)

function toggleTheme() {
  theme.global.name.value = theme.global.current.value.dark ? 'light' : 'dark'
}

function handleLogout() {
  store.$reset()
  router.push('/login')
}

async function changeEnv() {
  console.log(env.value)
  if (env.value=='Desa'){
    setProd()
    await store.fetchRol()
    setItemsMenu(store.rol)    
  }else{
    setDesa()    
    await store.fetchRol()
    setItemsMenu(store.rol)
  }
  storeFilter.setConfig()
}

import { ref } from 'vue'

</script>

<template>
  <v-layout class="rounded rounded-md d-flex flex-column mb-6 ">
    <v-app-bar color="primary" prominent>
      <v-app-bar-nav-icon v-if="store.auth" variant="text" @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
      <v-app-bar-title>Consultas - Municipalidad de Tafí Viejo</v-app-bar-title>
      <v-spacer></v-spacer>
       <v-btn @click="toggleTheme" icon="mdi mdi-theme-light-dark">
        <v-tooltip activator="parent" location="start">Cambiar tema</v-tooltip>
        <v-icon icon="mdi-theme-light-dark"></v-icon>
      </v-btn>
      <v-btn v-show="store.isAuth" class="bg-blue-darken-2" @click="handleLogout">
        <v-tooltip activator="parent" location="start">Salir</v-tooltip>
        <v-icon icon="mdi-logout"></v-icon>
      </v-btn>
     
      <div v-if="store.auth">
        <v-menu>
          <template v-slot:activator="{ props }">
            <v-btn icon="mdi-dots-vertical" prepend-icon="mdi-account" title="User Profile" v-bind="props">
            </v-btn> 
          </template>

          <v-list>
            <v-list-item
            :subtitle="store.user.EMAIL"
            :title="store.user.USERNAME" 
          >
          </v-list-item>
          
          <v-divider></v-divider>
            <v-list-item title="Cambio de contraseña" @click="() => router.push('/passchange')" />
            <v-list-item title="Salir" @click="handleLogout()" />
          </v-list>
        </v-menu>
      </div>
    </v-app-bar>

    <v-navigation-drawer v-model="drawer" :location="$vuetify.display.mobile ? 'bottom' : undefined" temporary>
      <v-list>
        <v-list-item v-for="item in itemsMenu" :title="item.DESCRIPCION" @click="()=>router.push(item.PATH)" :key="item.IDMENU" ></v-list-item>
        <v-list-item title="Salir" @click="handleLogout()" />
      </v-list>
    </v-navigation-drawer>

    <v-main>
      <v-container fluid>
        <v-row justify="center">
          <RouterView />
        </v-row>
      </v-container>
    </v-main>
    <v-footer>
      <v-row justify="center" no-gutters>
        <v-col class="text-center ma-1" cols="6">
          {{ new Date().getFullYear() }} — <strong>Tafí Viejo - Tucumán</strong>
        </v-col>
      </v-row>
    </v-footer>

  </v-layout>

</template>

<style scoped>
header {
  line-height: 1.5;
  max-height: 100vh;
}

.header-bar {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

nav {
  width: 100%;
  font-size: 12px;
  --text-align: center;
  margin-top: 2rem;
}

nav a.router-link-exact-active {
  color: var(--color-text);
  text-decoration: underline;
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
  border: 0;
}
</style>
