<script setup>
import { ref } from 'vue'
import { rules } from '@/utils/reglasValidacion'
import { tipoLiq, estadosCargo } from '@/utils/tipos'

const props = defineProps(['filtrar', 'filtros'])

const form = ref(null)
const DNI = ref(null)
const Apellido = ref(null)
const IdRep = ref(null)
const Orden = ref(null)

const tipoLiqFilter = [
  {
    name: 'Todas',
    value: -1
  },
  ...tipoLiq
]

const estadosCargoFilter = [
  {
    name: 'Todos',
    value: -1
  },
  ...estadosCargo
]

const liqSelected = ref(tipoLiqFilter[1])
const estCargoSelected = ref(estadosCargoFilter[1])


function ObtieneFiltro() {
  let filtro = ''
  let expresion = ''

  if (formOK.value === false) {
    return 'error'
  }

  if (DNI.value !== null) {
    if (DNI.value.length > 0) {
      expresion = `PersonaDocumento=${DNI.value}`
      filtro = expresion
    }
  }

  if (Apellido.value !== null) {
    if (Apellido.value.length > 0) {
      expresion = `search=PersonaApellido:${Apellido.value}`
      filtro = filtro.length == 0 ? expresion : filtro + '&' + expresion
    }
  }

  if (IdRep.value !== null) {
    if (IdRep.value.length > 0) {
      expresion = `ReparticionId=${IdRep.value}`
      filtro = filtro.length == 0 ? expresion : filtro + '&' + expresion
    }
  }

  if (Orden.value !== null) {
    if (Orden.value.length > 0) {
      expresion = `Orden=${Orden.value}`
      filtro = filtro.length == 0 ? expresion : filtro + '&' + expresion
    }
  }

  if (liqSelected.value.value !== -1) {
    expresion = `TipoLiquidacionId=${liqSelected.value.value}`
    filtro = filtro.length == 0 ? expresion : filtro + '&' + expresion
  }

  if (estCargoSelected.value.value !== -1) {
    expresion = `EstadoCargoId=${estCargoSelected.value.value}`
    filtro = filtro.length == 0 ? expresion : filtro + '&' + expresion
  }

  return filtro
}

function setCamposFiltros() {
  console.log(liqSelected)
  let campos = {
    DNI: DNI.value,
    Apellido: Apellido.value,
    IdRep: IdRep.value,
    Orden: Orden.value,
    liqSelected: liqSelected.value.value,
    estCargoSelected: estCargoSelected.value.value
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
  IdRep.value = camposFiltros.IdRep
  Orden.value = camposFiltros.Orden
  liqSelected.value = camposFiltros.liqSelected
  estCargoSelected.value = camposFiltros.estCargoSelected
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
        <v-col cols="1">
          <v-text-field
            v-model="IdRep"
            hide-details="auto"
            label="Rep"
            :rules="rules.number"
          ></v-text-field>
        </v-col>
        <v-col cols="1">
          <v-text-field
            v-model="Orden"
            hide-details="auto"
            label="Orden"
            :rules="rules.number"
          ></v-text-field>
        </v-col>
        <v-col cols="2">
          <v-select
            label="Tipo Liq"
            :items="tipoLiqFilter"
            item-title="name"
            item-value="value"
            v-model="liqSelected"
            return-object
          >
          </v-select>
        </v-col>
        <v-col cols="2">
          <v-select
            label="Est. Cargo"
            :items="estadosCargoFilter"
            item-title="name"
            item-value="value"
            v-model="estCargoSelected"
            return-object
          >
          </v-select>
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
