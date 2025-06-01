<script setup>
import { ref } from 'vue'
import RepoHeader from './RepoHeader.vue'
import { useFilterStore } from '@/stores/filterStore'
import { useEndPoints } from '@/composables/useEndPoints'
import { useFetch } from '@/composables/useFetch'


const preview = ref(false)


const { apiBase } = useEndPoints()

const store = useFilterStore()

function printData() {
  let largeString = ""
  for (let index = 0; index < data.value.length; index++) {
    const element = data.value[index];

    largeString += element.CADENA + '\n'
  }

  console.log(largeString)
  //downloadTxt(largeString,data.value[0].NOMBREARCHIVO)
  downloadAcred()
}

const getTxtFromAPI = async (url) => {
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      // Asegúrate de que este encabezado sea compatible con la API
      'Content-Type': 'text/plain'
    }
  })
  if (!response.ok) {
    return null
  }
  const datos = await response.blob()
  const urlSalida = window.URL.createObjectURL(datos)
  return urlSalida
}

const getPeriodo= (per) => {
  if(per){
    const p=per.split('-')
    return`${p[0]}_${p[1]}`
  }
  return null
}

async function downloadAcred() {

  const url = `${apiBase.value}/api/txt/archivoAcred?${store.filterStringLey}`

  const urlDescarga = await getTxtFromAPI(url)

  if (urlDescarga == null) {

    return
  }

  const a = document.createElement('a')
  a.href = urlDescarga
  a.download = `Acreditaciones_${getPeriodo(store.periodoString)}`; //data.value[0].NOMBREARCHIVO // Nombre con el que se descargará el archivo
  document.body.appendChild(a)
  a.click() // Simula el clic para iniciar la descarga
  a.remove() // Elimina el enlace del DOM
  window.URL.revokeObjectURL(urlDescarga) // Limpia la URL creada
}

/*const downloadTxt = (contenido, nombre) => {
    const a = document.createElement("a");
    const archivo = new Blob([contenido], { type: 'text/plain' });
    const url = URL.createObjectURL(archivo);
    a.href = url;
    a.download = nombre;
    a.click();
    URL.revokeObjectURL(url);
}*/




function useResumenAcred(getId) {
  return useFetch(() => `${apiBase.value}/api/view/archivoAcred?${getId()}`)
}

const { data, error, isPending } = useResumenAcred(() => store.filterStringLey)

const headers = [
  {
    title: 'CADENA',
    align: 'start',
    key: 'CADENA'
  }
]
</script>

<template>
  <v-container>
    <RepoHeader title="Archivo Acreditaciones">
      <v-btn color="primary" :disabled="!data" @click="preview = !preview">Previsualizar</v-btn>
      <v-btn color="primary" :disabled="!data" @click="printData">Descargar</v-btn>
    </RepoHeader>

    <v-row v-if="preview">
      <div v-if="isPending">loading...</div>
      <v-data-table v-else-if="data" class="text-caption" hover density="compact" :items="data" :headers="headers">
      </v-data-table>
      <div v-else-if="error">No se puede obtener los datos solicitados.</div>
    </v-row>

    <!-- 
    <v-row>
      <div v-if="isPendingRes">loading...</div>
      <v-data-table
        v-else-if="dataRes"
        class="text-caption"
        hover
        density="compact"
        :items="dataRes"
      >
      </v-data-table>      
      <div v-else-if="errorRes">No se puede obtener los datos solicitados.</div>

    </v-row>
     -->
  </v-container>
</template>
