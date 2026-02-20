<script setup>
import { ref } from 'vue'
import Confirmacion from './Confirmacion.vue'
import { leerDatos, ejecutarSP } from './llamadaAPI'
import botonTooltip from './botonTooltip.vue'
import { getVto, getFechaDMY } from '@/utils/formatos'
import NovAltasVista from './NovAltasVista.vue'
import { utils, writeFileXLSX } from 'xlsx'
import { agregaTitulosExcel } from '@/utils/reportes.js'
import { getName, estadosNov } from '@/utils/tipos'

const props = defineProps(['setHojaEdicion', 'hojaEditar'])
// prueba de commir en github
const hojaEditar = props.hojaEditar

// cerrar editar registros de Hoja
function handleCerrarEdicion() {
  props.setHojaEdicion(null)
}

const listaHeaders = [
  { title: '', key: '' },
  { title: 'Nro Rep.', key: 'IDREP' },
  { title: 'Boleta', key: 'ORDEN' },
  { title: 'Afiliado', key: 'AFILIADO' },
  { title: 'DNI', key: 'DNI' },
  { title: 'CUIL', key: 'CUIL' },
  { title: 'Apellido', key: 'APELLIDO' },
  { title: 'Nombre', key: 'NOMBRE' },
  { title: 'Sexo', key: 'SEXO' },
  { title: 'TE', key: 'TE' },
  { title: 'Sit. Rev.', key: 'CC' },
  { title: 'Cat.', key: 'CAT' },
  { title: 'Antig.', key: 'ANTIG' },
  { title: 'Vto.', key: 'VTO' },
  { title: 'Titulo', key: 'TITULO' },
  { title: 'Dif. Cat.', key: 'DIFCAT' },
  { title: 'Ap. Jub.', key: 'APJUB' },
  { title: 'Fecha Grab.', key: 'FECHAGRABACION' },
  { title: 'Estado Reg.', key: 'ESTADOREGISTRO' }
]

// lectura de registros
let isPending = ref(false)
const data = ref(null)
const error = null

const lecturaListaRegs = ref(true)

async function leerListaRegs() {
  isPending.value = true
  const { datos, operacionOk } = await leerDatos('view/novAltas?HojaId=' + hojaEditar.ID)
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
  HojaId: 0,
  Id: 0
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
    url = 'sp/NovAltasIns'
  } else {
    url = 'sp/NovAltasUpd'
  }

  const { valorError, valorSalida } = await ejecutarSP(url, item)
  if (valorError == 0) {
    await leerListaRegs()
    alertMensaje.value = 'Se grabó la novedad Nº ' + valorSalida
    alertTipo.value = 'success'
    mostrarAlert.value = true
    return true
  }

  return false
}

