<script setup>
import { ref, onMounted } from 'vue'
import { tipoLiq } from '@/utils/tipos'
import { getVto, getFechaToAPIFromMMYYYY } from '@/utils/formatos'
import { rules } from '@/utils/reglasValidacion'
import { leerDatos, ejecutarSP } from './llamadaAPI'

// tipos
const tiposProceso = [
  { name: 'Transformar', value: 1 },
  { name: 'Liquidar', value: 2 }
]

const formasLiquidar = [
  { name: 'Grupo de Rep.', value: 1 },
  { name: 'DNI de persona', value: 2 }
]

const form = ref(null)
const formOK = ref(false)

const gruposRep = [{ name: 'Municipios', value: 1 }]
const valorListaErroneo = [{ name: 'Sin Datos', value: -1 }]
const tipoProcesoSelected = ref(tiposProceso[0])
const formaLiquidarSelected = ref(formasLiquidar[0])
const tipoLiqSelected = ref(tipoLiq[0])
const periodo = ref('')
const adicional = ref(0)

const grupoRepSelected = ref(gruposRep[0])
const reparticiones = ref(valorListaErroneo)
const repSelected = ref(valorListaErroneo[0])

const dni = ref(0)
const dni_old = ref(0)
const apeynom = ref(0)
const personaId = ref(0)

async function obtieneApellidoYNombre() {
  console.log('entrando a ver')
  if (dni.value == dni_old.value) return
  dni_old.value = dni.value
  personaId.value = 0
  apeynom.value = 'El DNI ingresado no corresponde a un agente'
  const url = 'en/persona?Documento=' + dni.value

  try {
    const { datos, operacionOk } = await leerDatos(url)

    if (!operacionOk || !Array.isArray(datos) || datos.length === 0) {
      personaId.value = 0
      apeynom.value = 'El DNI ingresado no corresponde a un agente'
      return
    }

    let persona = datos[0]  
    personaId.value = persona.ID
    apeynom.value = persona.APELLIDO
    return 
  } catch (error) {
      personaId.value = 0
      apeynom.value = 'No se pudo consultar el DNI'
    return 
  }

}

// alerta de grabación o error
const mostrarAlert = ref(false)
const alertMensaje = ref(null)
const alertTipo = ref('success')
let mensajeError = ref('')

async function obtieneReparticiones() {
  const url = 'en/reparticion'

  let valor = valorListaErroneo
  try {
    const { datos, operacionOk } = await leerDatos(url)

    if (!operacionOk || !Array.isArray(datos) || datos.length === 0) {
      console.warn('No se pudieron obtener las reparticiones')
      return valorListaErroneo
    }

    valor = datos.map((item) => {
      return { name: item.DESCRIPCION, value: item.ID }
    })
    valor.unshift({ name: 'Todas', value: 0 })
    return valor
  } catch (error) {
    console.error('Error obteniendo reparticiones:', error)
    return valorListaErroneo
  }
}
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

onMounted(async () => {
  const [listaRep, vto] = await Promise.all([obtieneReparticiones(), obtieneVtoActual()])

  // Ahora podés usar todos los valores:
  reparticiones.value = listaRep
  repSelected.value = listaRep[0]
  periodo.value = vto
})

function onTipoProcesoChange() {
  // Cada vez que cambia el Proceso, asigno el primer item de formasLiquidar
  formaLiquidarSelected.value = formasLiquidar[0]
}

async function EjecutarAccion() {
  const isValid = await form.value.validate()

  if (!isValid) {
    return
  }
  if (formOK.value === false) {
    return
  }


    alertMensaje.value = 'Se grabó la persona'
    alertTipo.value = 'error'
    mostrarAlert.value = true
  return
  if (tipoProcesoSelected.value == 1) Transformar()
  if (tipoProcesoSelected.value == 2) Liquidar()


}

