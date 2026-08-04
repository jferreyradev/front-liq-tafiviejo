import { ref } from 'vue'

const endpoints = {
  prod: {
    boletas: 'https://TU-BOLETAS-ENDPOINT',
    base: 'https://TU-BASE-ENDPOINT',
    sp: 'https://TU-SP-ENDPOINT'
  },
  desa: {
    boletas: 'https://TU-BOLETAS-ENDPOINT-DESA',
    base: 'https://TU-BASE-ENDPOINT-DESA',
    sp: 'https://TU-SP-ENDPOINT-DESA'
  }
}

const apiBoletas = ref(endpoints.prod.boletas)
const apiBase = ref(endpoints.prod.base)
const apiSp = ref(endpoints.prod.sp)
const env = ref('Prod')

export function useEndPoints() {
  function getBoletasHeaders() {
    return {
      'Content-Type': 'application/json',
      'x-project-key': 'TU_PROJECT_KEY',
      'x-project-port': 'TU_PROJECT_PORT'
    }
  }

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
    apiBase,
    apiBoletas,
    apiSp,
    env,
    setProd,
    setDesa,
    getBoletasHeaders
  }
}
