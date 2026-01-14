// meses
export const months = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre'
]

// tipo de carga
export const tipoCarga = [
  {
    name: 'Manual',
    value: 1
  },
  {
    name: 'Disco',
    value: 0
  },
  {
    name: 'Otro',
    value: 3
  }
]

// tipo de hoja
export const tipoHoja = [
  {
    name: 'Movimiento de Haberes',
    value: 1
  },
  {
    name: 'Pensiones',
    value: 2
  },
  {
    name: 'Deducciones',
    value: 3
  },
  {
    name: 'Nov. varias',
    value: 4
  },
  {
    name: 'Nov. altas',
    value: 5
  }
]

// tipo de liquidacion
export const tipoLiq = [
  {
    name: 'Mensual',
    value: 1
  },
  {
    name: 'Adicional',
    value: 5
  },
  {
    name: 'SAC',
    value: 2
  },
  {
    name: 'Liq Final',
    value: 21
  },
  {
    name: 'Ayuida escolar',
    value: 10
  }
]

// Estado de Hojas
export const estadosHoja = [
  {
    name: 'CREADA',
    value: 1
  },
  {
    name: 'CARGADA EN DISCO',
    value: 2
  },
  {
    name: 'EN PROCESO',
    value: 3
  },
  {
    name: 'FINALIZADA',
    value: 4
  },
  {
    name: 'AUTORIZADA',
    value: 5
  },
  {
    name: 'ANULADA',
    value: 6
  }
]

// Estado de Hojas
export const estadosNov = [
  {
    name: 'PROCESADO',
    value: 0
  },
  {
    name: 'CARGADO',
    value: 1
  },
  {
    name: 'INVALIDO',
    value: 2
  },
  {
    name: 'SIN VALIDAR',
    value: 3
  },
  {
    name: 'PARA PROCESAR',
    value: 4
  }
]

export const sexos = [
  {
    name: 'Femenino',
    value: 'F'
  },
  {
    name: 'Masculino',
    value: 'M'
  },
  {
    name: 'No declarado',
    value: 'X'
  },
  { name: 'Sin definir', value: null }
]

export const tipoRelacionFamiliar = [
  {
    name: 'ESPOSO/A',
    value: 1
  },
  {
    name: 'HIJO/A',
    value: 2
  }
]

export const tipoEscolaridad = [
  {
    name: 'NO ESTUDIA',
    value: 0
  },
  {
    name: 'JARDIN MENOR A 4 AÑOS',
    value: 1
  },
  {
    name: 'JARDIN',
    value: 2
  },
  {
    name: 'ESCOLARIDAD PRIMARIA',
    value: 3
  },
  {
    name: 'ESCOLARIDAD SECUNDARIA',
    value: 4
  },
  {
    name: 'ESTUDIOS TERCIARIOS/SUPERIOR',
    value: 5
  }
]

// Estado de Hojas
export const estadosCargo = [
  {
    name: 'Activo',
    value: 1
  },
  {
    name: 'Ret. de Cargo',
    value: 2
  },
  {
    name: 'Baja de Cargo',
    value: 3
  },
  {
    name: 'Lic. s/goce de Sueldo',
    value: 4
  }
]

export const tiposEmpleo = [
  {
    name: 'ADMINISTRATIVO',
    value: 1
  },
  {
    name: 'DOCENTES',
    value: 4
  },
  {
    name: 'AUT. SUPERIORES',
    value: 6
  }
]

export const reparticiones = [
  {
    name: 'HCD CONCEPCION',
    value: 469
  },
  {
    name: 'MUNICIPALIDAD DE CONCEPCION',
    value: 470
  },
  {
    name: 'MUNICIPALIDAD DE BURRUYACU',
    value: 484
  }
]

export const tiposOS = [
  {
    name: 'NO TIENE',
    value: 0
  },
  {
    name: 'SUB. SALUD',
    value: 1
  }
]

export const sitRev = [
  {
    name: 'Sin datos',
    value: 0
  },
  {
    name: 'Permanente',
    value: 1
  },
  {
    name: 'Pte. Trab. Públicos',
    value: 2
  },
  {
    name: 'H.C.D.',
    value: 3
  },
  {
    name: 'Personal de Bloque',
    value: 4
  },
  {
    name: 'Planta Interina',
    value: 5
  },
  {
    name: 'Personal - al 50%',
    value: 6
  },
  {
    name: 'Asesor',
    value: 7
  },
  {
    name: 'Retiro Programado',
    value: 16
  }
]

export const estadosCivil = [
  {
    name: 'SOLTERO/A',
    value: 1
  },
  {
    name: 'CASADO/A',
    value: 2
  },
  {
    name: 'DIVORCIADO/A',
    value: 3
  },
  {
    name: 'VIUDO/A',
    value: 4
  }
]

export const tiposDoc = [
  {
    name: 'DNI',
    value: 1
  },
  {
    name: 'LE',
    value: 2
  },
  {
    name: 'LC',
    value: 3
  },
  {
    name: 'CDI',
    value: 4
  }
]

export function getName(lista, id) {
  const found = lista.find((element) => element.value === id)
  return found ? found.name : 'sin definir'
}

export function getObjetList(lista, id, defecto = null) {
  const found = lista.find((element) => element.value === id)
  return found ? found : defecto
}
