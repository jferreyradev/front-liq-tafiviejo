<script setup>
import { ref } from 'vue'
const prop = defineProps(['icono', 'toolMsg', 'funcion', 'itemid'])
const show = ref(false)
</script>

<template>
  <v-tooltip v-model="show" location="top">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        size="x-small"
        :icon="prop.icono"
        @click="prop.funcion(prop.itemid)"
        color="primary"
      ></v-btn>
    </template>
    <span>{{ prop.toolMsg }}</span>
  </v-tooltip>
</template>
