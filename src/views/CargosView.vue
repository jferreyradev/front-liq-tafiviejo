<script setup>
import CargosList from '@/components/Agentes/CargosList.vue'
import { ref } from 'vue'
const titulo = ref('Listado de Cargos')

// manejo de filtros
let filtroString = null
let filtroCampos = null
let filtros = {
  setFiltrosCampos: (pFiltroString, pFiltroCampos) => {
    filtroString = pFiltroString
    filtroCampos = pFiltroCampos
  },
  getFiltroString: () => filtroString,
  getFiltroCampos: () => filtroCampos
}

///////
</script>

<template>
  <v-container>
    <v-row justify="space-around" class="bg-primary">
      <h3>{{ titulo }}</h3>
    </v-row>
    <v-row>
      <CargosList :filtros="filtros"></CargosList>
    </v-row>
  </v-container>
</template>
