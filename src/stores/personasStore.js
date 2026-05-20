import { defineStore } from 'pinia'
import { useEndPoints } from '@/composables/useEndPoints'

const { apiBase } = useEndPoints()

export const usePersonasStore = defineStore('personasListas', {
  state: () => ({
    paisId: 1,
    provinciaId: 23,
    paises: null,
    provincias: null
  }),
  getters: {
    getPaises: (state) => state.paises,
    getProvincias: (state) => state.provincias
  },
  actions: {
    async init() {
      await this.leerPaises()
      await this.leerProvincias()
    },
    async leerPaises() {
      return { name: 'Argentina', value: 1 }
    },
    async leerProvincias() {
      let url = apiBase.value + '/api/en/provincias?PaisId=1&sort={"Descripcion":"asc"}'
      console.log(url)
      let respuesta = await fetch(url)
        .then((res) => res.json())
        .catch(() => null)
      this.provincias = respuesta.map((item) => {
        return { name: item.DESCRIPCION, value: item.ID }
      })
    }
  }
})
