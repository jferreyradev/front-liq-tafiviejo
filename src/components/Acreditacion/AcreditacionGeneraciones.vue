<script setup>
import { ref } from 'vue'
import { ejecutarSP } from './llamadaAPI'
import { rules } from '@/utils/reglasValidacion'
import { getFechaToAPIFromMMYYYY } from '@/utils/formatos'

const props = defineProps(['periodo', 'tipoLiquidacion', 'grupoAdicionalId'])
const emit = defineEmits(['cerrar'])

const form = ref(null)
const formOK = ref(false)
const valorFijo = ref(150000)
const cantCuotas = ref(1)
const errMensaje = ref(null)

async function Generar() {
  const { valid } = await form.value.validate()

  if (!valid) {
    return
  }

  const filtros = {
    Periodo: getFechaToAPIFromMMYYYY(props.periodo),
    TipoLiq: props.tipoLiquidacion.value,
    GrupoAdicional: props.grupoAdicionalId,
    ValorFijo: valorFijo.value,
    Cuotas: cantCuotas.value
  }

  let resultado = { valorError: 0, valorSalida: 0 }
  resultado = await ejecutarSP('sp/generaAcredBco', filtros)
  console.log('Resultado de generar acreditación:', resultado)
  console.log(resultado.valorError)
  if (!resultado.operacionOk) {
    errMensaje.value = 'No se pudo generar la acreditación'
    return
  }
  const vError = resultado.valorError? resultado.valorError : resultado.out.ValorError

  if (vError == 0) {
    emit('cerrar',1)
  } else {
    errMensaje.value = 'No se pudo generar la acreditación'
  }
}

function Cancelar() {
  emit('cerrar',0)
}
</script>

<template>
  <v-card>
    <v-card-title v-if="errMensaje" class="bg-warning"> Error: {{ errMensaje }} </v-card-title>
    <v-card-text>
      <v-form ref="form" v-model="formOK">
        <v-container>
          <v-row>
            <v-card-text>
              <b>Período:</b> <em>{{ props.periodo }}</em>
            </v-card-text>
            <v-divider></v-divider>
          </v-row>
          <v-row>
            <v-card-text>
              <b>Tipo de Liquidación:</b> <em>{{ props.tipoLiquidacion.name  }}</em>
            </v-card-text>
            <v-divider></v-divider>
          </v-row>
          <v-row>
            <v-card-text>
              <b>Grupo Adicional:</b> <em>{{ props.grupoAdicionalId }}</em>
            </v-card-text>
            <v-divider></v-divider>
          </v-row>
          <v-row>
            <v-text-field
              label="Valor Fijo"
              v-model="valorFijo"
              type="number"
              :rules="[...rules.required, ...rules.numDecimal]"
            ></v-text-field>
          </v-row>
          <v-row>
            <v-text-field
              label="Cant. Cuotas"
              v-model="cantCuotas"
              type="number"
              :rules="[...rules.required, ...rules.number, (v) => (v >= 1 && v <= 5) || 'Debe ser entre 1 y 5']"
            ></v-text-field>
          </v-row>
        </v-container>
      </v-form>
    </v-card-text>
    <v-card-actions class="d-flex justify-end">
      <v-btn color="success" @click="Generar">Generar</v-btn>
      <v-btn color="info" @click="Cancelar">Cancelar</v-btn>
    </v-card-actions>
  </v-card>
</template>
