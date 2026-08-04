import { useEndPoints } from './useEndPoints'

function buildUrl(baseUrl, path, query) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  const url = new URL(`${baseUrl}${normalizedPath}`)
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, String(value))
      }
    })
  }
  return url.toString()
}

export function useApiClient() {
  const { apiBase, apiBoletas, apiSp, getBoletasHeaders } = useEndPoints()

  function getBaseUrl(service) {
    if (service === 'boletas') return apiBoletas.value
    if (service === 'sp') return apiSp.value
    return apiBase.value
  }

  async function request({
    service = 'base',
    path = '',
    method = 'GET',
    query,
    headers = {},
    body,
    responseType = 'json',
    options = {}
  }) {
    const url = buildUrl(getBaseUrl(service), path, query)

    const finalHeaders = {
      ...getBoletasHeaders(),
      ...headers
    }

    const requestOptions = {
      method,
      ...options,
      headers: finalHeaders
    }

    if (body !== undefined && body !== null) {
      requestOptions.body = body instanceof FormData ? body : JSON.stringify(body)
    }

    const response = await fetch(url, requestOptions)

    if (!response.ok) {
      const errorBody = await response.text().catch(() => '')
      throw new Error(`HTTP ${response.status} - ${url} ${errorBody}`)
    }

    if (responseType === 'blob') return response.blob()
    if (responseType === 'text') return response.text()
    if (responseType === 'raw') return response
    return response.json()
  }

  function get(params) {
    return request({ ...params, method: 'GET' })
  }

  function post(params) {
    return request({ ...params, method: 'POST' })
  }

  function del(params) {
    return request({ ...params, method: 'DELETE' })
  }

  return { request, get, post, del }
}