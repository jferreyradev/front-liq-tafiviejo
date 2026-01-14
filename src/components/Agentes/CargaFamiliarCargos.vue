<script setup>
import { ref } from 'vue'
import { getTipoDescripcion } from '@/utils/formatos'
import { leerDatos } from './llamadaAPI'
import botonTooltip from './botonTooltip.vue'

const props = defineProps(['cerrar', 'funcion', 'personaId'])
let personaId = props.personaId

const listaHeaders = [
  { title: '', key: '' },
  { title: 'Rep', key: 'REPARTICIONID' },
  { title: 'Orden', key: 'ORDEN' },
  { title: 'Afiliado', key: 'AFILIADO' },
  { title: 'Tipo Empleo', key: 'TIPOEMPLEOID' }
]

const mostrarAlert = ref(false)

let mensajeError = ref('')

async function grabaRegistro(idCargo) {
  let registroGrabar = {
    vIDCARGO: idCargo,
    vASIGNA: 1
  }

  console.log('se va a grabar el siguiente registro')
  console.log(JSON.stringify(registroGrabar))
  let resultado = await props.funcion(registroGrabar)

  if (resultado === null) {
    props.cerrar()
  } else {
    mensajeError.value = resultado
    mostrarAlert.value = true
  }
}

// lectura de registros
let isPending = ref(false)
const data = ref(null)
const lecturaListaRegs = ref(true)

async function leerListaRegs() {
  isPending.value = true
  //const { datos, operacionOk } = await leerDatos('view/novAltas?HojaId=' + hojaEditar.ID)
  const { datos, operacionOk } = await leerDatos('view/cargo?TipoLiquidacionId=1&EstadoCargoId=1&PersonaId=' + personaId)
  data.value = datos
  lecturaListaRegs.value = operacionOk
  isPending.value = false
}

leerListaRegs()
</script>

<template>
  <v-card>
    <v-card-title>Carga Familiar</v-card-title>
    <v-card-subtitle> Vincular a un cargo </v-card-subtitle>
    <v-card-text>
      <v-container>
        <div v-if="isPending">loading...</div>
        <div v-else-if="!lecturaListaRegs">Sin datos para mostrar</div>
        <div v-else-if="data">
          <v-alert
            v-model="mostrarAlert"
            border="start"
            close-label="Close Alert"
            color="error"
            icon="$error"
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
                    :toolMsg="'Asociar'"
                    :funcion="grabaRegistro"
                    :itemid="item.ID"
                  ></botonTooltip>
                </td>
                <td class="text-left m-0 p-0">
                  {{ getTipoDescripcion(item.REPARTICIONID, item.REPARTICIONDESCRIPCION) }}
                </td>
                <td class="text-left m-0 p-0">{{ item.ORDEN }}</td>
                <td class="text-left m-0 p-0">{{ item.AFILIADO }}</td>
                <td class="text-center m-0 p-0">
                  {{ getTipoDescripcion(item.TIPOEMPLEOID, item.TIPOEMPLEODESCRIPCION) }}
                </td>
              </tr>
            </template>
          </v-data-table>
        </div>
        <div v-else-if="error">No se puede obtener los datos solicitados.</div>
      </v-container>
    </v-card-text>
    <v-card-actions class="d-flex justify-end">
      <v-btn color="error" elevation="3" outlined @click="cerrar()">Cancelar</v-btn>
    </v-card-actions>
  </v-card>
</template>
