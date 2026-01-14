<script setup>
import { ref } from 'vue'
import { getFechaToAPIFromDDMMYYYY, getFechaDMY } from '@/utils/formatos'
import { rules } from '@/utils/reglasValidacion'
import {
  reparticiones,
  tiposEmpleo,
  tipoLiq,
  tiposOS,
  estadosCargo,
  sitRev,
  getObjetList
} from '@/utils/tipos'

const props = defineProps(['Registro', 'cerrar', 'funcion', 'soloLectura'])
let registroOrigen = props.Registro
let registroActual = ref({})
const soloLectura = props.soloLectura

const form = ref(null)
const formOK = ref(false)

const fechaBaja = ref(null)
const vtoEscalafon = ref(null)

const reparticionSelected = ref(reparticiones[0])
const tipoEmpleoSelected = ref(tiposEmpleo[0])
const tipoLiqSelected = ref(tipoLiq[0])
const tipoOSSelected = ref(tiposOS[0])
const estadoCargoSelected = ref(estadosCargo[0])
const sitRevSelect = ref(sitRev[0])
const salario = ref(false)

const registroVacio = ref({
  PERSONAID: 0,
  ORDEN: 0,
  AFILIADO: 0,
  ANTIGUEDAD: 0,
  CATEGORIA: 0,
  SALARIO: 0,
  ID: 0
})

