<script setup>
import PersonasList from '@/components/Agentes/PersonasList.vue'
import CargaFamiliarList from '@/components/Agentes/CargaFamiliarList.vue'
import CargosList from '@/components/Agentes/CargosList.vue'
import { ref } from 'vue'

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

const personaEdicion = ref(null)
const tipoEdicion = ref(0)
const titulo = ref('Listado de Personas')

function setPersonaEdicion(persona, tipo) {
  personaEdicion.value = persona
  tipoEdicion.value = tipo

  if (persona !== null && tipo == 1) {
    titulo.value =
      'Editar Carga familiar de : ' +
      persona.DOCUMENTO +
      ' - ' +
      persona.APELLIDO +
      ', ' +
      persona.NOMBRE
  } else {
    titulo.value = 'Listado de personas'
  }
}
</script>

<template>
  <v-container>
    <v-row justify="space-around" class="bg-primary">
      <h3>{{ titulo }}</h3>
    </v-row>
    <v-row>
      <CargaFamiliarList
        v-if="tipoEdicion == 1"
        :personaEditar="personaEdicion"
        :setPersonaEdicion="setPersonaEdicion"
      ></CargaFamiliarList>
      <PersonasList
        v-if="tipoEdicion == 0"
        :setPersonaEdicion="setPersonaEdicion"
        :filtros="filtros"
      ></PersonasList>
    </v-row>
  </v-container>
</template>
