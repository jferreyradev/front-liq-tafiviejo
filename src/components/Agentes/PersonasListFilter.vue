<script setup>
import { ref } from 'vue'
import { rules } from '@/utils/reglasValidacion'

const props = defineProps(['filtrar', 'filtros'])

const form = ref(null)
const DNI = ref(null)
const Apellido = ref(null)
const Nombre = ref(null)

function ObtieneFiltro() {
  let filtro = ''
  let expresion = ''

  if (formOK.value === false) {
    return 'error'
  }

  if (DNI.value !== null) {
    if (DNI.value.length > 0) {
      expresion = `Documento=${DNI.value}`
      filtro = expresion
    }
  }

  if (Apellido.value !== null) {
    if (Apellido.value.length > 0) {
      expresion = `search=Apellido:${Apellido.value}`
      filtro = filtro.length == 0 ? expresion : filtro + '&' + expresion
    }
  }

  if (Nombre.value !== null) {
    if (Nombre.value.length > 0) {
      expresion = `search=Nombre:${Nombre.value}`
      filtro = filtro.length == 0 ? expresion : filtro + '&' + expresion
    }
  }

  return filtro
}

function setCamposFiltros() {
  let campos = {
    DNI: DNI.value,
    Apellido: Apellido.value,
    Nombre: Nombre.value
  }
  return campos
}

async function filtar() {
  // Forzar la validación del formulario y esperar a que se complete
  const isValid = await form.value.validate()

  if (!isValid) {
    return
  }
  let filtro = ObtieneFiltro()
  if (filtro == 'error') {
    return
  }
  props.filtros.setFiltrosCampos(filtro, setCamposFiltros())
  props.filtrar(filtro)
}

let camposFiltros = props.filtros.getFiltroCampos()

if (camposFiltros != null) {
  DNI.value = camposFiltros.DNI
  Apellido.value = camposFiltros.Apellido
  Nombre.value = camposFiltros.Nombre
}

const formOK = ref(null)
</script>

<template>
  <v-container>
    <v-form ref="form" v-model="formOK">
      <v-row>
        <v-col cols="2">
          <v-text-field
            v-model="DNI"
            hide-details="auto"
            label="DNI"
            :rules="rules.number"
          ></v-text-field>
        </v-col>
        <v-col cols="3">
          <v-text-field v-model="Apellido" hide-details="auto" label="Apellido"></v-text-field>
        </v-col>
        <v-col cols="3">
          <v-text-field v-model="Nombre" hide-details="auto" label="Nombre"></v-text-field>
        </v-col>
        <v-col cols="2">
          <v-btn color="primary" elevation="3" outlined value="filtrar" @click="filtar()"
            >Buscar</v-btn
          >
        </v-col>
      </v-row>
    </v-form>
  </v-container>
</template>
