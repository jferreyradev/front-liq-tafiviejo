<script setup>
import { onBeforeMount, ref, computed } from 'vue';
import { useFilterStore } from '@/stores/filterStore.js'

const store = useFilterStore();

const emit = defineEmits(['submit'])
const props = defineProps({
    tipoliq: {
        type: Boolean,
        default: true
    },
    nroadi: {
        type: Boolean,
        default: true
    },
    esley:{
        type: Boolean,
        default:false
    }

})

const liq = [{
    name: 'Mensual',
    value: '1'
}, {
    name: 'Adicional',
    value: '5',
}, {
    name: 'SAC',
    value: '2'
}, {
    name: 'Liq Final',
    value: '21'
}, {
    name: 'Ayuda Escolar',
    value: '10',
    disabled: true
}]

const liqSelected = ref({
    name: 'Mensual',
    value: '1'
})
const nroAdi = ref(0)

const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

/*
const month = ref(months[store.month-1])
const year = ref(store.year)
*/

const month = ref('')
const year = ref('')
const esLey = ref(false)

const esLeyVal = computed(() => {   
  return esLey. value ? 1 : 0
})


onBeforeMount(()=>{
    month.value = months[store.month-1]
    year.value = store.year
})

const handleClick = () => {

    console.log(store.filterString )

    store.tipoliq = liqSelected.value.value
    store.nroadi = nroAdi.value
    store.month = months.indexOf(month.value) + 1
    store.year = year
    store.ley = esLeyVal.value
    
    console.log(store.filterString )
    console.log(store.filterStringLey)

    emit('submit')
}

</script>

<template>
    <v-container>
        <v-row class="pa-0 ma-0">
            <v-col v-if="props.tipoliq" align-self="center" >
                <v-select label="Liquidación" :items="liq" item-title="name" item-value="value" v-model="liqSelected"
                    return-object>
                </v-select>
            </v-col>
            <v-col v-if="props.nroadi">
                <v-text-field label="Nro. Adicional" v-model="nroAdi" required></v-text-field>
            </v-col>
            <v-col>
                <v-select label="Mes" :items="months" v-model="month"></v-select>
            </v-col>
            <v-col>
                <v-text-field label="Año" v-model="year" required type="number"></v-text-field>
            </v-col>
            <v-col  v-if="props.esley" >
                <v-checkbox v-model="esLey" label="Es Ley"></v-checkbox>
            </v-col>
            <v-col>
                <slot></slot>
            </v-col>
            <v-col align-self="center">
                <v-btn color="primary" @click="handleClick">
                    enviar
                </v-btn>
            </v-col>
        </v-row>
    </v-container>
</template>