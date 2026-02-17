<script setup>
import { ref } from 'vue'
//import Confirmacion from './Confirmacion.vue'
import { leerDatos, ejecutarSP } from './llamadaAPI'
import botonTooltip from './botonTooltip.vue'
import { getFechaDMY, getVto, getTipoDescripcion } from '@/utils/formatos'
import CargosListFilter from './CargosListFilter.vue'
import CargosVista from './CargosVista.vue'
import CargosConceptosList from './CargosConceptosList.vue'

import { usePersonasStore } from '@/stores/personasStore'
import { estadosCargo, getName } from '@/utils/tipos'

const usoStore = usePersonasStore()
console.log(usoStore.getProvincias)

const props = defineProps(['setPersonaEdicion', 'filtros'])

const filtros = props.filtros

const hojasHeaders = [
  { title: '', key: 'ACCIONES' },
  { title: 'DNI', key: 'PERSONADOCUMENTO' },
  { title: 'Apellido', key: 'PERSONAAPELLIDO' },
  { title: 'Nombre', key: 'PERSONANOMBRE' },
  { title: 'Rep.', key: 'REPARTICIONID' },
  { title: 'Orden', key: 'ORDEN' },
  { title: 'Afiliado', key: 'AFILIADO' },
  { title: 'T.E.', key: 'TIPOEMPLEOID' },
  { title: 'Vto. Escalafón', key: 'VTOESCALAFON' },
  { title: 'Antigüedad', key: 'ANTIGUEDAD' },
  { title: 'Sit. Rev.', key: 'SITUACIONREVISTA' },
  { title: 'Categoría', key: 'CATEGORIA' },
  { title: 'Fec. Baja', key: 'FECHABAJA' },
  { title: 'Estado Cargo', key: 'ESTADOCARGOID' },
  { title: 'Tipo O.S.', key: 'TIPOOBRASOCIALID' },
  { title: 'TipoLiquidación', key: 'TIPOLIQUIDACIONID' },
  { title: 'Salario', key: 'SALARIO' }
]

// alerta de grabación o error
const mostrarAlert = ref(false)
const alertMensaje = ref(null)
const alertTipo = ref(null)

const itemMostrar = ref({
  HojaId: 0,
  Id: 0
})

let muestraRegistro = ref(false)
let muestraListaConceptos = ref(false)
let cargoSoloLectura = ref(true)

function handleModif(itemid) {
  mostrarAlert.value = false
  let item = null
  if (itemid != null) if (itemid !== 0) item = data.value.find((e) => e.ID == itemid)
  cargoSoloLectura.value = false
  abrirModal(item)
}

function handleVerCargo(itemid) {
  mostrarAlert.value = false
  let item = null
  if (itemid != null) if (itemid !== 0) item = data.value.find((e) => e.ID == itemid)
  cargoSoloLectura.value = true
  abrirModal(item)
}

function handleListaConceptos(itemid) {
  mostrarAlert.value = false
  let item = null
  if (itemid != null) if (itemid !== 0) item = data.value.find((e) => e.ID == itemid)
  itemMostrar.value = item
  muestraListaConceptos.value = true
}

function abrirModal(item) {
  itemMostrar.value = item
  muestraRegistro.value = true
}

function cierraForm() {
  muestraRegistro.value = false
}
function cierraListaConceptos() {
  muestraListaConceptos.value = false
}

// llamadas a API de grabación y eliminación

// lectura de registros
let isPending = ref(false)
const data = ref(null)
const error = null

const lecturaRegistros = ref(true)

async function leerRegistros(filtro = null) {
  let url = 'view/cargo'
  if (filtro !== null) url = url + '?' + filtro + '&sort={"ReparticionId":"asc", "Orden":"asc"}'
  else url = url + '?sort={"ReparticionId":"asc", "Orden":"asc"}'
  console.log(url)
  isPending.value = true
  const { datos, operacionOk } = await leerDatos(url)
  data.value = datos
  lecturaRegistros.value = operacionOk
  isPending.value = false
}

async function grabarSP(item, id) {
  let url = ''

  if (id == 0) {
    //url = 'sp/CargosIns'
    return 'Por el momento no se pueden agregar cargos por este medio'
  } else {
    url = 'sp/CargoUpd'
  }

  const { valorError, errorMsg } = await ejecutarSP(url, item)
  if (valorError == 0) {
    await leerRegistros()
    alertMensaje.value = 'Se grabó el cargo'
    alertTipo.value = 'success'
    mostrarAlert.value = true
    return null
  }

  return errorMsg
}

