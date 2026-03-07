<script setup>
import { ref } from 'vue'
import Confirmacion from './Confirmacion.vue'
import { leerDatos, ejecutarSP } from './llamadaAPI'
import botonTooltip from './botonTooltip.vue'
import { getVto, financial } from '@/utils/formatos'
import ParametrosDDJJ_Vista from './ParametrosDDJJ_Vista.vue'
import { utils, writeFileXLSX } from 'xlsx'
import { agregaTitulosExcel } from '@/utils/reportes.js'

const props = defineProps(['cerrar'])
const cerrar = props.cerrar

const listaHeaders = [
  { title: '', key: '' },
  { title: 'ID', key: 'ID' },
  { title: 'Periodo', key: 'PERIODO' },
  { title: 'Hasta', key: 'PERIODOHASTA' },
  { title: 'Ap. Jub. Min', key: 'JUBMIN' },
  { title: 'Ap. Jub. Max.', key: 'JUBMAX' },
  { title: '% Ap. Jub.', key: 'PORCREP' },
  { title: 'Cont. Jub. Max.', key: 'CONTJUBMAX' },
  { title: '% Cont. Jub.', key: 'CONTJUBPORC' },
  { title: 'Ap. OS Min.', key: 'APOSMIN' },
  { title: 'Ap. OS Max.', key: 'APOSMAX' },
  { title: 'Cont. OS Min.', key: 'CONTOSMIN' },
  { title: 'Cont. OS Max.', key: 'CONTOSMAX' }
]

// lectura de registros
let isPending = ref(false)
const data = ref(null)
const error = null

const lecturaListaRegs = ref(true)

async function leerListaRegs() {
  isPending.value = true
  const { datos, operacionOk } = await leerDatos('view/ddjjParam?sort={"Periodo":"desc"}')
  data.value = datos
  lecturaListaRegs.value = operacionOk
  isPending.value = false
}

leerListaRegs()

// alerta de grabación o error
const mostrarAlert = ref(false)
const alertMensaje = ref(null)
const alertTipo = ref(null)

// manejadores de altas, bajas y modificaciones

const itemMostrar = ref({
  Id: null
})

function handleModif(itemid) {
  mostrarAlert.value = false
  let item = null
  if (itemid != null) if (itemid !== 0) item = data.value.find((e) => e.ID == itemid)
  abrirModal(item)
}

const itemEliminar = ref(0)
let muestraConfirmacion = ref(false)

function handleEliminar(itemid) {
  mostrarAlert.value = false
  itemEliminar.value = itemid
  muestraConfirmacion.value = true
}
function cierraConfirmacion() {
  muestraConfirmacion.value = false
}

// apertura y cierre del formulario modal
let muestraRegistro = ref(false)

function abrirModal(item) {
  itemMostrar.value = item
  muestraRegistro.value = true
}

function cierraForm() {
  muestraRegistro.value = false
}

// funciones de agregado, modificación y eliminación
async function grabarSP(item, id) {
  let url = ''
  if (id == 0) {
    url = 'sp/ddjjIns'
  } else {
    url = 'sp/ddjjUpd'
  }
  console.log('--- registtro a grabar')
  console.log(item)
  const { datos } = await ejecutarSP(url, item)
  let errorMsg = "No se pudieron grabar los datos"

  if (datos != null) {
    const valorError = datos.out.vError
    const valorSalida = datos.out.vSALIDA
    errorMsg = datos.out.vErrorMsg
    if (valorError == 0) {
      await leerListaRegs()
      alertMensaje.value = 'Se grabó el rango de parámetros con Id=' + valorSalida
      alertTipo.value = 'success'
      mostrarAlert.value = true
      return 'OK'
    }
  }

  return 'Error de grabacion: ' + errorMsg
}

async function eliminar(id) {
  muestraConfirmacion.value = false
  let item = {
    vID: id
  }
  let url = 'sp/ddjjDel'

  const { datos } = await ejecutarSP(url, item)
  const valorError = datos.out.vError

  if (valorError == 0) {
    await leerListaRegs()
    alertMensaje.value = 'Se eliminó el rango con ID: ' + id
    alertTipo.value = 'success'
    mostrarAlert.value = true
    return true
  }
  return false
}
// -------------------------------------------------
// funciones de exportación a archivo excel

function handleDownload() {
  console.log('download')
  exportFile()
}

