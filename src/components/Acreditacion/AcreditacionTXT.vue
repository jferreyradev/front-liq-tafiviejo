<script setup>
import { ref } from 'vue'
import { getFechaToAPIFromMMYYYY } from '@/utils/formatos'
import { ejecutarSPStream } from './llamadaAPI'

const props = defineProps(['periodo', 'tipoLiquidacion', 'grupoAdicionalId', 'cantCuotas'])
const emit = defineEmits(['cerrar'])

let cuotasArray = [{ id: 0, descripcion: 'valor Fijo' }]
for (let i = 0; i < props.cantCuotas; i++) {
  cuotasArray.push({ id: i + 1, descripcion: `Cuota ${i + 1}` })
}

const cuota = ref(cuotasArray[0])
const errMensaje = ref(null)

async function DescargaTXTAcred(filtros) {
  const parametros = {
    Periodo: filtros.periodo,
    TipoLiq: filtros.tipoLiquidacionId,
    GrupoAdicional: filtros.grupoAdicionalId,
    Cuotas: 1 //filtros.nrocuota
  }

  const url = 'sp/cursorArchivoBco'
  try {
  const { datos, operacionOk, errmsg } = await ejecutarSPStream(url, parametros)
  if (operacionOk && datos) {
    console.log(datos)
    const urlSalida = window.URL.createObjectURL(datos)
    const a = document.createElement('a')
    a.href = urlSalida
    a.download = `acreditacion_${props.periodo.replace('/', '-')}_cuota_${cuota.value.id}.txt`
    document.body.appendChild(a)
    a.click()
    a.remove()
    window.URL.revokeObjectURL(urlSalida)
    emit('cerrar')
  } else {
    errMensaje.value = errmsg || 'No se pudo generar el archivo de acreditación.'
  }
  }
  catch (error) {
    console.log(error)
  }

}

async function GeneraTXT() {
  errMensaje.value = null // Limpiar errores previos

  const filtros = {
    periodo: getFechaToAPIFromMMYYYY(props.periodo),
    tipoLiquidacionId: props.tipoLiquidacion.value,
    grupoAdicionalId: props.grupoAdicionalId,
    nrocuota: cuota.value.id
  }

  await DescargaTXTAcred(filtros)
}

function Cancelar() {
  emit('cerrar')
}
</script>

<template>
  <v-card>
    <v-card-title v-if="errMensaje" class="bg-warning"> Error: {{ errMensaje }} </v-card-title>
    <v-card-text>
      <v-container>
        <v-row>
          <v-card-text>
            <b>Período:</b> <em>{{ props.periodo }}</em>
          </v-card-text>

          <v-divider></v-divider>
        </v-row>
        <v-row>
          <v-card-text
            ><b>Tipo de Liquidación:</b>
            <em>{{ props.tipoLiquidacion.name }}</em></v-card-text
          >

          <v-divider></v-divider>
        </v-row>
        <v-row>
          <v-card-text>
            <b>Grupo Adicional:</b> <em>{{ props.grupoAdicionalId }}</em>
          </v-card-text>
          <v-divider></v-divider>
        </v-row>

        <v-row>
          <v-card-text>
            <em>Seleccione Cuota o valor fijo</em>
          </v-card-text>
          <v-select
            v-model="cuota"
            :items="cuotasArray"
            item-title="descripcion"
            item-value="id"
            label="Cuota"
            return-object
          >
          </v-select>
        </v-row>
      </v-container>
    </v-card-text>
    <v-card-actions class="d-flex justify-end">
      <v-btn color="success" @click="GeneraTXT">Generar</v-btn>
      <v-btn color="info" @click="Cancelar">Cancelar</v-btn>
    </v-card-actions>
  </v-card>
</template>
