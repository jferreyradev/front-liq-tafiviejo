import { useEndPoints } from '@/composables/useEndPoints'

const {  apiTunel } = useEndPoints()


const urlTunel = apiTunel.value + '/'

export async function leerDatos_Tunel( body) {
  let estado = 0
  let operacionOk = false
  let errmsg = ''
  let datos = null
  console.log(urlTunel)
  let response = null
  try {
    response = await fetch(urlTunel + 'query', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer desarrollotoken'
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: JSON.stringify(body) // body data type must match "Content-Type" header
  })
    estado = response.status
    if (response.ok) {

      datos = await response.json()
      operacionOk = true
    } else if (response.status == 400) {
      datos = null
      operacionOk = false
      errmsg = 'cuerpo o parámetros incorrectos'
    } else if (response.status == 404) {
      datos = null
      operacionOk = false
      errmsg = 'Error 404, recurso no encontrado'
    }
    else if (response.status == 500) {
      try {
          datos = await response.json()
          errmsg = datos.error
      } catch (error) {
          errmsg = 'Error interno del servidor'
      }
      operacionOk = false
    }
  } catch (error) {
    estado = 999
    operacionOk = false
    errmsg = 'Error en la Red'
    datos = null
    console.log(error)
  }
  return { estado, operacionOk, errmsg, datos }
}

export async function EjecutarSP_Tunel( body) {
  let estado = 0
  let operacionOk = false
  let errmsg = ''
  console.log(urlTunel)
  let response = null
  try {
    response = await fetch(urlTunel + 'procedure', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer desarrollotoken'
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: JSON.stringify(body) // body data type must match "Content-Type" header
  })
    estado = response.status
    if (response.ok) {

      datos = await response.json()
      operacionOk = true
    } else if (response.status == 400) {
      datos = null
      operacionOk = false
      errmsg = 'cuerpo o parámetros incorrectos'
    } else if (response.status == 404) {
      datos = null
      operacionOk = false
      errmsg = 'Error 404, recurso no encontrado'
    }
    else if (response.status == 500) {
      try {
          datos = await response.json()
          errmsg = datos.error
      } catch (error) {
          errmsg = 'Error interno del servidor'
      }
      operacionOk = false
    }
  } catch (error) {
    estado = 999
    operacionOk = false
    errmsg = 'Error en la Red'
    datos = null
    console.log(error)
  }
  return { estado, operacionOk, errmsg, datos }
}

/**
 * Genera el objeto de parámetros a partir de una matriz.
 * @param {Array[]} matrix - Array de arrays: [nombre, dirección, valor, tipo]
 * @param {string} mode - 'FUNCTION' o 'PROCEDURE'
 */
export function buildParams(matrix, mode) {
    const isFunction = mode?.toUpperCase() === 'FUNCTION';
    
    // Mapeamos la matriz a objetos con nombre de propiedad fijo
    let params = matrix.map(row => {
        const [name, direction, value, type] = row;
        const obj = { name };
        
        // Solo agregamos las propiedades si existen en la fila
        if (direction !== undefined) obj.direction = direction;
        if (value !== undefined) obj.value = value;
        if (type !== undefined) obj.type = type;
        
        return obj;
    });

    if (isFunction) {
        // Buscamos si ya existe algún parámetro con dirección "OUT"
        const firstOutIndex = params.findIndex(p => p.direction === 'OUT');
        
        // Si no hay ningún OUT, lo agregamos al final. 
        // Si hay, lo insertamos justo antes del primero.
        const resultParam = { name: "result", direction: "OUT", type: "NUMBER" };
        
        if (firstOutIndex === -1) {
            params.push(resultParam);
        } else {
            params.splice(firstOutIndex, 0, resultParam);
        }
    }

    return { params };
}

/**
 * Genera el objeto estructurado para llamadas a BD.
 * @param {string} fullName - Nombre completo (SCHEMA.PACKAGE.NAME).
 * @param {string} mode - 'FUNCTION' o 'PROCEDURE'.
 * @param {Array[]} matrix - Matriz de parámetros [nombre, dirección, valor, tipo].
 */
export
function generaLlamadaFuncion(fullName, mode, matrix) {
  const isFunction = mode?.toUpperCase() === 'FUNCTION';

  // 1. Mapeamos la matriz a objetos dinámicos
  let params = matrix.map(row => {
    const [name, direction, value, type] = row;
    const obj = { name };

    if (direction !== undefined) obj.direction = direction;
    if (value !== undefined) obj.value = value;
    if (type !== undefined) obj.type = type;

    return obj;
  });

  // 2. Lógica específica para Funciones
  if (isFunction) {
    // Verificamos si ya existe un parámetro llamado 'result'
    const hasResult = params.some(p => p.name.toLowerCase() === 'result');

    if (!hasResult) {
      const resultParam = { name: "result", direction: "OUT", type: "NUMBER" };
      const firstOutIndex = params.findIndex(p => p.direction === 'OUT');

      if (firstOutIndex === -1) {
        params.push(resultParam);
      } else {
        params.splice(firstOutIndex, 0, resultParam);
      }
    }
  }

  // 3. Retornamos la estructura final
  return {
    name: fullName,
    isFunction: isFunction,
    params: params
  };
}