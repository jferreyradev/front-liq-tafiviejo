<script setup>
import { ref } from 'vue'
import { leerDatos } from './llamadaAPI'
import AcreditacionGeneraciones from './AcreditacionGeneraciones.vue'
import AcreditacionTXT from './AcreditacionTXT.vue'
import AcreditacionesDetalle from './AcreditacionesDetalle.vue'
import { getVto } from '@/utils/formatos'
import { tipoLiq } from '@/utils/tipos'
import { rules } from '@/utils/reglasValidacion'

const liquidacionEstablecida = ref(false)
const periodoLiq = ref("")
const tipoLiqSel = ref(tipoLiq[0])
const grupoAdicionalId = ref(0)
const cab = ref(null)
const cantidad = ref(0)

const showGeneracionModal = ref(false)
const showTXTModal = ref(false)

const tab = ref(null)
const filtroCuenta = ref(0)
const form = ref(null)
const formOK = ref(false)

// alerta de grabación o error
const mostrarAlert = ref(false)
const alertMensaje = ref(null)
const alertTipo = ref(null)

// Mock de la función para obtener tipos de liquidación, se puede reemplazar con una llamada a la API

async function EstableceLiq() {
  
  if (form.value) {
  const { valid } = await form.value.validate()

  if (!valid) {
    return
  }
  }
  const periodoCompleto = '01/' + periodoLiq.value
  const url = `view/acredBancoCab?Periodo=${periodoCompleto}&TipoLiquidacionId=${tipoLiqSel.value.value}&GrupoAdicionalId=${grupoAdicionalId.value}`
  const { datos, operacionOk } = await leerDatos(url)
  if (operacionOk && datos && datos.length > 0) {
    cab.value = datos[0]
    leerListaRegsDetalle()

    liquidacionEstablecida.value = true
  } else {
    cab.value = null
    liquidacionEstablecida.value = true
    cantidad.value = 0
  }
}

async function SeleccionarLiq() {
  liquidacionEstablecida.value = false
  cab.value = null
  cantidad.value = 0
}

function GenerarAcreditacion() {

  showGeneracionModal.value = true
}

function ExportaArchivo() {
  if (cantidad.value === 0) {
    console.warn('No existen datos a exportar')
    return
  }

  if (!cab.value) {
    console.warn('No se ha generado la acreditación')
    return
  }
  showTXTModal.value = true
}

function cerrarGeneracionModal(generacion=0) {
  showGeneracionModal.value = false
  if (generacion == 1) {
    EstableceLiq()
    alertMensaje.value = 'Generación Satisfactoria'
    alertTipo.value = 'success'
    mostrarAlert.value = true
  }
}

function cerrarTXTModal() {
  showTXTModal.value = false
}

function setFiltroCuenta(nuevoFiltro) {
  filtroCuenta.value = nuevoFiltro
}

const isPendingDetalle = ref(false)
const dataDetalle = ref(null)
const lecturaListaRegsDetalle = ref(true)

async function leerListaRegsDetalle() {
  isPendingDetalle.value = true
  //const { datos, operacionOk } = await leerDatos('view/novAltas?HojaId=' + hojaEditar.ID)
  const { datos, operacionOk } = await leerDatos('view/acredBancoDet?AcredCabId=' + cab.value.ACREDCABID)
  dataDetalle.value = datos
  lecturaListaRegsDetalle.value = operacionOk
  if (operacionOk && datos) {
    cantidad.value = datos.length
  } else {
    cantidad.value = 0
  }
  isPendingDetalle.value = false
}
</script>

