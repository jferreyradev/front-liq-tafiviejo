import { useApiClient } from '@/composables/useApiClient'

export async function downloadProtectedFile({
  service = 'base',
  path,
  query,
  filename = 'archivo.bin'
}) {
  const apiClient = useApiClient()
  const blob = await apiClient.get({
    service,
    path,
    query,
    responseType: 'blob'
  })

  const objectUrl = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = objectUrl
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  window.URL.revokeObjectURL(objectUrl)
}
