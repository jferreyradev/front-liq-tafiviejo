import { ref } from 'vue';

const endpoints = {
    desa: {
    boletas: 'https://api-boletas-9jn3t0ca7a3j.deno.dev', 
    base: 'https://midliq-api-hdprsd64qb7n.deno.dev',
    sp: 'https://josrferreyr-deno-api-su-79--desarrollo.deno.dev',
//    boletas: 'httpS://api-boletas-9jn3t0ca7a3j.deno.dev', 
  //  base: 'http://181.87.21.163:3005',
  //  sp: 'http://181.87.21.163:3005',

  },
  prod: {
    boletas: 'https://dno-mid-tafiviejo-boletas.deno.dev',
    base: 'https://dno-mid-tafiviejo.deno.dev', 
    sp: 'https://dno-mid-tafiviejo-boletas.deno.dev'
  }
}

const apiBoletas = ref(endpoints.prod.boletas)
const apiBase = ref(endpoints.prod.base)
const apiSp = ref(endpoints.prod.sp)
const env = ref('Prod')

export function useEndPoints() {

  function setProd() {
    apiBase.value = endpoints.prod.base
    apiBoletas.value = endpoints.prod.boletas
    apiSp.value = endpoints.prod.sp
    env.value = 'Prod'
  }

  function setDesa() {
    apiBase.value = endpoints.desa.base
    apiBoletas.value = endpoints.desa.boletas
    apiSp.value = endpoints.desa.sp
    env.value = 'Desa'
  }

  return {
    apiBase, apiBoletas, apiSp, setDesa, setProd, env
  };
}
