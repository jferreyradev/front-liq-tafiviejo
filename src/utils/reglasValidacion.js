export const rules = {
  required: [
    (value) => {
      if (value === null) return "El campo es requerido"
      if (value?.length === 0) return "El campo es requerido"
      return true
    }
  ],
  number: [
    (value) => {
      if (value === null) return true
      if (value?.length === 0) return true
      if (/^[0-9]+$/.test(value)) return true
      return 'Número entero inválido'
    }
  ],
  dni: [
    (value) => {
      if (value?.length > 6 && /^[0-9]+$/.test(value)) return true
      return 'El DNI debe tener al menos 7 digitos'
    }
  ],
  mmyyyy: [
    (value) => {
      if (value === null) return true
      if (value?.length == 0) return true
      if (value?.length > 5 && /^(0?[1-9]|1[0-2])\/\d{4}$/.test(value)) return true
      return "el formato debe se MM/YYYY"
    }
  ],
  ddmmyyyy: [
    (value) => {
      if (value === null) return true
      if (value?.length == 0) return true
      if (value?.length > 5 && /^([0-2][0-9]|3[0-1])\/(0?[1-9]|1[0-2])\/\d{4}$/.test(value))
        return true
      return 'el formato debe se DD/MM/YYYY'
    }
  ],
  rango: (value, min, max) => {
    if (value >= min && value <= max) return true
    return 'el valor debe estar entre ' + min + ' y ' + max
  },
  longitudMax: (value, max) => {
    let valorString = value.toString()
    if (valorString.length <= max) return true
    return 'se aceptan hasta ' + max + ' caracteres'
  },
  longitudEntre: (value, min, max) => {
    let valorString = value.toString()

    if (valorString.length >= min && valorString.length <= max) return true
    let mensaje = 'Se acepta entre ' + min + ' y ' + max + ' caracteres'
    return mensaje
  },
  longitudMin: (value, min) => {
    if (value === null) return 'ingresar al menos ' + min + ' caracteres'
    let valorString = value.toString()
    if (valorString.length >= min) return true
    return 'ingresar al menos ' + min + ' caracteres'
  },
  longitudMaxONull: (value, max) => {
    if (value === null) return true
    let valorString = value.toString()
    if (valorString.length <= max) return true
    return 'se aceptan hasta ' + max + ' caracteres'
  },
  longitudEntreONull: (value, min, max) => {
    if (value === null) return true
    let valorString = value.toString()
    if (valorString.length == 0) return true
    if (valorString.length >= min && valorString.length <= max) return true
    let mensaje = 'Se acepta entre ' + min + ' y ' + max + ' caracteres'
    return mensaje
  },
  longitudMinONull: (value, min) => {
    if (value === null) return true
    let valorString = value.toString()
    if (valorString.length >= min) return true
    return 'ingresar al menos ' + min + ' caracteres'
  },
  numDecimal: [
    (value) => {
      if (value === null) return true
      if (value?.length === 0) return true
      if (value?.length === 0) return true
      if (/^[0-9]+([.,][0-9]+)?$/.test(value)) return true
      return 'Número decimal inválido'
    }
  ]
}
