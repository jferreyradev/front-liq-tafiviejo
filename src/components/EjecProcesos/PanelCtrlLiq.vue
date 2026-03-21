<script setup>
import { ref, onMounted } from 'vue'
import { tipoLiq } from '@/utils/tipos'
import { getVto, getFechaToAPIFromMMYYYY } from '@/utils/formatos'
import { rules } from '@/utils/reglasValidacion'
import { leerDatos, ejecutarSP_SinEspera } from './llamadaAPI'
import ProcesosList from './ProcesosList.vue'

// tipos
const tiposProceso = [
  { name: 'Transformar', value: 1 },
  { name: 'Liquidar', value: 2 },
  { name: 'Generar Boletas', value: 3 }
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
  let ejecucionOK = { resultado: 'OK', mensaje: '' }
  if (!isValid) {
    return
  }
  if (formOK.value === false) {
    return
  }

  if (tipoProcesoSelected.value.value == 1) ejecucionOK = await Transformar()
  if (tipoProcesoSelected.value.value == 2) ejecucionOK = await Liquidar()
  if (tipoProcesoSelected.value.value == 3) ejecucionOK = await GenBoletas()

  if (ejecucionOK.resultado == 0) {
    alertTipo.value = 'success'
  } else {
    alertTipo.value = 'error'
  }
  alertMensaje.value = ejecucionOK.mensaje
  mostrarAlert.value = true
}

async function Transformar() {
  let resultado = 0
  let mensaje = 'Enviado a Transformar'
  let item = {
    Periodo: getFechaToAPIFromMMYYYY(periodo.value),
    GrupoRep: grupoRepSelected.value.value,
    TipoLiq: tipoLiqSelected.value.value,
    GrupoAdicional: adicional.value
  }
  let url = 'sp/transform'

  const { salida } = await ejecutarSP_SinEspera(url, item)
  if (salida !== 0) {
    resultado = -1
    mensaje = 'No se pudo enviar a transformar'
  } else {
    await new Promise((resolve) => setTimeout(resolve, 1000))
    verProcesos()
  }

  return { resultado: resultado, mensaje: mensaje }
}

async function Liquidar() {
  let resultado = 0
  let mensaje = ''
  let idPers = 0
  let grupoRep = 0
  let rep = 0
  if (formaLiquidarSelected.value.value == 1) {
    if (repSelected.value.value === 0) {
      grupoRep = grupoRepSelected.value.value
      mensaje = 'Enviado a liquidar por grupo de repartición'
    } else {
      rep = repSelected.value.value
      mensaje = 'Enviado a liquidar por repartición'
    }
  } else if (personaId.value == 0) {
    return { resultado: 'ERROR', mensaje: 'Debe ingresar un DNI válido' }
  } else {
    idPers = personaId.value
    mensaje = 'Enviado a liquidar por DNI de la persona'
  }

  let item = {
    Periodo: getFechaToAPIFromMMYYYY(periodo.value),
    GrupoRep: grupoRep,
    Rep: rep,
    IdPersona: idPers,
    CargoId: 0,
    TipoLiq: tipoLiqSelected.value.value,
    GrupoAdicional: adicional.value
  }
  let url = 'sp/liq'

  console.log (item)

  const { salida } = await ejecutarSP_SinEspera(url, item)
  if (salida !== 0) {
    resultado = -1
    mensaje = 'No se pudo enviar a liquidar'
  } else {
    
    await new Promise((resolve) => setTimeout(resolve, 1000))
    verProcesos()
  }

  return { resultado: resultado, mensaje: mensaje }
}

async function GenBoletas() {
  let resultado = 0
  let mensaje = 'Enviado a Generar Boletas'
  let item = {
    Idliq: 0,
    Periodo: getFechaToAPIFromMMYYYY(periodo.value),
    TipoLiquidacionId: tipoLiqSelected.value.value,
    GrupoAdicionalId: adicional.value,
    GrupoRep: grupoRepSelected.value.value,
    Rep: 0
  }
  let url = 'sp/generaResumenLiq'

  const { salida } = await ejecutarSP_SinEspera(url, item)
  if (salida !== 0) {
    resultado = -1
    mensaje = 'No se pudo enviar a generar las boletas'
  }
  mostrarAlert.value = true

  return { resultado: resultado, mensaje: mensaje }
}

// Muestra procesos
let muestraRegistro = ref(false)

function verProcesos() {
  muestraRegistro.value = true
}

function cierraVerProcesos() {
  muestraRegistro.value = false
}
</script>
<template>
  <v-container>
    <v-card>
      <v-form ref="form" v-model="formOK">
        <v-card-title>
          <v-row>
            <v-col cols="6">
              Procesos de Liquidación
            </v-col>
            <v-col cols="6">
              <v-btn color="success" elevation="3" outlined @click="verProcesos"
                >Ver estado de procesos...</v-btn
              >
            </v-col>
          </v-row>
          
          </v-card-title>
        <v-alert
          v-model="mostrarAlert"
          border="start"
          close-label="Close Alert"
          :color="alertTipo"
          :icon="'$' + alertTipo"
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
          <v-btn color="primary" elevation="3" outlined value="Ejecutar" @click="EjecutarAccion()">
            {{ tipoProcesoSelected.name }}
          </v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-container>
  <v-dialog v-model="muestraRegistro" max-width="80%" persistent="">
    <ProcesosList :cerrar="cierraVerProcesos"></ProcesosList>
  </v-dialog>
</template>
