<script setup>
const props = defineProps(['titulo', 'mensaje', 'cerrar', 'aceptar', 'parametro'])
</script>

<template>
  <v-container>
    <v-card>
      <v-card-title>{{ props.titulo }}</v-card-title>
      <v-card-text>
        <v-container>
          <v-row>
            <p>{{ props.mensaje }}</p>
          </v-row>
        </v-container>
      </v-card-text>
      <v-card-actions class="d-flex justify-end">
        <v-btn color="primary" elevation="3" outlined @click="props.aceptar(props.parametro)"
          >Aceptar</v-btn
        >
        <v-btn color="error" elevation="3" outlined @click="props.cerrar()">Cancelar</v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>
