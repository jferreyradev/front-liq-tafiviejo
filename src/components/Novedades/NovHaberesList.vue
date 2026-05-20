<script setup>
import { ref } from 'vue'
import Confirmacion from './Confirmacion.vue'
import { leerDatos, grabarRegistro } from './llamadaAPI'
import botonTooltip from './botonTooltip.vue'
import { getVto, getFechaDMY, financial } from '@/utils/formatos'
import NovHaberesVista from './NovHaberesVista.vue'

const props = defineProps(['setHojaEdicion', 'hojaEditar'])

const hojaEditar = props.hojaEditar

// cerrar editar registros de Hoja
function handleCerrarEdicion() {
  props.setHojaEdicion(null)
}

const listaHeaders = [
  { title: 'Acciones', key: '' },
  { title: 'Nro Rep.', key: 'NROREPARTICION' },
  { title: 'Boleta', key: 'NROBOLETA' },
  { title: 'Afiliado', key: 'NROAFILIADO' },
  { title: 'Cód.', key: 'CODIGO' },
  { title: 'Subcód.', key: 'SUBCODIGO' },
  { title: 'Clase', key: 'CLASE' },
  { title: 'Días', key: 'DIAS' },
  { title: 'Vencimiento', key: 'VENCIMIENTO' },
  { title: 'Importe', key: 'IMPORTE' },
  { title: 'Documento', key: 'DOCUMENTO' },
  { title: 'Apellido', key: 'APELLIDO' },
  { title: 'Nombre', key: 'NOMBRE' },
  { title: '', key: 'NOMBRE' },
  { title: 'Tipo Empleo', key: 'TIPOEMPLEOID' },
  { title: 'Sit. Rev.', key: 'SITUACIONREVISTAID' },
  { title: 'Tipo OS', key: 'TIPOOBRASOCIALID' },
  { title: 'PPP', key: 'PPP' },
  { title: 'Fec. Grab.', key: 'FECHAGRABACION' }
]

// lectura de registros
let isPending = ref(false)
const data = ref(null)
const error = null

const lecturaListaRegs = ref(true)

async function leerListaRegs() {
  isPending.value = true
  const { datos, operacionOk } = await leerDatos('view/novhaberes?HojaId=' + hojaEditar.ID)
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
  if (itemid !== 0 && itemid !== null) item = data.value.find((e) => e.ID == itemid)
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
async function grabar(item) {
  let resultado = false
  if (item.Id == 0) {
    resultado = await grabarRegistro('novhaberes', item, 'POST')
  } else {
    resultado = await grabarRegistro('novhaberes?Id=' + item.ID, item, 'PUT')
  }
  if (resultado.operacionOk) {
    await leerListaRegs()
    alertMensaje.value = 'Los datos se grabaron satisfactoriamente'
    alertTipo.value = 'success'
    mostrarAlert.value = true
    return true
  }
  return false
}

// -------------------------------------------------
</script>

<template>
  <v-container>
    <v-row>
      <p>Hoja Nro: {{ hojaEditar.ID }}</p>
      <p>Tipo: {{ hojaEditar.TIPOHOJADESCRIPCION }}</p>
    </v-row>
  </v-container>
  <v-container>
    <v-container>
      <v-btn color="primary" prepend-icon="mdi-plus" elevation="3" @click="handleModif(null)"
        >Nuevo registro</v-btn
      >
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
        fixed-header
      >
        <template v-slot:item="{ item }">
          <tr class="pa-0 ma-0">
            <td class="text-center m-0 p-0">
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
            <td class="text-right m-0 p-0">{{ item.NROREPARTICION }}</td>
            <td class="text-right m-0 p-0">{{ item.NROBOLETA }}</td>
            <td class="text-right m-0 p-0">{{ item.NROAFILIADO }}</td>
            <td class="text-right m-0 p-0">{{ item.CODIGO }}</td>
            <td class="text-right m-0 p-0">{{ item.SUBCODIGO }}</td>
            <td class="text-right m-0 p-0">{{ item.CLASE }}</td>
            <td class="text-right m-0 p-0">{{ item.DIAS }}</td>
            <td class="text-center m-0 p-0">{{ getVto(item.VENCIMIENTO) }}</td>
            <td class="text-center m-0 p-0">{{ financial(item.IMPORTE) }}</td>
            <td class="text-right m-0 p-0">{{ item.DOCUMENTO }}</td>
            <td class="text-left">{{ item.APELLIDO }}</td>
            <td class="text-left" colspan="2">{{ item.NOMBRE }}</td>
            <td class="text-center m-0 p-0">{{ item.TIPOEMPLEOID }}</td>
            <td class="text-center m-0 p-0">{{ item.SITUACIONREVISTAID }}</td>
            <td class="text-center m-0 p-0">{{ item.TIPOOBRASOCIALID }}</td>
            <td class="text-center m-0 p-0">{{ item.PPP }}</td>
            <td class="text-center m-0 p-0">{{ getFechaDMY(item.FECHAGRABACION) }}</td>
          </tr>
        </template>
      </v-data-table>
    </div>
    <div v-else-if="error">No se puede obtener los datos solicitados.</div>
  </v-container>

  <v-dialog v-model="muestraRegistro" max-width="80%" persistent="">
    <NovHaberesVista
      :Registro="itemMostrar"
      :cerrar="cierraForm"
      :funcion="grabar"
      :hojaId="hojaEditar.ID"
    ></NovHaberesVista>
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