function exportFile() {
  const map1 = data.value.map((x) => {
    return [
      x.ID,
      getVto(x.PERIODO),
      getVto(x.PERIODOHASTA),
      x.JUBMIN,
      x.JUBMAX,
      x.PORCREP,
      x.CONTJUBMAX,
      x.CONTJUBPORC,
      x.APOSMIN,
      x.APOSMAX,
      x.CONTOSMIN,
      x.CONTOSMAX
    ]
  })

  const titulosTabla = [
    'Id',
    'Período',
    'Per. Hasta',
    'Ap. Jub. Min.',
    'Ap. Jub. Max.',
    'Ap. Jub. %',
    'Contr. Máx.',
    'Contr. Porc.',
    'Ap. OS Mín.',
    'Ap. OS Máx.',
    'Contr. OS Mín.',
    'Contr. OS Máx.'
  ]
  const filtros = ''
  const tituloReporte = 'Parámetros para las Declaraciones Juradas 931 '
  agregaTitulosExcel(map1, tituloReporte, filtros, titulosTabla)
  const ws = utils.aoa_to_sheet(map1)

  ws['!cols'] = [
    { wch: 10 },
    { wch: 10 },
    { wch: 10 },
    { wch: 10 },
    { wch: 10 },
    { wch: 10 },
    { wch: 10 },
    { wch: 10 },
    { wch: 10 },
    { wch: 10 },
    { wch: 10 },
    { wch: 10 }
  ]
  /* create workbook and append worksheet */
  const wb = utils.book_new()
  utils.book_append_sheet(wb, ws, 'Data')

  /* export to XLSX */
  writeFileXLSX(wb, 'ParametrosDDJJ.xlsx', {
    compression: true
  })
}

// --- fin de funciones de exportacion
</script>

<style>
.sticky {
  position: sticky !important;
  left: 0 !important;
  min-width: 100px !important;
  z-index: 10 !important;
}
</style>

<template>
  <v-container>
    <v-row>
      <p>
        <b>Parámetros de DDJJ 931</b>
      </p>
    </v-row>
  </v-container>
  <v-container>
    <v-container>
      <v-btn color="primary" prepend-icon="mdi-plus" elevation="3" @click="handleModif(null)"
        >Nuevo rango</v-btn
      >
      <v-btn color="primary" @click="handleDownload" :disabled="!data">Descargar</v-btn>
      <v-btn color="primary" prepend-icon="mdi-close" elevation="3" @click="cerrar()"
        >Cerrar Parámetros</v-btn
      >
    </v-container>
    <div v-if="isPending">loading...</div>
    <div v-else-if="!lecturaListaRegs">Sin datos para mostrar</div>
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
        :headers="listaHeaders"
      >
        <template v-slot:item="{ item }">
          <tr class="pa-0 ma-0">
            <td class="text-center m-0 p-0 sticky">
              <botonTooltip
                :icono="'mdi-pencil'"
                :toolMsg="'Editar'"
                :funcion="handleModif"
                :itemid="item.ID"
              ></botonTooltip>
              <botonTooltip
                :icono="'mdi-delete'"
                :toolMsg="'Eliminar'"
                :funcion="handleEliminar"
                :itemid="item.ID"
              ></botonTooltip>
            </td>
            <td class="text-right m-0 p-0">{{ item.ID }}</td>
            <td class="text-right m-0 p-0">{{ getVto(item.PERIODO) }}</td>
            <td class="text-right m-0 p-0">{{ getVto(item.PERIODOHASTA) }}</td>
            <td class="text-right m-0 p-0">{{ financial(item.JUBMIN) }}</td>
            <td class="text-right m-0 p-0">{{ financial(item.JUBMAX) }}</td>
            <td class="text-right m-0 p-0">{{ financial(item.PORCREP) }}</td>
            <td class="text-right m-0 p-0">{{ financial(item.CONTJUBMAX) }}</td>
            <td class="text-right m-0 p-0">{{ financial(item.CONTJUBPORC) }}</td>
            <td class="text-right m-0 p-0">{{ financial(item.APOSMIN) }}</td>
            <td class="text-center m-0 p-0">{{ financial(item.APOSMAX) }}</td>
            <td class="text-center m-0 p-0">{{ financial(item.CONTOSMIN) }}</td>
            <td class="text-right m-0 p-0">{{ financial(item.CONTOSMAX) }}</td>
          </tr>
        </template>
      </v-data-table>
    </div>
    <div v-else-if="error">No se puede obtener los datos solicitados.</div>
  </v-container>

  <v-dialog v-model="muestraRegistro" max-width="80%" persistent="">
    <ParametrosDDJJ_Vista
      :Registro="itemMostrar"
      :cerrar="cierraForm"
      :funcion="grabarSP"
    ></ParametrosDDJJ_Vista>
  </v-dialog>

  <v-dialog v-model="muestraConfirmacion" max-width="80%" persistent="">
    <confirmacion
      :titulo="'Eliminar registro'"
      :mensaje="'Seguro que desea eliminar el registro?'"
      :cerrar="cierraConfirmacion"
      :aceptar="eliminar"
      :parametro="itemEliminar"
    ></confirmacion>
  </v-dialog>
</template>
