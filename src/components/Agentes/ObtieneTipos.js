import { leerDatos } from './llamadaAPI'

export async function leerPaises() {
  let url = 'en/paises&sort={"Descripcion":"asc"}'
  const { datos, operacionOk } = await leerDatos(url)
  let listaPaises = null

  if (operacionOk) {
    listaPaises = datos.map(item => {
        return {value : item.ID, name: item.DESCRIPCION }
    })
  }
  console.log(listaPaises)
  return listaPaises
}