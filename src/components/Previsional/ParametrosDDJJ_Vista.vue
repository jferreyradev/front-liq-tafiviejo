<script setup>
import { ref } from 'vue'
import { getVto, getVtoActual, getFechaToAPIFromMMYYYY, getDecimalToAPI } from '@/utils/formatos'
import { rules } from '@/utils/reglasValidacion'

const props = defineProps(['Registro', 'cerrar', 'funcion'])
let registroOrigen = props.Registro
let registroActual = ref({})

const form = ref(null)
const formOK = ref(false)

const periodo = ref(getVtoActual())
const periodo_hasta = ref(null)

const registroVacio = ref({
  JUBMIN: 0,
  JUBMAX: 0,
  PORCREP: 11,
  CONTJUBMAX: 0,
  CONTJUBPORC: 10.17,
  APOSMIN: 0,
  APOSMAX: 0,
  CONTOSMIN: 0,
  CONTOSMAX: 0,
  ID: 0
})

if (registroOrigen) {
  registroActual.value = { ...registroOrigen }
  periodo.value = getVto(registroOrigen.PERIODO)
  periodo_hasta.value = getVto(registroOrigen.PERIODOHASTA)
} else {
  registroActual.value = registroVacio.value
}

const mostrarAlert = ref(false)

let mensajeError = ref('')

async function grabaRegistro() {
  const isValid = await form.value.validate()

  if (!isValid) {
    return
  }
  if (formOK.value === false) {
    return
  }
  mostrarAlert.value = false
  if (!validarRegistro()) {
    mostrarAlert.value = true
    return
  }
  let vto = ''
  if (periodo_hasta.value != null) {
    if (periodo_hasta.value.length > 0) vto = getFechaToAPIFromMMYYYY(periodo_hasta.value)
  }

  let registroGrabar = {
    vPERIODO: getFechaToAPIFromMMYYYY(periodo.value),
    vPERIODO_HASTA: vto,
    vAPJUB_MIN: getDecimalToAPI(registroActual.value.JUBMIN),
    vAPJUB_MAX: getDecimalToAPI(registroActual.value.JUBMAX),
    vAPJUB_PORC: getDecimalToAPI(registroActual.value.PORCREP),
    vCONTJUB_MAX: getDecimalToAPI(registroActual.value.CONTJUBMAX),
    vCONTJUB_PORC: getDecimalToAPI(registroActual.value.CONTJUBPORC),
    vAPOS_MIN: getDecimalToAPI(registroActual.value.APOSMIN),
    vAPOS_MAX: getDecimalToAPI(registroActual.value.APOSMAX),
    vCONTOS_MIN: getDecimalToAPI(registroActual.value.CONTOSMIN),
    vCONTOS_MAX: getDecimalToAPI(registroActual.value.CONTOSMAX)
  }
  if (registroActual.value.ID !== 0) {
    registroGrabar = {
      vID: registroActual.value.ID,
      ...registroGrabar
    }
  }
  console.log(registroGrabar)
  let resultgrabar = await props.funcion(registroGrabar, registroActual.value.ID)

  if (resultgrabar=== 'OK') {
    props.cerrar()
  } else {
    mensajeError.value = resultgrabar
    mostrarAlert.value = true
  }
}

function validarRegistro() {
  return true
}
</script>

<template>
  <v-container>
    <v-card>
      <v-form ref="form" v-model="formOK">
        <v-card-title>Parámetros de DDJJ</v-card-title>
        <v-alert
          v-model="mostrarAlert"
          border="start"
          close-label="Close Alert"
          color="error"
          icon="$error"
          closable
        >
          {{ mensajeError }}
        </v-alert>
        <v-card-text>
          <v-container style="height: 60vh; overflow-y: scroll">
            <v-row>
              <v-col cols="6">
                <v-text-field
                  v-model="periodo"
                  hide-details="auto"
                  label="desde"
                  :rules="[...rules.mmyyyy, (val) => rules.longitudEntre(val, 1, 7)]"
                >
                </v-text-field>
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model="periodo_hasta"
                  hide-details="auto"
                  label="hasta"
                  :rules="rules.mmyyyy"
                >
                </v-text-field>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="4">
                <v-text-field
                  v-model="registroActual.JUBMIN"
                  hide-details="auto"
                  label="Ap. Jub. Mín"
                  :rules="[...rules.numDecimal, (val) => rules.longitudMin(val, 1)]"
                ></v-text-field>
              </v-col>
              <v-col cols="4">
                <v-text-field
                  v-model="registroActual.JUBMAX"
                  hide-details="auto"
                  label="Ap. Jub. Máx."
                  :rules="[...rules.numDecimal, (val) => rules.longitudMin(val, 1)]"
                ></v-text-field>
              </v-col>
              <v-col cols="4">
                <v-text-field
                  v-model="registroActual.PORCREP"
                  hide-details="auto"
                  label="Ap. Jub. %"
                  :rules="[...rules.numDecimal, (val) => rules.longitudMin(val, 1)]"
                ></v-text-field>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="4">
                <v-text-field
                  v-model="registroActual.CONTJUBMAX"
                  hide-details="auto"
                  label="Contr. Jub. Máx."
                  :rules="[...rules.numDecimal, (val) => rules.longitudMin(val, 1)]"
                ></v-text-field>
              </v-col>
              <v-col cols="4">
                <v-text-field
                  v-model="registroActual.CONTJUBPORC"
                  hide-details="auto"
                  label="Contr. Jub. Porc"
                  :rules="[...rules.numDecimal, (val) => rules.longitudMin(val, 1)]"
                ></v-text-field>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="4">
                <v-text-field
                  v-model="registroActual.APOSMIN"
                  hide-details="auto"
                  label="Ap. OS. Mín."
                  :rules="[...rules.numDecimal, (val) => rules.longitudMin(val, 1)]"
                ></v-text-field>
              </v-col>
              <v-col cols="4">
                <v-text-field
                  v-model="registroActual.APOSMAX"
                  hide-details="auto"
                  label="Ap. OS. Máx."
                  :rules="[...rules.numDecimal, (val) => rules.longitudMin(val, 1)]"
                ></v-text-field>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="4">
                <v-text-field
                  v-model="registroActual.CONTOSMIN"
                  hide-details="auto"
                  label="Contr. OS. Mín."
                  :rules="[...rules.numDecimal, (val) => rules.longitudMin(val, 1)]"
                ></v-text-field>
              </v-col>
              <v-col cols="4">
                <v-text-field
                  v-model="registroActual.CONTOSMAX"
                  hide-details="auto"
                  label="Contr. Jub. Máx."
                  :rules="[...rules.numDecimal, (val) => rules.longitudMin(val, 1)]"
                ></v-text-field>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions class="d-flex justify-end">
          <v-btn color="primary" elevation="3" outlined value="grabar" @click="grabaRegistro()"
            >Grabar</v-btn
          >
          <v-btn color="error" elevation="3" outlined @click="cerrar()">Cancelar</v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-container>
</template>
