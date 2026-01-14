<script setup>
import { ref } from 'vue'
import Confirmacion from './Confirmacion.vue'
import { leerDatos, ejecutarSP } from './llamadaAPI'
import botonTooltip from './botonTooltip.vue'
import { getFechaDMY, getTipoDescripcion } from '@/utils/formatos'
import CargaFamiliarVista from './CargaFamiliarVista.vue'
import { utils, writeFileXLSX } from 'xlsx'
import { agregaTitulosExcel } from '@/utils/reportes.js'
import CargaFamiliarCargos from './CargaFamiliarCargos.vue'

const props = defineProps(['setPersonaEdicion', 'personaEditar'])
// prueba de commir en github
const personaEditar = props.personaEditar

// cerrar editar registros de Hoja
function handleCerrarEdicion() {
  props.setPersonaEdicion(null, 0)
}

const listaHeaders = [
  { title: '', key: '' },
  { title: 'DNI', key: 'DOCUMENTO' },
  { title: 'Ape. y Nom.', key: 'APELLIDOYNOMBRE' },
  { title: 'Relacion', key: 'TIPORELACIONDESCRIPCION' },
  { title: 'Fec. Nac.', key: 'FECHANACIMIENTO' },
  { title: 'Escolaridad', key: 'TIPOESCOLARIDADDESCRIPCION' },
  { title: 'Grado', key: 'GRADO' },
  { title: 'Discapacitado', key: 'DISCAPACITADO' }
]

// lectura de registros
let isPending = ref(false)
const data = ref(null)
const error = null

const lecturaListaRegs = ref(true)

async function leerListaRegs() {
  isPending.value = true
  //const { datos, operacionOk } = await leerDatos('view/novAltas?HojaId=' + hojaEditar.ID)
  const { datos, operacionOk } = await leerDatos(
    'en/cargaFamiliar?PersonaId=' + personaEditar.PERSONAID
  )
  data.value = datos
  lecturaListaRegs.value = operacionOk
  isPending.value = false
}

// lectura de cargo asociado
const cargoAsociado = ref({
  cargoId: 0,
  descripcion: ''
})

async function leerCargoAsoc() {
  let resultado = {
    cargoId: 0,
    descripcion: 'No se pudieron establecer obtener datos del cargo'
  }
  //const { datos, operacionOk } = await leerDatos('view/novAltas?HojaId=' + hojaEditar.ID)
  const { datos, operacionOk } = await leerDatos(
    'en/cargo?PersonaId=' + personaEditar.PERSONAID + '&Salario=1'
  )
  if (operacionOk === true) {
    if (datos == null) resultado.descripcion = 'No hay cargo asociado aún para el salario'
    else {
      let cargoAsoc = datos[0]
      resultado.cargoId = cargoAsoc.ID
      resultado.descripcion = 'Rep.: ' + cargoAsoc.REPARTICIONID + ' - Orden: ' + cargoAsoc.ORDEN + ' - Tipo: ' +getTipoDescripcion(cargoAsoc.TIPOEMPLEOID, cargoAsoc.TIPOEMPLEODESCRIPCION)
    }
  }
  cargoAsociado.value = resultado
}

leerListaRegs()
leerCargoAsoc()

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

//  confirmaciones
const itemEliminar = ref(0)
let muestraConfirmacion = ref(false)
const itemDesasociar = ref(0)
let muestraConfAsociar = ref(false)

function cierraConfirmacion() {
  muestraConfirmacion.value = false
}
function cierraConfAsociar() {
  muestraConfAsociar.value = false
}


function handleEliminar(itemid) {
  mostrarAlert.value = false
  itemEliminar.value = itemid
  muestraConfirmacion.value = true
}

function handleDesasociar(itemid) {
  mostrarAlert.value = false
  itemDesasociar.value = itemid
  muestraConfAsociar.value = true
}


// apertura y cierre del formulario modal
let muestraRegistro = ref(false)
let muestraListaCargos = ref(false)

function abrirModal(item) {
  itemMostrar.value = item
  muestraRegistro.value = true
}

function cierraForm() {
  muestraRegistro.value = false
}

function abrirModalCargos() {
  muestraListaCargos.value = true
}

function cierraFormCargos() {
  muestraListaCargos.value = false
}

// funciones de agregado, modificación y eliminación
async function grabarSP(item, id) {
  let mensajeError = 'No se pudieron grabar los datos'
  let url = ''
  if (id == 0) {
    url = 'sp/CargaFamIns'
  } else {
    url = 'sp/CargaFamUpd'
  }

  const { operacionOk, datos } = await ejecutarSP(url, item)
  if (operacionOk) {
    if (datos.out.vError == 0) {
      await leerCargoAsoc()
      await leerListaRegs()
      alertMensaje.value = 'Se grabó el registro '
      alertTipo.value = 'success'
      mostrarAlert.value = true
      return null
    }
    mensajeError = datos.out.vErrorMsg
  }

  return mensajeError
}

async function eliminar(id) {
  muestraConfirmacion.value = false
  let item = {
    vIDCARFAM: id
  }
  let url = 'sp/CargaFamDel'
  console.log(item)
  const { datos, operacionOk } = await ejecutarSP(url, item)

  if (operacionOk) {
    if (datos.out.vError == 0) {
      await leerListaRegs()
      alertMensaje.value = 'Se eliminó el registro'
      alertTipo.value = 'success'
      mostrarAlert.value = true
      return true
    }
  }

  alertMensaje.value = 'No se pudo eliminar el registro'
  alertTipo.value = 'error'
  mostrarAlert.value = true
  return true
}

