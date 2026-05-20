<script setup>
import { onMounted, ref } from 'vue'
import { getDecimalToAPI, getFechaToAPIFromMMYYYY, getVto } from '@/utils/formatos'
import { leerDatos } from './llamadaAPI'
import { rules } from '@/utils/reglasValidacion'
import { financial } from '@/utils/reportes'


async function obtieneVtoActual() {
  const url = 'en/periodo?Activo=1'

  try {
    const { datos, operacionOk } = await leerDatos(url)

    if (!operacionOk || !Array.isArray(datos) || datos.length === 0) {
      console.warn('⚠ No se pudo obtener VTO actual, usando valor por defecto')
      return '' // o algún valor por defecto, ej: getVto('01/2025')
    }

    const valor = datos[0]
    return getVto(valor.PERIODO) || ''
  } catch (error) {
    console.error('Error obteniendo VTO actual:', error)
    return ''
  }
}

const props = defineProps(['Registro', 'cerrar', 'funcion', 'cargoId'])
let registroOrigen = props.Registro
let cargoId = props.cargoId
let registroActual = ref({})
const vtoActual = ref()

onMounted(async () => {
  const valor = await obtieneVtoActual()
  vtoActual.value = valor

  if (!registroOrigen) {
    registroActual.value = registroVacio.value
    periodo.value = valor
  }
})

const form = ref(null)
const formOK = ref(false)

const vencimiento = ref(null)
const periodo = ref('')

//const escolaridadSelected = ref(tipoEscolaridad[0])
//const relacionFamiliarSelected = ref(tipoRelacionFamiliar[0])

const registroVacio = ref({
  CODIGO: 0,
  SUBCODIGO: 0,
  PARAMETRO1: 0,
  PARAMETRO2: 0,
  IMPORTE: 0,
  GRUPOADICIONALID: 0,
  PENLEY: 0,
  ID: 0
})

if (registroOrigen) {
  registroActual.value = { ...registroOrigen }
  vencimiento.value = getVto(registroActual.value.VENCIMIENTO)
  periodo.value = getVto(registroActual.value.PERIODO)
  registroActual.value.PENLEY = registroOrigen.PENLEY == 1
  registroActual.value.IMPORTE = financial(registroOrigen.IMPORTE)
} //else {
 // registroActual.value = registroVacio.value
  //periodo.value = getVtoActual()
 // periodo.value = vtoActual.value
//}

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

  //

  let fecVencimiento = ''
  if (vencimiento.value !== null)
    if (vencimiento.value.length > 0) fecVencimiento = getFechaToAPIFromMMYYYY(vencimiento.value)

  let fecPeriodo = ''
  if (periodo.value !== null)
    if (periodo.value.length > 0) fecPeriodo = getFechaToAPIFromMMYYYY(periodo.value)

  let registroGrabar = {
    vIDCARGO: cargoId,
    vCODIGO: registroActual.value.CODIGO,
    vSUBCOD: registroActual.value.SUBCODIGO,
    vPARM1: registroActual.value.PARAMETRO1,
    vPARM2: registroActual.value.PARAMETRO2,
    vVTO: fecVencimiento,
    vIMPORTE: getDecimalToAPI(registroActual.value.IMPORTE),
    //vIMPORTE: getDecimalToAPI(registroActual.value.IMPORTE),
    vPERIODO: fecPeriodo,
    vIDGRUPOADI: registroActual.value.GRUPOADICIONALID,
    vPENLEY: registroActual.value.PENLEY ? 1 : 0
  }
  if (registroActual.value.ID !== 0) {
    registroGrabar = {
      vIDCONCEPTOLIQ: registroActual.value.ID,
      ...registroGrabar
    }
  }

  console.log('se va a grabar el siguiente registro')
  console.log(JSON.stringify(registroGrabar))
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
        <v-card-title>Concepto de Liquidación</v-card-title>
        <v-card-subtitle>
          {{ registroActual.ID == 0 ? 'Agregar ' : 'Modificar' }}
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
              <v-col cols="6">
                <v-text-field
                  v-model="registroActual.CODIGO"
                  hide-details="auto"
                  label="Código"
                  :rules="[...rules.number, (val) => rules.longitudEntre(val, 1, 4)]"
                ></v-text-field>
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model="registroActual.SUBCODIGO"
                  hide-details="auto"
                  label="Subcódigo"
                  lazy-validation
                  :rules="[...rules.number, (val) => rules.longitudEntre(val, 1, 3)]"
                ></v-text-field>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="6">
                <v-text-field
                  v-model="registroActual.PARAMETRO1"
                  hide-details="auto"
                  label="Parámetro 1"
                  :rules="[...rules.number, (val) => rules.longitudEntre(val, 1, 4)]"
                ></v-text-field>
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model="registroActual.PARAMETRO2"
                  hide-details="auto"
                  label="Parámetro 2"
                  lazy-validation
                  :rules="[...rules.number, (val) => rules.longitudEntre(val, 1, 3)]"
                ></v-text-field>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="4">
                <v-text-field
                  v-model="vencimiento"
                  hide-details="auto"
                  label="Fec. Vto."
                  lazy-validation
                  :rules="[...rules.mmyyyy]"
                ></v-text-field>
              </v-col>
              <v-col cols="4">
                <v-text-field
                  v-model="registroActual.IMPORTE"
                  hide-details="auto"
                  label="Importe"
                  lazy-validation
                  :rules="[...rules.numDecimal]"
                ></v-text-field>
              </v-col>
              <v-col cols="4">
                <v-text-field
                  v-model="periodo"
                  hide-details="auto"
                  label="Período"
                  lazy-validation
                  :rules="[...rules.mmyyyy, (val) => rules.longitudEntreONull(val, 6, 7)]"
                ></v-text-field>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="6">
                <v-text-field
                  v-model="registroActual.GRUPOADICIONALID"
                  hide-details="auto"
                  label="Grupo Adic."
                  :rules="[...rules.number, (val) => rules.longitudEntre(val, 1, 2)]"
                ></v-text-field>
              </v-col>
              <v-col cols="6">
                <v-checkbox
                  v-model="registroActual.PENLEY"
                  color="primary"
                  label="Pen. Ley."
                  hide-details
                ></v-checkbox>
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
