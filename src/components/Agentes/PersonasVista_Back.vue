<script setup>
import { ref } from 'vue'
import { getFechaToAPIFromDDMMYYYY, getFechaDMY } from '@/utils/formatos'
import { rules } from '@/utils/reglasValidacion'
import { sexos, estadosCivil, tiposDoc, getObjetList } from '@/utils/tipos'
import LocalidadesList from './LocalidadesList.vue'

const props = defineProps(['Registro', 'cerrar', 'funcion', 'soloLectura'])
let registroOrigen = props.Registro
let registroActual = ref({})
const soloLectura = props.soloLectura

const form = ref(null)
const formOK = ref(false)

const fechaNacimiento = ref(null)
const fechaIngreso = ref(null)

const sexoSelected = ref(sexos[0])
const tipoDocSelected = ref(tiposDoc[0])
const estCivilSelected = ref(estadosCivil[0])

const registroVacio = ref({
  DOCUMENTO: 0,
  APELLIDO: null,
  NOMBRE: null,
  CUIL: 0,
  TELEFONO: null,
  EMAIL: null,
  DOMICILIOCALLE: null,
  DOMICILIONUMERO: null,
  PISO: null,
  DEPARTAMENTO: null,
  CBU: null,
  CUENTA: null
})

if (registroOrigen) {
  registroActual.value = { ...registroOrigen }
  fechaNacimiento.value = getFechaDMY(registroActual.value.FECHANACIMIENTO)
  fechaIngreso.value = getFechaDMY(registroActual.value.FECHAINGRESO)
  tipoDocSelected.value = getObjetList(tiposDoc, registroOrigen.TIPODOCUMENTOID)
  sexoSelected.value = getObjetList(sexos, registroOrigen.SEXO)
  estCivilSelected.value = getObjetList(estadosCivil, registroOrigen.ESTADOCIVILID)
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

  let fecNacimiento = ''
  if (fechaNacimiento.value !== null)
    if (fechaNacimiento.value.length > 0)
      fecNacimiento = getFechaToAPIFromDDMMYYYY(fechaNacimiento.value)

  let fecIngreso = ''
  if (fechaIngreso.value !== null)
    if (fechaIngreso.value.length > 0) fecIngreso = getFechaToAPIFromDDMMYYYY(fechaIngreso.value)

  let registroGrabar = {
    vDNI: registroActual.value.DOCUMENTO,
    vAPELLIDO: registroActual.value.APELLIDO,
    vCUIL: registroActual.value.CUIL,
    vSEXO: sexoSelected.value.value,
    vFECHANAC: fecNacimiento,
    vDOMICILIO: registroActual.value.DOMICILIOCALLE,
    vNRO: registroActual.value.DOMICILIONUMERO,
    vFECHAINGRESO: fecIngreso,
    vTELEFONO: registroActual.value.TELEFONO,
    vEMAIL: registroActual.value.EMAIL,
    vNOMBRE: registroActual.value.NOMBRE,
    vIDTIPODOC: tipoDocSelected.value.value,
    vIDTESTCIVIL: estCivilSelected.value.value,
    vLOCALIDAD_ID: registroActual.value.LOCALIDADID,
    vPISO: registroActual.value.PISO,
    vDPTO: registroActual.value.DEPARTAMENTO,
    vCUENTA: registroActual.value.CUENTA,
    vCBU: registroActual.value.CBU
  }
  if (registroActual.value.ID !== 0) {
    registroGrabar = {
      vIDPERS: registroActual.value.ID,
      ...registroGrabar
    }
  }
  //console.log('ESTE SERIA EL REGISTRO A GRABAR')
  //console.log(JSON.stringify(registroGrabar))
  //return
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

////// seleccionador de localidades
let muestraRegistro = ref(false)

function abrirModal() {
  muestraRegistro.value = true
}

function cierraForm() {
  muestraRegistro.value = false
}

function estableceLocalidad(item) {
  registroActual.value.LOCALIDADID = item.ID
  registroActual.value.LOCALIDADDESCRIPCION = item.DESCRIPCION
  registroActual.value.LOCALIDADCODIGOPOSTAL = item.CP
  registroActual.value.PROVINCIADESCRIPCION = item.PROVINCIADESCRIPCION
  registroActual.value.PAISDESCRIPCION = 'ARGENTINA'
}

////////////////////////////
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
                <v-select
                  label="Tipo Doc."
                  :items="tiposDoc"
                  item-title="name"
                  item-value="value"
                  v-model="tipoDocSelected"
                  return-object
                >
                </v-select>
              </v-col>
              <v-col cols="4">
                <v-text-field
                  v-model="registroActual.DOCUMENTO"
                  hide-details="auto"
                  label="DNI"
                  :rules="[(val) => rules.longitudEntre(val, 8, 9), rules.number]"
                ></v-text-field>
              </v-col>
              <v-col cols="4">
                <v-text-field
                  v-model="registroActual.CUIL"
                  hide-details="auto"
                  label="CUIL"
                  lazy-validation
                  :rules="[(val) => rules.longitudEntre(val, 11, 11), rules.number]"
                ></v-text-field>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="4">
                <v-text-field
                  v-model="registroActual.APELLIDO"
                  hide-details="auto"
                  label="Apellido"
                  lazy-validation
                  :rules="[(val) => rules.longitudMax(val, 50)]"
                ></v-text-field>
              </v-col>
              <v-col cols="4">
                <v-text-field
                  v-model="registroActual.NOMBRE"
                  hide-details="auto"
                  label="Nombre"
                  :rules="[(val) => rules.longitudMax(val, 50)]"
                ></v-text-field>
              </v-col>
              <v-col cols="4">
                <v-select
                  label="Sexo"
                  :items="sexos"
                  item-title="name"
                  item-value="value"
                  v-model="sexoSelected"
                  return-object
                >
                </v-select>
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="4">
                <v-text-field
                  v-model="fechaNacimiento"
                  hide-details="auto"
                  label="Fecha Nac."
                  lazy-validation
                  :rules="[...rules.ddmmyyyy]"
                ></v-text-field>
              </v-col>
              <v-col cols="4">
                <v-text-field
                  v-model="fechaIngreso"
                  hide-details="auto"
                  label="Fecha Ing."
                  lazy-validation
                  :rules="[...rules.ddmmyyyy]"
                ></v-text-field>
              </v-col>
              <v-col cols="4">
                <v-select
                  label="Est. Civil"
                  :items="estadosCivil"
                  item-title="name"
                  item-value="value"
                  v-model="estCivilSelected"
                  return-object
                >
                </v-select>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="6">
                <v-text-field
                  v-model="registroActual.DOMICILIOCALLE"
                  hide-details="auto"
                  label="Calle"
                  lazy-validation
                  :rules="[(val) => rules.longitudMax(val, 100)]"
                ></v-text-field>
              </v-col>
              <v-col cols="2">
                <v-text-field
                  v-model="registroActual.DOMICILIONUMERO"
                  hide-details="auto"
                  label="Número"
                  lazy-validation
                  :rules="[...rules.number]"
                ></v-text-field>
              </v-col>
              <v-col cols="2">
                <v-text-field
                  v-model="registroActual.PISO"
                  hide-details="auto"
                  label="Piso"
                  lazy-validation
                  :rules="[(val) => rules.longitudMax(val, 10)]"
                ></v-text-field>
              </v-col>
              <v-col cols="2">
                <v-text-field
                  v-model="registroActual.DEPARTAMENTO"
                  hide-details="auto"
                  label="Dpto"
                  lazy-validation
                  :rules="[(val) => rules.longitudMax(val, 10)]"
                ></v-text-field>
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="4">
                <v-text-field
                  v-model="registroActual.TELEFONO"
                  hide-details="auto"
                  label="Teléfono"
                  lazy-validation
                  :rules="[(val) => rules.longitudMax(val, 30)]"
                ></v-text-field>
              </v-col>
              <v-col cols="4">
                <v-text-field
                  v-model="registroActual.EMAIL"
                  hide-details="auto"
                  label="EMAIL"
                  lazy-validation
                  :rules="[(val) => rules.longitudMax(val, 100)]"
                ></v-text-field>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="6">
                <v-text-field
                  v-model="registroActual.LOCALIDADDESCRIPCION"
                  hide-details="auto"
                  label="Localidad"
                  lazy-validation
                  readonly
                ></v-text-field>
              </v-col>
              <v-col cols="2">
                <v-btn color="primary" elevation="3" outlined value="grabar" @click="abrirModal()"
                  >Cambiar</v-btn
                >
              </v-col>
              <v-col cols="2">
                <v-text-field
                  v-model="registroActual.LOCALIDADCODIGOPOSTAL"
                  hide-details="auto"
                  label="C. Postal"
                  lazy-validation
                  readonly
                ></v-text-field>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="6">
                <v-text-field
                  v-model="registroActual.PROVINCIADESCRIPCION"
                  hide-details="auto"
                  label="Provincia"
                  lazy-validation
                  readonly
                ></v-text-field>
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model="registroActual.PAISDESCRIPCION"
                  hide-details="auto"
                  label="País"
                  lazy-validation
                  readonly
                ></v-text-field>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="6">
                <v-text-field
                  v-model="registroActual.CBU"
                  hide-details="auto"
                  label="CBU"
                  lazy-validation
                  :rules="[(val) => rules.longitudMax(val, 50), rules.number]"
                ></v-text-field>
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model="registroActual.CUENTA"
                  hide-details="auto"
                  label="Cuenta"
                  lazy-validation
                  :rules="[(val) => rules.longitudMax(val, 50), rules.number]"
                ></v-text-field>
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
  <v-dialog v-model="muestraRegistro" max-width="80%" persistent="">
    <LocalidadesList
      :cerrar="cierraForm"
      :seleccionaLocalidad="estableceLocalidad"
    ></LocalidadesList>
  </v-dialog>
</template>