// funciones de agregado, modificación y eliminación
async function grabarSPCargos(item) {
  let mensajeError = 'No se pudieron grabar los datos'
  let url = ''
  url = 'sp/AsignaSalario'

  const { operacionOk, datos } = await ejecutarSP(url, item)
  if (operacionOk) {
    if (datos.out.vError == 0) {
      await leerCargoAsoc()
      alertMensaje.value = 'Se actualizó la asignación de cargo '
      alertTipo.value = 'success'
      mostrarAlert.value = true

      return null
    }
    mensajeError = datos.out.vErrorMsg
  }

  return mensajeError
}

async function desasociarCargo(idCargo) {
  muestraConfAsociar.value = false
  let registroGrabar = {
    vIDCARGO: idCargo,
    vASIGNA: 0
  }

  let resultado = await grabarSPCargos(registroGrabar)

  if (resultado !== null) {
    alertMensaje.value = 'No se pudo actualizar la asignación de cargo '
    alertTipo.value = 'error'
    mostrarAlert.value = true
  }
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
      x.DOCUMENTO,
      x.APELLIDOYNOMBRE,
      x.TIPORELACIONDESCRIPCION,
      getFechaDMY(x.FECHANACIMIENTO),
      x.TIPOESCOLARIDADDESCRIPCION,
      x.GRADO,
      x.DISCAPACITADO
    ]
  })

  const titulosTabla = [
    'DNI',
    'Apellido y Nombre',
    'Relación',
    'Fec. Nac.',
    'Tipo Escolaridad',
    'Grado',
    'Disc.'
  ]
  const filtros = ''
  const tituloReporte =
    'Cargas de Familia: ' + personaEditar.DNI + ' - ' + personaEditar.APELLIDOYNOMBRE
  agregaTitulosExcel(map1, tituloReporte, filtros, titulosTabla)
  const ws = utils.aoa_to_sheet(map1)

  ws['!cols'] = [
    { wch: 10 },
    { wch: 20 },
    { wch: 10 },
    { wch: 10 },
    { wch: 10 },
    { wch: 20 },
    { wch: 20 }
  ]
  /* create workbook and append worksheet */
  const wb = utils.book_new()
  utils.book_append_sheet(wb, ws, 'Data')

  /* export to XLSX */
  writeFileXLSX(wb, 'CargaFamilia_' + `${personaEditar.ID}.xlsx`, {
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
    <v-container>
      <v-row>
        <v-col cols="2"><div>Cargo Asociado:</div></v-col>
        <v-col cols="5"
          ><div>{{ cargoAsociado.descripcion }}</div></v-col
        >
        <v-col cols="5">
          <v-btn color="blue" @click="abrirModalCargos" :disabled="!data">Asociar cargo</v-btn>
          <v-btn
            v-if="cargoAsociado.cargoId !== 0"
            color="teal"
            @click="handleDesasociar(cargoAsociado.cargoId)"
            :disabled="!data"
            >Desvincular de cargo</v-btn
          >
        </v-col>
      </v-row>
      <v-row>
        <v-btn color="primary" prepend-icon="mdi-plus" elevation="3" @click="handleModif(null)"
          >Agregar</v-btn
        >
        <v-btn color="primary" @click="handleDownload" :disabled="!data">Descargar</v-btn>
        <v-btn color="primary" prepend-icon="mdi-close" elevation="3" @click="handleCerrarEdicion()"
          >Volver</v-btn
        >
      </v-row>
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
            <td class="text-right m-0 p-0">{{ item.DOCUMENTO }}</td>
            <td class="text-left m-0 p-0">{{ item.APELLIDOYNOMBRE }}</td>
            <td class="text-left m-0 p-0">{{ item.TIPORELACIONDESCRIPCION }}</td>
            <td class="text-center m-0 p-0">
              {{ item.TIPORELACIONID == 2 ? getFechaDMY(item.FECHANACIMIENTO) : '' }}
            </td>
            <td class="text-left m-0 p-0">
              {{ item.TIPORELACIONID == 2 ? item.TIPOESCOLARIDADDESCRIPCION : '' }}
            </td>
            <td class="text-center m-0 p-0">{{ item.TIPORELACIONID == 2 ? item.GRADO : '' }}</td>
            <td class="text-center m-0 p-0">
              {{ item.TIPORELACIONID == 2 ? (item.DISCAPACITADO === 1 ? 'SI' : 'NO') : '' }}
            </td>
          </tr>
        </template>
      </v-data-table>
    </div>
    <div v-else-if="error">No se puede obtener los datos solicitados.</div>
  </v-container>

  <v-dialog v-model="muestraRegistro" max-width="80%" persistent="">
    <CargaFamiliarVista
      :Registro="itemMostrar"
      :cerrar="cierraForm"
      :funcion="grabarSP"
      :personaId="personaEditar.PERSONAID"
    ></CargaFamiliarVista>
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

  <v-dialog v-model="muestraConfAsociar" max-width="80%" persistent="">
    <confirmacion
      :titulo="'Desasociar cargo'"
      :mensaje="'Seguro que desea desasociar el cargo de salario?'"
      :cerrar="cierraConfAsociar"
      :aceptar="desasociarCargo"
      :parametro="itemDesasociar"
    ></confirmacion>
  </v-dialog>


  <v-dialog v-model="muestraListaCargos" max-width="80%" persistent="">
    <CargaFamiliarCargos
      :cerrar="cierraFormCargos"
      :funcion="grabarSPCargos"
      :personaId="personaEditar.PERSONAID"
    ></CargaFamiliarCargos>
  </v-dialog>
</template>
