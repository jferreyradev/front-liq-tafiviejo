<script setup>
import RepoHeader from './RepoHeader.vue'
import { useFilterStore } from '@/stores/filterStore'
import { useEndPoints } from '@/composables/useEndPoints'
import { useFetch } from '@/composables/useFetch'
import { financial,agregaTitulosExcel} from '@/utils/reportes.js'

import { utils, writeFileXLSX } from 'xlsx'

const { apiBase } = useEndPoints()

const store = useFilterStore()

function useResumenAcred(getId) {
  return useFetch(() => `${apiBase.value}/api/view/resumenAcred?${getId()}`)
}

//const { data, error, isPending } = useResumenIPSST(() => store.filterString)

const { data, error, isPending } = useResumenAcred(() => store.filterStringLey )


const getVto = (vto) => {
  if (vto) {
    const d = vto.split('-')
    return `${d[1]}/${d[0]}`
  }
  return null
}
const getPeriodo= (per) => {
  if(per){
    const p=per.split('-')
    return`${p[0]}_${p[1]}`
  }
  return null
}

const headers = [
{
    title: 'Periodo',
    align: 'start',
    key: 'PERIODO'
  },
  {
    title: 'Fecha dev',
    align: 'start',
    key: 'FECHADEV'
  },
  {
    title: 'Importe',
    align: 'end',
    key: 'IMPORTE'
  },
  {
    title: 'Cantidad',
    align: 'end',
    key: 'CANTIDAD'
  },
  {
    title: 'Bloqueo',
    align: 'start',
    key: 'BLOQ'
  },
  {
    title: 'Es Ley',
    align: 'start',
    key: 'ESLEY'
    
  }
]



function exportFile() {
  const map1 = data.value.map((x) => {
    return [
      getVto(x.PERIODO),
      getVto(x.FECHADEV),
      x.IMPORTE,
      x.CANTIDAD,
      x.BLOQ,
      x.ESLEY,
      
    ]
  })

  const titulosTabla = [
    'Periodo',
    'Fecha dev',
    'Importe',
    'Cantidad',
    'Bloqueo',
    'Es Ley'
  ]
  const filtros = store.liqString
  const tituloReporte = 'Resumen Acreditaciones'
  agregaTitulosExcel(map1, tituloReporte, filtros, titulosTabla)
  const ws = utils.aoa_to_sheet(map1)

  ws['!cols'] = [
    { wch: 15 },
    { wch: 15 },
    { wch: 10 },
    { wch: 10 },
    { wch: 25 },
    { wch: 15 }
  ]
  /* create workbook and append worksheet */
  const wb = utils.book_new()
  utils.book_append_sheet(wb, ws, 'Data')

  /* export to XLSX */
  writeFileXLSX(wb, `Resumen_Acred_${getPeriodo(store.periodoString)}.xlsx`, {
    compression: true
  })
}
</script>

<template>
 <v-container>
   <RepoHeader title="Resumen Acreditaciones" :subtitle="store.liqString">
      <v-btn color="primary" :disabled="!data" @click="exportFile" >Descargar</v-btn>
    </RepoHeader>

    <v-row>
      <div v-if="isPending">loading...</div>
      <v-data-table
        v-else-if="data"
        class="text-caption"
        hover
        density="compact"
        :items="data"
        :headers="headers"
        
      >
      <template v-slot:item="{ item }">
          <tr class="pa-0 ma-0">
            <td class="text-right">{{ getVto(item.PERIODO) }}</td>
            <td class="text-left">{{ getVto(item.FECHADEV) }}</td>
            <td class="text-right">{{ financial(item.IMPORTE) }}</td>
            <td class="text-right">{{ item.CANTIDAD }}</td>
            <td class="text-left">{{ item.BLOQ }}</td>
            <td class="text-left">{{ item.ESLEY }}</td>
          </tr>
        </template>
      </v-data-table>      
      <div v-else-if="error">No se puede obtener los datos solicitados.</div>
    </v-row>

  </v-container> 
</template>