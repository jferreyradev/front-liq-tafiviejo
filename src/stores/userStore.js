import { defineStore } from 'pinia'
import { useEndPoints } from '@/composables/useEndPoints'

const { apiBase, apiBoletas, getBoletasHeaders } = useEndPoints()

export const useUserStore = defineStore('userStore', {
    state: () => ({
        user: null, // Estado inicial del usuario
        pers: null,
        loading: false,
        result: '',
        error: null,
        success: false,
        auth: false,
        allowSign: false,
        rol: null,
        users: []
    }),
    getters: {
        isRegistred: (state) => !!state.user,
        isAuthenticated: (state) => !!state.auth,
        isAdmin:(state) => !!state.user && state.user.ROL===5 ,
        isValid: (state) => !!state.pers,
        userName: (state) => state.user?.name || '',
        checkPassword(state) {
            return (pass) => (atob(state.user?.PASSWORD) || '') === pass
        },
    },
    actions: {
        getConfig() {
            this.isPending = true
            fetch(`${apiBoletas.value}/config`,{
                headers: getBoletasHeaders()
            })
              .then((res) => res.json())
              .then((_data) => {
                console.log(_data)
                this.config = _data[0]
              })
              .catch((err) => {
                console.log(err)
                this.error = err
              })
              .finally(() => (this.isPending = false))
          },
        getUsers() {
            this.loading = true
            fetch(`${apiBoletas.value}/users`,{
                headers: getBoletasHeaders()
                })
              .then((res) => res.json())
              .then((_data) => {
                this.users = _data
              })
              .catch((err) => {
                console.log(err)
                this.error = err
              })
              .finally(() => (this.loading = false))
        },
        async setEstado(idus, estado) {
            this.isPending = true
            this.error = null
            try {
              const bodyIn = {
                IdUsuario: idus,
                Estado: estado
              }
              const requestOptions = {
                method: `POST`, // POST, etc
                mode: 'cors',
                headers: { 'Content-Type': 'application/json', ...getBoletasHeaders() },
                body: JSON.stringify(bodyIn)
              }
              const res = await fetch(`${apiBoletas.value}/estadoUsuario`, requestOptions)
              console.log(res)
              this.result = res
            } catch (err) {
              this.error = err
              console.log(err)
            } finally {
              this.isPending = false
            }
          },
        async login(dni, pass) {
            await this.fetchUser(dni)
            if (this.user) {
                if (atob(this.user?.PASSWORD) === pass) this.auth = true
            }
        },
        async loginUserName(userName, pass) {
            this.auth = false
            await this.fetchUserName(userName)
            if (this.user) {
                if (atob(this.user?.PASSWORD) === pass) {
                    this.auth = true
                    //await this.fetchRol()
                }else{
                    this.auth = false
                }
            }
        },
        async verifyRegister(dni, orden) {
            await this.fetchUser(dni)
            if (!this.user) {
                await this.fetchPersCargo(dni)
                if (this.pers?.ORDEN == orden) this.allowSign = true
            }
        },
        async getData(dni) {
            this.fetchUser(dni)
        },
        async fetchUser(dni) {
            this.loading = true
            this.error = null
            this.success = false
            this.user = null
            this.auth = false
            try {
                console.log('try user', dni, `${apiBoletas.value}/user/${dni}`)

                const response = await fetch(`${apiBoletas.value}/user/${dni}`, {
                    headers: getBoletasHeaders()
                }) // Cambia la URL a la de tu API
                if (!response.ok) {
                    throw new Error('Error fetching user')
                }
                const data = await response.json()
                this.user = data[0]
                this.success = true
            } catch (error) {
                this.error = error.message
            } finally {
                this.loading = false
            }
        },
        async fetchUserName(userName) {
            this.loading = true
            this.error = null
            this.success = false
            this.user = null
            this.auth = false
            try {
                console.log(`${apiBase.value}/api/view/users?UserName=${userName}`)
                const response = await fetch(`${apiBase.value}/api/view/users?UserName=${userName}`, {
                    headers: getBoletasHeaders()
                }) // Cambia la URL a la de tu API
                if (!response.ok) {
                    throw new Error('Error fetching user')
                }
                const data = await response.json()
                this.user = data[0]
                this.success = true
            } catch (error) {
                this.error = error.message
            } finally {
                this.loading = false
            }
        },
        async fetchUserEmail(email) {
            this.loading = true
            this.error = null
            this.success = false
            this.user = null
            this.auth = false
            try {
                const response = await fetch(`${apiBase.value}/api/view/users?email=${email}`, {
                    headers: getBoletasHeaders()
                }) // Cambia la URL a la de tu API
                if (!response.ok) {
                    throw new Error('Error fetching user')
                }
                const data = await response.json()
                this.user = data[0]
                this.success = true
            } catch (error) {
                this.error = error.message
            } finally {
                this.loading = false
            }
        },
        async fetchRol() {
            this.loading = true
            this.error = null
            this.success = false
            try {
                console.log(`${apiBase.value}/api/view/frontMenuRol?IdRol=${this.user.ROL}&sort={"IdMenu":"asc"}`)
                const response = await fetch(`${apiBase.value}/api/view/frontMenuRol?IdRol=${this.user.ROL}&sort={"IdMenu":"asc"}`, {
                    headers: getBoletasHeaders()
                }) // Cambia la URL a la de tu API
                if (!response.ok) {
                    throw new Error('Error fetching user')
                }
                const data = await response.json()
                //data.push({"IDROL":5, "IDMENU":7,"DESCRIPCION":"Archivos","PATH":"/archivos"})
                this.rol = data
                this.success = true
            } catch (error) {
                this.error = error.message
            } finally {
                this.loading = false
            }
        },

        setPers(pers) {
            this.pers = pers
            this.success = true
        },
        setUser(user) {
            this.user = user
            this.success = true
        },
        clearUser() {
            this.user = null
            this.success = true
        },
        clearPers() {
            this.pers = null
            this.success = true
        },

        async fetchPers(dni) {
            this.loading = true
            this.error = null
            this.success = false
            this.pers = null
            this.allowSign = false
            try {
                console.log('try pers', dni, `${apiBoletas.value}/persona/${dni}`)

                const response = await fetch(`${apiBoletas.value}/persona/${dni}`, {
                    headers: getBoletasHeaders()
                }) // Cambia la URL a la de tu API
               
                if (!response.ok) {
                    throw new Error('Error fetching user')
                }
                const data = await response.json()
                this.pers = data[0]
                this.success = true
                console.log('------ Persona')
                console.log(this.pers)
            } catch (error) {
                this.error = error.message
                console.log(error.message)
            } finally {
                this.loading = false
            }
        },

        async fetchPersCargo(dni) {
            this.loading = true
            this.error = null
            this.success = false
            this.pers = null
            this.allowSign = false
            try {
                console.log('try pers', dni, `${apiBoletas.value}/personacargo/${dni}`)

                const response = await fetch(`${apiBoletas.value}/personacargo/${dni}`, {
                    headers: getBoletasHeaders()
                }) // Cambia la URL a la de tu API

                if (!response.ok) {
                    throw new Error('Error fetching user')
                }
                const data = await response.json()
                this.pers = data[0]
                this.success = true
                console.log('------ Persona')
                console.log(this.pers)
            } catch (error) {
                this.error = error.message
                console.log(error.message)
            } finally {
                this.loading = false
            }
        },

        async register(bodyIn) {
            this.loading = true
            this.error = null
            bodyIn.Clave = btoa(bodyIn.Clave)
            console.log(bodyIn)
            try {
                const requestOptions = {
                    method: `POST`, // POST, etc
                    mode: 'cors',
                    headers: { 'Content-Type': 'application/json' , ...getBoletasHeaders()},
                    body: JSON.stringify(bodyIn)
                }
                await fetch(`${apiBoletas.value}/user`, requestOptions)
            } catch (err) {
                this.error = err
                console.log(err)
            } finally {
                this.loading = false
            }
        },

        async changePassword(newPass) {
            this.loading = true
            this.error = null

            console.log(this.user.ID, newPass)
            try {
                const bodyIn = {
                    'IdUsuario': this.user.ID,
                    'Clave': btoa(newPass)
                }
                const requestOptions = {
                    method: `POST`, // POST, etc
                    mode: 'cors',
                    headers: { 'Content-Type': 'application/json' , ...getBoletasHeaders()},
                    body: JSON.stringify(bodyIn)
                }
                await fetch(`${apiBoletas.value}/claveUsuario`, requestOptions)
                this.result = 'ok'
            } catch (err) {
                this.error = err
                console.log(err)
            } finally {
                this.loading = false
            }
        },
        async changeUserPassword(idus, newPass) {
            this.loading = true
            this.error = null

            console.log(idus, newPass)
            try {
                const bodyIn = {
                    'IdUsuario': idus,
                    'Clave': btoa(newPass)
                }
                const requestOptions = {
                    method: `POST`, // POST, etc
                    mode: 'cors',
                    headers: { 'Content-Type': 'application/json' , ...getBoletasHeaders()},
                    body: JSON.stringify(bodyIn)
                }
                await fetch(`${apiBoletas.value}/claveUsuario`, requestOptions)
                this.result = 'ok'
            } catch (err) {
                this.error = err
                console.log(err)
            } finally {
                this.loading = false
            }
        }
    }
})