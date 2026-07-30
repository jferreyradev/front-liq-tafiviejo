import { ref } from 'vue';

const endpoints = {
  prod: {
    boletas: 'https://dno-mid-boletas.jferreyradev.deno.net',
    base: 'https://dno-mid-api-qt3ngtmrrm1y.jferreyradev.deno.net', 
    sp: 'https://dno-mid-boletas.jferreyradev.deno.net'
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
    if (!endpoints.desa) {
      setProd()
      return
    }
    apiBase.value = endpoints.desa.base
    apiBoletas.value = endpoints.desa.boletas
    apiSp.value = endpoints.desa.sp
    env.value = 'Desa'
  }

  return {
    apiBase, apiBoletas, apiSp, setDesa, setProd, env
  };
}
