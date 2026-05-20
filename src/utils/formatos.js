export function financial(x) {
  return x !== null ? Number.parseFloat(x).toFixed(2) : null
}

export const getVto = (vto) => {
  if (vto) {
    const d = vto.split('-')
    return `${d[1]}/${d[0]}`
  }
  return null
}

export const getFechaDMY = (vto) => {
  if (vto) {
    const d = vto.substring(0, 10).split('-')
    return `${d[2]}/${d[1]}/${d[0]}`
  }
  return null
}

export const getVtoActual = () => {
  const fecha = new Date()
  const mes = fecha.getMonth() + 1
  const anio = fecha.getFullYear()
  let resultado = mes + '/' + anio
  if (mes < 10) resultado = '0' + resultado
  return resultado
}

export const validaMMYYYY = (vto) => {
  if (vto.length < 6 || vto.length > 7) return 'Formato inválido'
  const d = vto.split('/')
  console.log(d)
  if (d.length < 2) return 'Formato inválido'
  if (d[0] < 1 || d[0] > 12) return 'Formato de Mes inválido'
  console.log(d[0])
  if (d[1] < 2020 || d[1] > 2060) return 'Formato de Año inválido'
  console.log(d[1])
  return null
}

export const getPeriodoFromMMYYYY = (periodo) => {
  const d = periodo.split('/')
  let fecha = '01/' + d[0] + '/' + d[1]
  return fecha
}

export const getFechaToAPIFromMMYYYY = (periodo) => {
  const d = periodo.split('/')
  let fecha = d[1] + '-' + d[0] + '-01' + 'T03:00:00.000Z'
  return fecha
}

export const getFechaToAPIFromDDMMYYYY = (fechaOrigen) => {
  const d = fechaOrigen.split('/')
  let fecha = d[2] + '-' + d[1] + '-' + d[0] + 'T03:00:00.000Z'
  return fecha
}

export const getTipoDescripcion = (id, descripcion, forma = 1) => {
  if (forma === 1) return '(' + id + ') ' + descripcion
  if (forma === 2) return id + ' - ' + descripcion
  return id
}

export const getDecimalToAPI = (valor) => {
  let nuevoValor = valor
  if (valor !== null) {
    if (typeof valor === 'string') {
      let valorFormateado = valor.replace(',', '.')
      nuevoValor = Number(valorFormateado)
    }
  }

  return nuevoValor
}
