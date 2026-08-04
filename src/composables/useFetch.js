import { watchEffect, ref } from 'vue'
import { useEndPoints } from './useEndPoints'

export function useFetch(getUrl, getOptions = () => ({})) {
    const data = ref(null)
    const error = ref(null)
    const isPending = ref(true)

    const { getBoletasHeaders } = useEndPoints()

    watchEffect(() => {
      isPending.value = true
      data.value = null
      error.value = null
  
      console.log('fetch ', getUrl())

      const userOptions = getOptions() || {}
      const options = {
        ...userOptions,
        headers: {
          ...getBoletasHeaders(),
          ...(userOptions.headers || {})
        }
      }

      fetch(getUrl(), options)
        .then((res) => res.json())
        .then((_data) => {
          data.value = _data
          isPending.value = false
        })
        .catch((err) => {
          error.value = err
          isPending.value = false
        })
    })
    return {
      data,
      error,
      isPending
    }
  }