<template>
  <v-container>
    <v-card>
      <v-card-title>
        <h3>Acreditaciones</h3>
      </v-card-title>
      <v-card-text>
        <div v-if="liquidacionEstablecida">
          <v-row>
            <v-col cols="3">
              <v-btn color="info" @click="SeleccionarLiq">Seleccionar Liquidación</v-btn>
            </v-col>
            <v-col cols="3">
              <v-btn color="info" @click="GenerarAcreditacion">Generar acreditación</v-btn>
            </v-col>
            <v-col cols="3">
              <v-btn color="info" v-if="cab" @click="ExportaArchivo">Exportar archivo</v-btn>
            </v-col>
          </v-row>
        </div>
        <div v-else>
          <v-form ref="form" v-model="formOK">
            <h3>Seleccione la liquidación</h3>
            <v-divider></v-divider>
            <v-row>
              <v-col cols="12" md="4">
                <v-text-field
                  v-model="periodoLiq"
                  label="Período"
                  placeholder="(MM/AAAA)"
                  :rules="[...rules.mmyyyy, (val) => rules.longitudEntre(val, 7, 8)]"
                ></v-text-field>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12" md="4">
                <v-select
                  label="Tipo de Liquidación"
                  :items="tipoLiq"
                  item-title="name"
                  item-value="value"
                  v-model="tipoLiqSel"
                  return-object
                ></v-select>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12" md="4">
                <v-text-field v-model="grupoAdicionalId" label="Grupo Adicional"
                :rules="[...rules.number, (val) => rules.longitudEntre(val, 1, 2)]"> </v-text-field>
              </v-col>
            </v-row>
          </v-form>
          <v-row>
            <v-col cols="3">
              <v-btn color="info" @click="EstableceLiq">Establece período</v-btn>
            </v-col>
          </v-row>
        </div>

        <div v-if="liquidacionEstablecida">
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
          <v-tabs v-model="tab" align-tabs="center" color="deep-purple-accent-4">
            <v-tab value="one">Cabecera de Acreditación</v-tab>
            <v-tab value="two">Detalle de Acreditación</v-tab>
          </v-tabs>
          <v-tabs-window v-model="tab">
            <v-tabs-window-item key="1" value="one">
              <div v-if="cab">
                <v-table>
                  <thead>
                    <tr>
                      <th colspan="2" class="text-left">Liquidación</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Período</td>
                      <td>{{ getVto(cab.PERIODO) }}</td>
                    </tr>
                    <tr>
                      <td>Tipo Liquidación</td>
                      <td>{{ tipoLiqSel.name }}</td>
                    </tr>
                    <tr>
                      <td>Grupo Adicional:</td>
                      <td>{{ grupoAdicionalId }}</td>
                    </tr>
                    <tr>
                      <td>Valor Fijo</td>
                      <td>{{ cab.VALORFIJO }}</td>
                    </tr>
                    <tr>
                      <td>Nro. Cuotas</td>
                      <td>{{ cab.CANTCUOTAS }}</td>
                    </tr>
                    <tr>
                      <td>Cantidad de registros generados</td>
                      <td>{{ cantidad }}</td>
                    </tr>
                  </tbody>
                </v-table>
              </div>
              <div v-if="!cab">
                <h3>Aún no se generó la acreditación para ese período/tipo/grupo</h3>
              </div>
            </v-tabs-window-item>
            <v-tabs-window-item key="2" value="two">
              <div v-if="isPendingDetalle">loading...</div>
              <div v-else-if="!lecturaListaRegsDetalle">Sin datos para mostrar</div>
              <div v-else-if="dataDetalle">
                <AcreditacionesDetalle
                  :filtroCuenta="filtroCuenta"
                  :setFiltroCuenta="setFiltroCuenta"
                  :dataDetalle="dataDetalle"
                />
              </div>
            </v-tabs-window-item>
          </v-tabs-window>
        </div>
      </v-card-text>
    </v-card>
  </v-container>

  <v-dialog v-model="showGeneracionModal" max-width="500">
    <AcreditacionGeneraciones
      :periodo="periodoLiq"
      :tipoLiquidacion="tipoLiqSel"
      :grupoAdicionalId="grupoAdicionalId"
      @cerrar="cerrarGeneracionModal"
    />
  </v-dialog>

  <v-dialog v-model="showTXTModal" max-width="500">
    <AcreditacionTXT
      :periodo="periodoLiq"
      :tipoLiquidacion="tipoLiqSel"
      :grupoAdicionalId="grupoAdicionalId"
      :cantCuotas="cab.CantCuotas"
      @cerrar="cerrarTXTModal"
    />
  </v-dialog>
</template>