async function Transformar() {
  let item = {
    Periodo: getFechaToAPIFromMMYYYY(periodo.value),
    GrupoRep: grupoRepSelected.value,
    TipoLiq: tipoLiqSelected.value,
    GrupoAdicional: adicional.value
  } 
  let url = 'sp/persUpd'

  const { valorError, errorMsg } = await ejecutarSP(url, item)
  if (valorError == 0) {
    alertMensaje.value = 'Se grabó la persona'
    alertTipo.value = 'success'
    mostrarAlert.value = true
    return null
  }
  
  return errorMsg
}

async function Liquidar() {
  return
}



</script>
<template>
  <v-container>
    <v-card>
      <v-form ref="form" v-model="formOK">
        <v-card-title>Procesos de Liquidación</v-card-title>
        <v-card-subtitle> Procesos </v-card-subtitle>
        <v-alert
          v-model="mostrarAlert"
          border="start"
          close-label="Close Alert"
          :color="alertTipo"
          :icon="'$'+alertTipo"
          closable
        >
          {{ alertMensaje }}
        </v-alert>
        <v-card-text>
          <v-container style="height: 60vh; overflow-y: scroll">
            <v-row>
              <v-col cols="6">
                <v-select
                  label="Proceso"
                  :items="tiposProceso"
                  item-title="name"
                  item-value="value"
                  v-model="tipoProcesoSelected"
                  return-object
                  @update:modelValue="onTipoProcesoChange"
                >
                </v-select>
              </v-col>
              <v-col cols="6">
                <v-select
                  label="Tipo Liq."
                  :items="tipoLiq"
                  item-title="name"
                  item-value="value"
                  v-model="tipoLiqSelected"
                  return-object
                >
                </v-select>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="6">
                <v-text-field
                  v-model="periodo"
                  hide-details="auto"
                  label="Período"
                  lazy-validation
                  :rules="[...rules.mmyyyy, (val) => rules.longitudEntre(val, 6, 7)]"
                ></v-text-field>
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model="adicional"
                  hide-details="auto"
                  label="Nro. Adicional"
                  :rules="[...rules.number, (val) => rules.longitudEntre(val, 1, 2)]"
                ></v-text-field>
              </v-col>
            </v-row>
            <v-row v-if="tipoProcesoSelected.value == 2">
              <v-col cols="6">
                <v-select
                  label="Forma de Liquidar"
                  :items="formasLiquidar"
                  item-title="name"
                  item-value="value"
                  v-model="formaLiquidarSelected"
                  return-object
                >
                </v-select>
              </v-col>
            </v-row>
            <v-row v-if="formaLiquidarSelected.value == 1">
              <v-col cols="6">
                <v-select
                  label="Grupo de Reparticiones"
                  :items="gruposRep"
                  item-title="name"
                  item-value="value"
                  v-model="grupoRepSelected"
                  return-object
                >
                </v-select>
              </v-col>

              <v-col v-if="tipoProcesoSelected.value == 2" cols="6">
                <v-select
                  label="Repartición"
                  :items="reparticiones"
                  item-title="name"
                  item-value="value"
                  v-model="repSelected"
                  return-object
                >
                </v-select>
              </v-col>
            </v-row>

            <v-row v-if="formaLiquidarSelected.value == 2">
              <v-col cols="2">
                <v-text-field
                  v-model="dni"
                  hide-details="auto"
                  label="DNI"
                  @blur="obtieneApellidoYNombre"
                  @keydown.enter="obtieneApellidoYNombre"
                  :rules="[...rules.number, (val) => rules.longitudEntreONull(val, 8, 9)]"
                ></v-text-field>
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model="apeynom"
                  hide-details="auto"
                  label="Apellido y Nombre"
                  readonly
                ></v-text-field>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions class="d-flex justify-end">
          <v-btn color="primary" elevation="3" outlined value="Ejecutar" @click="EjecutarAccion()"
            > {{ tipoProcesoSelected.name }} </v-btn
          >
          <v-btn color="error" elevation="3" outlined @click="cerrar()">Cerrar</v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-container>
</template>
