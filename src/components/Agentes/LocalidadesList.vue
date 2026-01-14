<script setup>
import { ref } from 'vue'
import { getTipoDescripcion } from '@/utils/formatos'
import { leerDatos } from './llamadaAPI'
import botonTooltip from './botonTooltip.vue'
import { rules } from '@/utils/reglasValidacion'

const props = defineProps(['cerrar', 'seleccionaLocalidad'])

const listaHeaders = [
  { title: '', key: '' },
  { title: 'Nombre', key: 'DESCRIPCION' },
  { title: 'Provincia', key: 'PROVINCIADESCRIPCION' }
]

async function grabaRegistro(itemid) {
  let item = null
  if (itemid != null) if (itemid !== 0) item = data.value.find((e) => e.ID == itemid)
  props.seleccionaLocalidad(item)
  props.cerrar()
}

// lectura de registros
let isPending = ref(false)
const data = ref(null)
const lecturaListaRegs = ref(true)
const codPostal = ref(0)

async function leerListaRegs() {
  isPending.value = true
  //const { datos, operacionOk } = await leerDatos('view/novAltas?HojaId=' + hojaEditar.ID)
  let url = 'en/localidad?CP=' + codPostal.value + '&sort={"Descripcion":"asc"}'
  const { datos, operacionOk } = await leerDatos(url)
  data.value = datos
  lecturaListaRegs.value = operacionOk
  isPending.value = false
}
</script>

<template>
  <v-card>
    <v-card-title>Buscador de Localidades</v-card-title>
    <v-card-text>
      <v-container>
        <v-row>
          <v-col cols="3"> Ingrese el Código Postal </v-col>
          <v-col cols="2">
            <v-text-field
              v-model="codPostal"
              hide-details="auto"
              label="Cód. Postal"
              lazy-validation
              :rules="[(val) => rules.longitudEntre(val, 1, 5), rules.number]"
            ></v-text-field>
          </v-col>
          <v-col cols="2">
            <v-btn color="green" elevation="3" outlined @click="leerListaRegs()">Buscar</v-btn>
          </v-col>
        </v-row>

        <div v-if="isPending">loading...</div>
        <div v-else-if="!lecturaListaRegs">Sin datos para mostrar</div>
        <div v-else-if="data">
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
                    :toolMsg="'Seleccionar'"
                    :funcion="grabaRegistro"
                    :itemid="item.ID"
                  ></botonTooltip>
                </td>
                <td class="text-left m-0 p-0">{{ item.DESCRIPCION }}</td>
                <td class="text-left m-0 p-0">{{ item.PROVINCIADESCRIPCION }}</td>
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
