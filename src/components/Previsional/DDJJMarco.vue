<script setup>
import { ref } from 'vue'
import { rules } from '@/utils/reglasValidacion'
import LiquidacionesDDJJ from './LiquidacionesDDJJ.vue'
import DDJJResumenDJ from './DDJJResumenDJ.vue'


const periodoActivoLeyenda = ref('Sin definir')
const periodo = ref(null)
const periodoActivo = ref(null)
const tab = ref(null)

function definirPeriodoActivo(nuevoPeriodo) {
  if (nuevoPeriodo == null) {
    periodoActivoLeyenda.value = 'Sin definir'
    periodoActivo.value = null
  } else {
    periodoActivoLeyenda.value = nuevoPeriodo
    periodoActivo.value = nuevoPeriodo
  }
}

</script>

<template>
  <v-container>
    <v-row>
      <h3>Declaración Jurada Previsional - {{ periodoActivoLeyenda }}</h3>
    </v-row>
    <v-row v-if="periodoActivo === null">
      <v-col cols="3">
        <v-text-field v-model="periodo" hide-details="auto" label="Período" :rules="rules.mmyyyy">
        </v-text-field>
      </v-col>
      <v-col cols="2">
        <v-btn color="primary" @click="definirPeriodoActivo(periodo)">Establecer</v-btn>
      </v-col>
    </v-row>
    <v-row v-if="periodoActivo !== null">
      <v-col cols="4">
        <v-btn color="primary" @click="definirPeriodoActivo(null)">Cambiar de período</v-btn>
      </v-col>
    </v-row>

    <v-card v-if="periodoActivo !== null">
      <v-tabs v-model="tab" align-tabs="center" color="deep-purple-accent-4">
        <v-tab value="one">Liquidaciones</v-tab>
        <v-tab value="two">Declaración Jurada</v-tab>
      </v-tabs>

      <v-card-text>
        <v-tabs-window v-model="tab">
          <v-tabs-window-item key=1 value="one">
          <LiquidacionesDDJJ :periodo="periodoActivo"></LiquidacionesDDJJ>
        </v-tabs-window-item>
        <v-tabs-window-item key=2 value="two"> 
          <DDJJResumenDJ :periodo="periodoActivo"></DDJJResumenDJ>
        </v-tabs-window-item>
        </v-tabs-window>
      </v-card-text>

    </v-card>
  </v-container>
</template>
