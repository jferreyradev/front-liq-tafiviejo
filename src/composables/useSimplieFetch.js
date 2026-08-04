import { ref } from 'vue'
import { useEndPoints } from './useEndPoints'

export function useFetch(url) {
  const data = ref(null)
  const error = ref(null)
  const isPending = ref(true)

  const { getBoletasHeaders } = useEndPoints()

  console.log('fetch ', url)

  fetch(url, { headers: getBoletasHeaders() })
    .then((res) => res.json())
    .then((json) => {
      data.value = json
      isPending.value = false
    })
    .catch((err) => {
      error.value = err
      isPending.value = false
    })

  return {
    data,
    error,
    isPending
  }
}
