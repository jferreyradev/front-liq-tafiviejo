<script setup>
import { ref } from 'vue'
//import Confirmacion from './Confirmacion.vue'
import { leerDatos, ejecutarSP } from './llamadaAPI'
import botonTooltip from './botonTooltip.vue'
import { getFechaDMY } from '@/utils/formatos'
import PersonasListFilter from './PersonasListFilter.vue'
import PersonasVista from './PersonasVista.vue'

const props = defineProps(['setPersonaEdicion', 'filtros'])

const filtros = props.filtros

const hojasHeaders = [
  { title: '', key: 'ACCIONES' },
  { title: 'DNI', key: 'DOCUMENTO' },
  { title: 'Apellido', key: 'APELLIDO' },
  { title: 'Nombre', key: 'NOMBRE' },
  { title: 'CUIL', key: 'PERSONACUIL' },
  { title: 'Fec. Ingreso', key: 'FECHAINGRESO' },
  { title: 'Cobra Ley', key: 'COBRALEY' }
]

const itemMostrar = ref({
  HojaId: 0,
  Id: 0
})
let muestraRegistro = ref(false)

function abrirModal(item) {
  itemMostrar.value = item
  muestraRegistro.value = true
}

function cierraForm() {
  muestraRegistro.value = false
}

// llamadas a API de grabación y eliminación

// lectura de registros
let isPending = ref(false)
const data = ref(null)
const error = null

// alerta de grabación o error
const mostrarAlert = ref(false)
const alertMensaje = ref(null)
const alertTipo = ref(null)

const lecturaRegistros = ref(true)

async function leerRegistros(filtro = null) {
  let url = 'view/personaLista'
  if (filtro !== null) url = url + '?' + filtro

  console.log(url)
  isPending.value = true
  const { datos, operacionOk } = await leerDatos(url)
  data.value = datos
  lecturaRegistros.value = operacionOk
  isPending.value = false
}

async function buscarPersona(id) {
  let url = 'en/persona?Id=' + id
  let persona = null
  const { datos, operacionOk } = await leerDatos(url)
  if (operacionOk) persona = datos[0]

  return persona
}

async function editarPersona(id) {
  let persona = await buscarPersona(id)
  if (persona != null) {
    abrirModal(persona)
  }
}

function editarCargaFamiliar(itemid) {
  let item = data.value.find((e) => e.PERSONAID == itemid)
  props.setPersonaEdicion(item, 1)
}

async function grabarSP(item, id) {
  let url = ''

  if (id == 0) {
    return 'Por el momento no se pueden agregar personas por este medio'
  } else {
    url = 'sp/persUpd'
  }

  const { valorError, errorMsg } = await ejecutarSP(url, item)
  if (valorError == 0) {
    await leerRegistros()
    alertMensaje.value = 'Se grabó la persona'
    alertTipo.value = 'success'
    mostrarAlert.value = true
    return null
  }

  return errorMsg
}

leerRegistros()
</script>

<style>
.sticky {
  position: sticky !important;
  left: 0 !important;
  min-width: 130px !important;
  z-index: 10 !important;
}
</style>

<template>
  <v-container>
    <h1>Agentes</h1>
  </v-container>
  <v-container>
    <v-row>
      <PersonasListFilter :filtrar="leerRegistros" :filtros="filtros"></PersonasListFilter>
    </v-row>
    <div v-if="isPending">loading...</div>
    <div v-else-if="!lecturaRegistros">Error al intentar recibir los datos</div>
    <div v-else-if="data">
      <v-alert
        v-model="mostrarAlert"
        border="start"
        close-label="Close Alert"
        :color="alertTipo"
        :icon="'$' + alertTipo"
        closable
      >
        {{ alertMensaje }}
      </v-alert>
      <v-data-table
        class="text-caption"
        hover
        density="compact"
        :items="data"
        :headers="hojasHeaders"
      >
        <template v-slot:item="{ item }">
          <tr class="pa-0 ma-0">
            <td class="text-center m-0 p-0 sticky">
              <botonTooltip
                :icono="'mdi-list-box-outline'"
                :toolMsg="'Familiares'"
                :funcion="editarCargaFamiliar"
                :itemid="item.PERSONAID"
              ></botonTooltip>
              <botonTooltip
                :icono="'mdi-pencil'"
                :toolMsg="'Editar'"
                :funcion="editarPersona"
                :itemid="item.PERSONAID"
              ></botonTooltip>
            </td>

            <td class="text-right m-0 p-0">{{ item.DOCUMENTO }}</td>
            <td class="text-left m-0 p-0">{{ item.APELLIDO }}</td>
            <td class="text-left m-0 p-0">{{ item.NOMBRE }}</td>
            <td class="text-right m-0 p-0">{{ item.PERSONACUIL }}</td>
            <td class="text-left m-0 p-0">{{ getFechaDMY(item.FECHAINGRESO) }}</td>
            <td class="text-center m-0 p-0">{{ item.COBRALEY == 1 ? 'SI' : 'NO' }}</td>
          </tr>
        </template>
      </v-data-table>
    </div>
    <div v-else>Sin datos para mostrar</div>
    <div v-if="error">No se puede obtener los datos solicitados.</div>
  </v-container>
  <v-dialog v-model="muestraRegistro" max-width="80%" persistent="">
    <PersonasVista :Registro="itemMostrar" :cerrar="cierraForm" :funcion="grabarSP"></PersonasVista>
  </v-dialog>
</template>