async function eliminar(id) {
  muestraConfirmacion.value = false
  let item = {
    vIDNOV: id
  }
  let url = 'sp/NovAltasDel'

  const { valorError } = await ejecutarSP(url, item)
  if (valorError == 0) {
    await leerListaRegs()
    alertMensaje.value = 'Se eliminó la novedad Nº' + id
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
      x.IDREP,
      x.ORDEN,
      x.AFILIADO,
      x.DNI,
      x.CUIL,
      x.APELLIDO,
      x.NOMBRE,
      x.SEXO,
      x.TE,
      x.CC,
      x.CAT,
      x.ANTIG,
      getVto(x.VTO),
      x.TITULO,
      x.DIFCAT,
      x.AJUB,
      getFechaDMY(x.FECHAGRABACION)
    ]
  })

  const titulosTabla = [
    'Rep',
    'Orden',
    'Afiliado',
    'DNI',
    'CUIL',
    'Apellido',
    'Nombre',
    'Sexo',
    'TE',
    'Sit. Rev.',
    'Cat',
    'Antig.',
    'Venc.',
    'Título',
    'Dif. cat.',
    'Ap. Jub.',
    'Fecha Grab.'
  ]
  const filtros = ''
  const tituloReporte = 'Detalle de Hoja Nº: ' + hojaEditar.ID
  agregaTitulosExcel(map1, tituloReporte, filtros, titulosTabla)
  const ws = utils.aoa_to_sheet(map1)

  ws['!cols'] = [
    { wch: 10 },
    { wch: 10 },
    { wch: 10 },
    { wch: 10 },
    { wch: 10 },
    { wch: 20 },
    { wch: 20 },
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
  writeFileXLSX(wb, 'DetalleHoja_' + `${hojaEditar.ID}.xlsx`, {
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
        <b>Hoja Nro:</b> {{ hojaEditar.ID }} - <b>Tipo:</b> {{ hojaEditar.TIPOHOJADESCRIPCION }}
      </p>
    </v-row>
  </v-container>
  <v-container>
    <v-container>
      <v-btn
        v-if="hojaEditar.ESTADOHOJAID != 4 && hojaEditar.ESTADOHOJAID != 6"
        color="primary"
        prepend-icon="mdi-plus"
        elevation="3"
        @click="handleModif(null)"
        >Nuevo registro</v-btn
      >
      <v-btn color="primary" @click="handleDownload" :disabled="!data">Descargar</v-btn>
      <v-btn color="primary" prepend-icon="mdi-close" elevation="3" @click="handleCerrarEdicion()"
        >Volver</v-btn
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
                v-if="hojaEditar.ESTADOHOJAID != 4 && hojaEditar.ESTADOHOJAID != 6"
                :icono="'mdi-pencil'"
                :toolMsg="'Editar'"
                :funcion="handleModif"
                :itemid="item.ID"
              ></botonTooltip>
              <botonTooltip
                v-if="hojaEditar.ESTADOHOJAID != 4 && hojaEditar.ESTADOHOJAID != 6"
                :icono="'mdi-delete'"
                :toolMsg="'Eliminar'"
                :funcion="handleEliminar"
                :itemid="item.ID"
              ></botonTooltip>
            </td>
            <td class="text-right m-0 p-0">{{ item.IDREP }}</td>
            <td class="text-right m-0 p-0">{{ item.ORDEN }}</td>
            <td class="text-right m-0 p-0">{{ item.AFILIADO }}</td>
            <td class="text-right m-0 p-0">{{ item.DNI }}</td>
            <td class="text-right m-0 p-0">{{ item.CUIL }}</td>
            <td class="text-right m-0 p-0">{{ item.APELLIDO }}</td>
            <td class="text-right m-0 p-0">{{ item.NOMBRE }}</td>
            <td class="text-right m-0 p-0">{{ item.SEXO }}</td>
            <td class="text-center m-0 p-0">{{ item.TE }}</td>
            <td class="text-center m-0 p-0">{{ item.CC }}</td>
            <td class="text-center m-0 p-0">{{ item.CAT }}</td>
            <td class="text-right m-0 p-0">{{ item.ANTIG }}</td>
            <td class="text-center m-0 p-0">{{ getVto(item.VTO) }}</td>
            <td class="text-right m-0 p-0">{{ item.TITULO }}</td>
            <td class="text-right m-0 p-0">{{ item.DIFCAT }}</td>
            <td class="text-center m-0 p-0">{{ item.APJUB == 0 ? 'NO' : 'SI' }}</td>
            <td class="text-center m-0 p-0">{{ getFechaDMY(item.FECHAGRABACION) }}</td>
            <td class="text-center m-0 p-0">{{ getName(estadosNov, item.ESTADOREGISTRO) }}</td>
          </tr>
        </template>
      </v-data-table>
    </div>
    <div v-else-if="error">No se puede obtener los datos solicitados.</div>
  </v-container>

  <v-dialog v-model="muestraRegistro" max-width="80%" persistent="">
    <NovAltasVista
      :Registro="itemMostrar"
      :cerrar="cierraForm"
      :funcion="grabarSP"
      :hojaId="hojaEditar.ID"
    ></NovAltasVista>
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
