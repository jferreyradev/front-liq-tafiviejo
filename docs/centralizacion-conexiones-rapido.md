# Centralizacion de Conexiones - Guia Rapida

## Objetivo
Unificar todas las llamadas HTTP en un unico cliente para:
- enviar headers requeridos en forma consistente,
- evitar duplicacion de fetch en componentes/stores,
- estandarizar manejo de errores y descargas.

## Copiar estos archivos al otro front
1. templates/api/useEndPoints.template.js -> src/composables/useEndPoints.js
2. templates/api/useApiClient.template.js -> src/composables/useApiClient.js
3. templates/api/downloadWithHeaders.template.js -> src/utils/downloadWithHeaders.js (opcional)

## Configuracion minima
Editar en useEndPoints.js:
- endpoints.prod.boletas
- endpoints.prod.base
- endpoints.prod.sp
- x-project-key
- x-project-port

## Regla de arquitectura
1. No usar fetch directo en componentes para backend.
2. No usar links directos a endpoints protegidos por headers.
3. Todo request al backend pasa por useApiClient.

## Patron de uso
### GET JSON
apiClient.get({
  service: 'base',
  path: '/api/view/configServer'
})

### POST JSON
apiClient.post({
  service: 'boletas',
  path: '/user',
  body: payload,
  headers: { 'Content-Type': 'application/json' }
})

### Descargar archivo (blob)
const blob = await apiClient.get({
  service: 'base',
  path: '/api/boleta',
  query: { IdLiq: idliq },
  responseType: 'blob'
})

## Plan de migracion rapido (90 minutos)
1. Migrar flujo critico de descarga/boletas.
2. Migrar stores principales (auth, filtros, listados).
3. Migrar helpers de API (llamadaAPI).
4. Barrer componentes con fetch directo.

## Archivos exactos a modificar (este front)

### Nucleo obligatorio
1. src/composables/useEndPoints.js
2. src/composables/useApiClient.js
3. src/composables/useFetch.js
4. src/composables/useSimplieFetch.js

### Stores con conexiones
1. src/stores/userStore.js
2. src/stores/filterStore.js
3. src/stores/liqStore.js
4. src/stores/boletaStore.js

### Helpers de API
1. src/components/Novedades/llamadaAPI.js
2. src/components/Previsional/llamadaAPI.js

### Componentes con fetch directo
1. src/components/LiqBoletas.vue
2. src/components/ArchAcred.vue
3. src/components/ArchIPSST.vue

### Componentes que ya usan useFetch (se benefician al centralizar useFetch)
1. src/components/LiquidacionItemTable.vue
2. src/components/LiquidacionTable.vue
3. src/components/RepoApoPatronales.vue
4. src/components/RepoBajasLey.vue
5. src/components/RepoCod153.vue
6. src/components/RepoPlanillaDetLiq.vue
7. src/components/RepoPlanillaLey.vue
8. src/components/RepoPlanillaResSueldo.vue
9. src/components/RepoPlanillaResSueldoComp.vue
10. src/components/RepoPlanillaResumenCargos.vue
11. src/components/RepoPlanillaRet.vue
12. src/components/RepoPlanillaRetCargo.vue
13. src/components/RepoPlanillaRetencionesCPA.vue
14. src/components/RepoResumenCod.vue
15. src/components/RepoResumenLiq.vue
16. src/components/RepoResumenLiqFdo.vue
17. src/components/ResumenAcred.vue
18. src/components/ResumenAcredDetalle.vue
19. src/components/ResumenIPSST.vue
20. src/views/HomeView.vue

### No tocar para headers backend
1. src/components/LiqBoleta.vue (fetch de asset local)
2. src/stores/boletaStore.js (fetch de logo local)

Nota: los fetch de assets locales (logo/png) no deben llevar x-project-key/x-project-port.

## Busquedas utiles
1. Buscar fetch directos:
   rg "fetch\\(" src
2. Buscar links directos a API:
   rg "href=.*api/" src
3. Buscar headers manuales duplicados:
   rg "x-project-key|x-project-port|Content-Type" src

## Checklist final
1. No quedan fetch de backend fuera de useApiClient.
2. No quedan links directos para endpoints que requieren headers.
3. Todas las descargas protegidas usan blob.
4. Preflight OPTIONS habilitado en backend para headers custom.