if (registroOrigen) {
  registroActual.value = { ...registroOrigen }
  fechaBaja.value = getFechaDMY(registroActual.value.FECHABAJA)
  vtoEscalafon.value = getFechaDMY(registroActual.value.VTOESCALAFON)
  reparticionSelected.value = getObjetList(reparticiones, registroOrigen.REPARTICIONID)
  tipoEmpleoSelected.value = getObjetList(tiposEmpleo, registroOrigen.TIPOEMPLEOID)
  sitRevSelect.value = getObjetList(sitRev, registroOrigen.SITUACIONREVISTAID)
  estadoCargoSelected.value = getObjetList(estadosCargo, registroOrigen.ESTADOCARGOID)
  tipoOSSelected.value = getObjetList(tiposOS, registroOrigen.TIPOOBRASOCIALID)
  tipoLiqSelected.value = getObjetList(tipoLiq, registroOrigen.TIPOLIQUIDACIONID)
  salario.value = registroOrigen.SALARIO === 1
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

  // si es esposa/o coloca valores predeterminados en campos de hijo

  //

  let fecBaja = ''
  if (fechaBaja.value !== null)
    if (fechaBaja.value.length > 0) fecBaja = getFechaToAPIFromDDMMYYYY(fechaBaja.value)

  let vtoEsc = ''
  if (vtoEscalafon.value !== null)
    if (vtoEscalafon.value.length > 0) vtoEsc = getFechaToAPIFromDDMMYYYY(vtoEscalafon.value)

  let registroGrabar = {
    vIDREP: reparticionSelected.value.value,
    vORDEN: registroActual.value.ORDEN,
    vAFILIADO: registroActual.value.AFILIADO,
    vANTIG: registroActual.value.ANTIGUEDAD,  
    vVTOESC: vtoEsc,
    vIDTE: tipoEmpleoSelected.value.value,
    vIDSITREV: sitRevSelect.value.value,
    vIDTIPOOS: tipoOSSelected.value.value,
    vCATEGORIA: registroActual.value.CATEGORIA,
    vIDTIPOLIQ: tipoLiqSelected.value.value,
    vIDESTADOCARGO: estadoCargoSelected.value.value,
    vFECHABAJA: fecBaja
  }
  if (registroActual.value.ID !== 0) {
    registroGrabar = {
      vIDCARGO: registroActual.value.ID,
      ...registroGrabar
    }
  }


  //console.log(JSON.stringify(registroGrabar))
  let resultado = await props.funcion(registroGrabar, registroActual.value.ID)

  if (resultado === null) {
    props.cerrar()
  } else {
    mensajeError.value = resultado
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
        <v-card-title>Detalle del Cargo</v-card-title>
        <v-card-subtitle>
          {{ registroActual.ID == 0 ? 'Agregar ' : 'Datos del Cargo' }}
        </v-card-subtitle>
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
              <v-col cols="4">
                <v-text-field
                  v-model="registroActual.PERSONADOCUMENTO"
                  hide-details="auto"
                  label="DNI"
                  readonly
                ></v-text-field>
              </v-col>
              <v-col cols="4">
                <v-text-field
                  v-model="registroActual.PERSONAAPELLIDO"
                  hide-details="auto"
                  label="Apellido"
                  lazy-validation
                  readonly
                ></v-text-field>
              </v-col>
              <v-col cols="4">
                <v-text-field
                  v-model="registroActual.PERSONANOMBRE"
                  hide-details="auto"
                  label="Nombre"
                  lazy-validation
                  readonly
                ></v-text-field>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="6">
                <v-select
                  label="Reparticion"
                  :items="reparticiones"
                  item-title="name"
                  item-value="value"
                  v-model="reparticionSelected"
                  return-object
                  :readonly="soloLectura"
                >
                </v-select>
              </v-col>
              <v-col cols="3">
                <v-text-field
                  v-model="registroActual.ORDEN"
                  hide-details="auto"
                  label="Orden"
                  lazy-validation
                  :rules="[(val) => rules.longitudEntre(val, 1, 7), rules.number]"
                  :readonly="soloLectura"
                ></v-text-field>
              </v-col>
              <v-col cols="3">
                <v-text-field
                  v-model="registroActual.AFILIADO"
                  hide-details="auto"
                  label="Afiliado"
                  lazy-validation
                  :rules="[(val) => rules.longitudEntre(val, 1, 7), rules.number]"
                  :readonly="soloLectura"
                ></v-text-field>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="4">
                <v-select
                  label="Tipo Empleo"
                  :items="tiposEmpleo"
                  item-title="name"
                  item-value="value"
                  v-model="tipoEmpleoSelected"
                  return-object
                  :readonly="soloLectura"
                >
                </v-select>
              </v-col>
              <v-col cols="4">
                <v-text-field
                  v-model="vtoEscalafon"
                  hide-details="auto"
                  label="Vto. Escalafón"
                  lazy-validation
                  :rules="[...rules.ddmmyyyy]"
                  :readonly="soloLectura"
                ></v-text-field>
              </v-col>
              <v-col cols="4">
                <v-text-field
                  v-model="registroActual.ANTIGUEDAD"
                  hide-details="auto"
                  label="Antigüedad"
                  lazy-validation
                  :rules="[(val) => rules.longitudEntre(val, 1, 2), rules.number]"
                  :readonly="soloLectura"
                ></v-text-field>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="4">
                <v-select
                  label="Sit. Revista"
                  :items="sitRev"
                  item-title="name"
                  item-value="value"
                  v-model="sitRevSelect"
                  return-object
                  :readonly="soloLectura"
                >
                </v-select>
              </v-col>
              <v-col cols="4">
                <v-text-field
                  v-model="registroActual.CATEGORIA"
                  hide-details="auto"
                  label="Categoría"
                  lazy-validation
                  :rules="[(val) => rules.longitudEntre(val, 1, 2), rules.number]"
                  :readonly="soloLectura"
                ></v-text-field>
              </v-col>
              <v-col cols="4">
                <v-text-field
                  v-model="fechaBaja"
                  hide-details="auto"
                  label="Fecha Baja"
                  lazy-validation
                  :rules="[...rules.ddmmyyyy]"
                  :readonly="soloLectura"
                ></v-text-field>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="4">
                <v-select
                  label="Estado Cargo"
                  :items="estadosCargo"
                  item-title="name"
                  item-value="value"
                  v-model="estadoCargoSelected"
                  return-object
                  :readonly="soloLectura"
                >
                </v-select>
              </v-col>
              <v-col cols="4">
                <v-select
                  label="Tipo OS"
                  :items="tiposOS"
                  item-title="name"
                  item-value="value"
                  v-model="tipoOSSelected"
                  return-object
                  :readonly="soloLectura"
                >
                </v-select>
              </v-col>
              <v-col cols="4">
                <v-select
                  label="Tipo Liq."
                  :items="tipoLiq"
                  item-title="name"
                  item-value="value"
                  v-model="tipoLiqSelected"
                  return-object
                  :readonly="soloLectura"
                >
                </v-select>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="4">
                <v-checkbox
                  v-model="salario"
                  color="primary"
                  label="Salario"
                  hide-details
                  readonly
                ></v-checkbox>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions class="d-flex justify-end">
          <v-btn
            v-if="!soloLectura"
            color="primary"
            elevation="3"
            outlined
            value="grabar"
            @click="grabaRegistro()"
            >Grabar</v-btn
          >
          <v-btn color="error" elevation="3" outlined @click="cerrar()">Cerrar</v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-container>
</template>