let camposFiltros = props.filtros.getFiltroCampos()

if (camposFiltros == null) {
    let campos = {
    DNI: null,
    Apellido: null,
    IdRep: null,
    Orden: null,
    liqSelected: {value: 1, name: 'MENSUAL'},
    estCargoSelected: {value: 1, name: 'ACTIVO'}
  }
  let expresion = `TipoLiquidacionId=1&EstadoCargoId=1`
  props.filtros.setFiltrosCampos(expresion, campos)
}

leerRegistros(filtros.getFiltroString())
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
    <h1>Nómina de Cargos</h1>
  </v-container>
  <v-container>
    <v-row>
      <CargosListFilter :filtrar="leerRegistros" :filtros="filtros"></CargosListFilter>
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
                :icono="'mdi-pencil'"
                :toolMsg="'Editar Cargo'"
                :funcion="handleModif"
                :itemid="item.ID"
              ></botonTooltip>
              <botonTooltip
                :icono="'mdi-dots-horizontal-circle'"
                :toolMsg="'Ver detalle del Cargo'"
                :funcion="handleVerCargo"
                :itemid="item.ID"
              ></botonTooltip>
              <botonTooltip
                :icono="'mdi-list-box-outline'"
                :toolMsg="'Ver Conceptos asociados'"
                :funcion="handleListaConceptos"
                :itemid="item.ID"
              ></botonTooltip>
            </td>

            <td class="text-right m-0 p-0">{{ item.PERSONADOCUMENTO }}</td>
            <td class="text-left m-0 p-0">{{ item.PERSONAAPELLIDO }}</td>
            <td class="text-left m-0 p-0">{{ item.PERSONANOMBRE }}</td>
            <td class="text-left m-0 p-0">
              {{ item.REPARTICIONID }}
            </td>
            <td class="text-center m-0 p-0">{{ item.ORDEN }}</td>
            <td class="text-center m-0 p-0">{{ item.AFILIADO }}</td>
            <td class="text-left m-0 p-0">
              {{ item.TIPOEMPLEOID }}
            </td>
            <td class="text-center m-0 p-0">{{ getVto(item.VTOESCALAFON) }}</td>
            <td class="text-right m-0 p-0">{{ item.ANTIGUEDAD }}</td>
            <td class="text-left m-0 p-0">
              {{ getTipoDescripcion(item.SITUACIONREVISTAID, item.SITUACIONREVISTADESCRIPCION) }}
            </td>
            <td class="text-center m-0 p-0">{{ item.CATEGORIA }}</td>
            <td class="text-right m-0 p-0">{{ getFechaDMY(item.FECHABAJA) }}</td>
            <td class="text-center m-0 p-0">
              {{
                getTipoDescripcion(item.ESTADOCARGOID, getName(estadosCargo, item.ESTADOCARGOID))
              }}
            </td>
            <td class="text-left m-0 p-0">
              {{ getTipoDescripcion(item.TIPOOBRASOCIALID, item.TIPOOBRASOCIALDESCRIPCION) }}
            </td>
            <td class="text-left m-0 p-0">
              {{ getTipoDescripcion(item.TIPOLIQUIDACIONID, item.TIPOLIQUIDACIONDESCRIPCION) }}
            </td>
            <td class="text-right m-0 p-0">{{ item.SALARIO }}</td>
          </tr>
        </template>
      </v-data-table>
    </div>
    <div v-else>Sin datos para mostrar</div>
    <div v-if="error">No se puede obtener los datos solicitados.</div>
  </v-container>
  <v-dialog v-model="muestraRegistro" max-width="80%" persistent="">
    <CargosVista
      :Registro="itemMostrar"
      :cerrar="cierraForm"
      :funcion="grabarSP"
      :hojaId="itemMostrar.ID"
      :soloLectura="cargoSoloLectura"
    ></CargosVista>
  </v-dialog>
  <v-dialog v-model="muestraListaConceptos" max-width="80%" persistent="">
    <CargosConceptosList
      :cerrar="cierraListaConceptos"
      :cargoId="itemMostrar.ID"
    ></CargosConceptosList>
  </v-dialog>
</template>
