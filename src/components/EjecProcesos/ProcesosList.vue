<script setup>
import { ref } from 'vue'
//import Confirmacion from './Confirmacion.vue'
import { leerDatos } from './llamadaAPI'
import { leerDatos_Tunel} from '@/utils/API_Tunel.js'

const props = defineProps(['cerrar'])

const headers = [
  { title: 'ID', key: 'ID' },
  { title: 'Estado', key: 'ESTADO' },
  { title: 'Procedimiento', key: 'PROCEDIMIENTO' },
  { title: 'Inicio', key: 'INICIO' },
  { title: 'Fin', key: 'FIN' },
  { title: 'Parámetros', key: 'PARAMETROS' },
  { title: 'Tipo', key: 'TIPO' }
]

// lectura de registros
let isPending = ref(false)
const data = ref(null)
const error = null

const lecturaRegistros = ref(true)

async function leerRegistros(filtro = null) {
  /*data.value = null
  let url = 'view/logProcesos?sort={"Id":"DESC"}'
  if (filtro !== null) url = url + '&' + filtro

  console.log(url)
  
  const { datos, operacionOk } = await leerDatos(url)
  data.value = datos
  lecturaRegistros.value = operacionOk
  
*/
isPending.value = true  
const salida = await leerDatos_Tunel(
    {"query": "SELECT * from VW_LogProc"}
  )
  if (salida.estado == 200)  data.value = salida.datos.results
    else lecturaRegistros.value = false

  console.log(salida)
isPending.value = false
}



leerRegistros()
</script>

<template>
  <v-card>
    <v-card-title>
      Estado de Procesos
    </v-card-title>
    <v-card-text>
      <v-container>
        <div v-if="isPending">loading...</div>
        <div v-else-if="!lecturaRegistros">Error al intentar recibir los datos</div>
        <div v-else-if="data.length > 0">
          <v-data-table
            class="text-caption"
            hover
            density="compact"
            :items="data"
            :headers="headers"
          >
            <template v-slot:item="{ item }">
              <tr class="pa-0 ma-0">
                <td class="text-right m-0 p-0">{{ item.ID }}</td>
                <td class="text-left m-0 p-0" :class="{ 'text-red': item.ESTADO === 'Cancelado' }">
                  {{ item.ESTADO }}
                </td>
                <td class="text-left m-0 p-0">{{ item.PROCEDIMIENTO }}</td>
                <td class="text-left m-0 p-0">{{ item.INICIO }}</td>
                <td class="text-left m-0 p-0">{{ item.FIN }}</td>
                <td class="text-left m-0 p-0">{{ item.PARAMETROS }}</td>
                <td class="text-center m-0 p-0">{{ item.TIPO }}</td>
              </tr>
            </template>
          </v-data-table>
        </div>
        <div v-else>Sin datos para mostrar</div>
        <div v-if="error">No se puede obtener los datos solicitados.</div>
      </v-container>
    </v-card-text>
    <v-card-actions class="d-flex justify-end">
      <v-btn color="primary" elevation="3" outlined @click="leerRegistros()">Refrescar</v-btn>
      <v-btn color="error" elevation="3" outlined @click="props.cerrar()">Cerrar</v-btn>
    </v-card-actions>
  </v-card>
</template>
