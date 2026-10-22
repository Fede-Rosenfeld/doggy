# Doggy — reglas del proyecto (Sprint 2)

Proyecto de la materia Programación de Aplicaciones Móviles (UCA).

- **Sprint 1 (hecho):** frontend en `mobile/` con Expo SDK 57, TypeScript estricto y Expo Router. Los datos viven en memoria (`mobile/src/data/mock.ts`) y los services simulan la red.
- **Sprint 2 (ahora):**
  - conectar la app al backend, que vive en **otro repositorio**: `doggy-backend`, clonado al lado de este (`../doggy-backend`). Usa Express + TypeScript + Prisma + SQLite;
  - sumar gestos con `react-native-gesture-handler` + `react-native-reanimated` (ya instalados en `mobile/`, no reinstalar).

Material de referencia en `_referencias/` (diseño, consignas, apuntes de la cátedra y las reglas del Sprint 1). No se versiona. Este archivo sí se versiona: lo compartimos entre los integrantes.

## Dos repositorios: este es solo el front

La cátedra pide el front y el back en repositorios separados.

- **Este repo (`doggy`) nunca contiene código del backend:** ni carpeta `backend/`, ni `schema.prisma`, ni rutas de Express, ni la base SQLite.
- La app solo conoce la API por HTTP, en la URL de `EXPO_PUBLIC_API_URL` (`mobile/src/config.ts`). Desde el celular hay que usar la IP local de la PC, no `localhost`.
- Las reglas de Express y Prisma (validación en el servidor, filtrado del body, manejo de errores de Prisma) están en el `CLAUDE.md` de `doggy-backend`.

```
doggy (este repo): pantallas → AppContext → services → HTTP ──► doggy-backend: Express → Prisma → SQLite
```

## Conectar el frontend sin tocar las pantallas

- Las pantallas y `mobile/src/context/AppContext.tsx` **no deberían cambiar** al conectar el backend.
- Lo que cambia son las funciones de `mobile/src/services/`: pasan de `simularRespuesta()` a `pedirJson()` (`mobile/src/services/http.ts`), manteniendo la misma firma y los mismos tipos de retorno.
- `pedirJson` revisa `response.ok` y lanza un `Error` con el `{ error }` que manda el servidor. El contexto ya captura esos errores.
- Si una pantalla necesita un cambio para el backend, frená y explicá por qué antes de tocarla.

## Contrato con doggy-backend

Lo que sigue lo tienen que respetar los dos repos. **Si algo del contrato cambia, hay que cambiarlo en los dos:** acá (services, tipos y esta sección) y en `doggy-backend` (rutas y su `CLAUDE.md`).

### Endpoints

Cada función de `services/` tiene comentado su endpoint, con la ruta y el cuerpo que manda.

| Recurso | Endpoints |
| --- | --- |
| Auth | `POST /api/auth/login`, `POST /api/auth/logout` |
| Usuario | `GET /api/usuarios/me`, `PATCH /api/usuarios/me` |
| Mascotas | `GET /api/mascotas`, `POST /api/mascotas`, `PATCH /api/mascotas/:id` |
| Registros | `GET /api/registros`, `POST /api/mascotas/:id/registros`, `PATCH /api/registros/:id` |
| Turnos | `GET /api/turnos`, `POST /api/turnos`, `PATCH /api/turnos/:id` |
| Reportes | `GET /api/reportes`, `POST /api/reportes`, `PATCH /api/reportes/:id`, `DELETE /api/reportes/:id` |
| Cuidadores | `GET /api/cuidadores`, `DELETE /api/mascotas/:id/cuidadores/me` |
| Invitaciones | `POST /api/mascotas/:id/invitaciones`, `GET /api/invitaciones/:token`, `POST /api/invitaciones/:token/aceptar` |

- Los modelos de `mobile/src/types/models.ts` son la forma del JSON que viaja: ids numéricos, fechas como string ISO y relaciones por id.
- Las reglas de `mobile/src/utils/validaciones.ts` (`LIMITES`, caracteres permitidos, formatos y rangos de fechas) son las mismas que aplica el servidor. Si una cambia acá, cambia allá.

### Códigos de estado

La tabla de la práctica Prisma muestra los códigos que usó esa práctica, pero no es una lista cerrada. La regla es responder con el status que corresponde a cada caso, y la app tiene que manejarlos todos:

| Status | Cuándo |
| --- | --- |
| 200 | GET o PATCH salió bien (PATCH para cambiar una parte, **nunca PUT**) |
| 201 | POST creó el recurso (se devuelve lo creado) |
| 204 | DELETE salió bien, **sin body** |
| 400 | datos o id inválidos |
| 401 | sin sesión o token inválido |
| 403 | con sesión, pero sin permiso sobre ese recurso |
| 404 | no existe |
| 409 | conflicto con el estado actual: email ya registrado, ya asignado a la mascota, único dueño que quiere desasignarse |
| 410 | código de asignación vencido o ya usado |
| 500 | error imprevisto |

- Todo error llega como `{ error: "mensaje en español" }`. La app muestra ese mensaje tal cual, sin armar textos propios por status, salvo en casos puntuales (por ejemplo, un 401 lleva al login).
- Una respuesta 204 no trae body: la app no tiene que intentar leer JSON de ella.

## Decisiones

### Contrato con doggy-backend

- **Resuelta: 410 para links de asignación.** `GET /api/invitaciones/:token` y `POST /api/invitaciones/:token/aceptar` responden 410 si el código venció o ya se usó, y 404 si no existe.
- **Pendiente (Etapa 3): `PUT` en los services.** Los comentarios de `registros.ts` y `turnos.ts` dicen `PUT`; se pasan a `PATCH` cuando se conecten esos services.
- **Pendiente: 204 en `pedirJson`.** Hoy siempre hace `response.json()`, que falla con un 204 sin body. Hay que contemplarlo antes de conectar los DELETE.
- **Pendiente: link a `doggy-backend` en el README.** El repo todavía no existe en GitHub; cuando se cree, sumar el link en "Cómo correrlo → Backend".

### Código

- **Resuelta: efectos con setState (`react-hooks/set-state-in-effect`).** No se silencia con `eslint-disable`. Se resuelve así:
  - cargar datos al montar: separar una función que pide y devuelve los datos sin tocar el estado (como `pedirTodo` en `AppContext` o `leerGps` en `useUbicacion`) de otra que los aplica, y aplicarlos en el `.then` de la promesa, con una bandera `vigente` para la limpieza. La regla marca cualquier función con setState que se llame desde el efecto, aunque el setState esté después de un `await`;
  - reaccionar a un cambio de prop o param: ajustar el estado durante el render guardando el valor anterior (como `seleccionadoPrevio` en `ReporteMarker` o `reporteRecibido` en Perdidos), y dejar en el efecto solo lo imperativo (timers, mover el mapa);
  - dependencias de un hook que devuelve un objeto nuevo en cada render (como `gps`): desestructurar la función estable (`const { obtenerDireccion } = gps`) y depender de ella, nunca del objeto entero, porque genera un loop.

### Para revisar

- **Header de los modales en iOS.** La variante `bar` de `ScreenHeader` suma `insets.top`. En los modales tipo hoja (`reportar`, `mi-mascota-perdida`, `asignar`) puede sobrar espacio arriba. Verificar en un iPhone y, si sobra, no sumar el inset dentro de un modal.
- **Título del mes del calendario en web.** `adjustsFontSizeToFit` no funciona en el navegador: en pantallas de 320 px "Septiembre 2026" se corta con "…". En el celular se achica bien.
- **Foto de Nieve.** El reporte de ejemplo de Nieve (`src/data/mock.ts`) no tiene foto y muestra el avatar con la inicial. Falta una foto de un perro blanco.
- **Metadatos de `icon.png`.** El archivo original del logo (`mobile/assets/images/icon.png`) conserva sus metadatos de procedencia (C2PA); los íconos derivados (splash, logo y adaptive icon) no los tienen porque se volvieron a guardar. Queda a decisión del equipo si se deja así.

## Gestos (gesture-handler + reanimated)

- Se anima con `useSharedValue` y `useAnimatedStyle`, en el hilo de UI.
- `runOnJS` solo en `onEnd` (o en un callback final), **nunca** en `onUpdate`.
- Todo gesto tiene una alternativa tocable (botón o ícono) que hace lo mismo, por accesibilidad. El gesto es un atajo, no la única forma.
- Feedback con `expo-haptics` al cruzar un umbral (por ejemplo, cuando un swipe pasa el punto en que se va a confirmar), una sola vez por cruce.
- Animar solo `transform` y `opacity`.

## Stack y dependencias

- Todo tiene que seguir funcionando en **Expo Go** (sin development build).
- Dependencias: solo las ya instaladas más las que pida cada etapa del Sprint 2, siempre con `npx expo install <paquete>`. Nada de librerías de UI (NativeBase, Paper, Tamagui, NativeWind, etc.).
- Hooks de la cursada: `useState`, `useEffect`, `useRef`, `useMemo`, `useCallback` y `useContext`. El estado global va con Context API, sin Redux ni Zustand.
- Navegación con Expo Router, usando las opciones vistas en clase (`headerShown`, `title`, `tabBarActiveTintColor`, `tabBarIcon`, etc.).
- TypeScript estricto, sin `any`.

## Código y estilo

- Código, nombres y comentarios en español, con el mismo estilo de JSDoc del repo:
  - encabezado `/** ... */` en cada archivo explicando qué es y qué rol cumple;
  - JSDoc en cada función, hook, componente y handler, con qué hace, qué recibe y qué devuelve;
  - secciones `// --- Estado ---`, `// --- Handlers ---`, `// --- Render ---`, `// --- Estilos ---` en los componentes largos.
- Todo módulo que use hardware lleva un comentario de bloque que explica qué hardware usa, qué permiso pide y por qué la app lo necesita. Ahora también los de gestos y háptica.
- Tono de los comentarios: natural y directo, sin relleno ni emojis.
- Textos de la UI en español rioplatense ("Escaneá", "Gestioná", "vos").
- Estilos con `StyleSheet.create` y el theme de `mobile/src/theme/` (colores, tipografías, espaciado, radios y sombras). Nada de valores escritos a mano.
- Layout con Flexbox y medidas proporcionales para que nada se rompa en pantallas chicas. Respetar la safe area (`react-native-safe-area-context`) y usar `KeyboardAvoidingView` en los formularios.
- Antes de crear un componente, fijarse en `mobile/src/components/` si ya existe uno que sirva, y reutilizarlo o extenderlo.

## Producto

- Doggy es solo para perros: no hay especie ni tamaño en modelos, formularios ni reportes.
- Ningún botón queda muerto: lo que todavía no existe muestra un `Alert` de "Disponible próximamente".

## Git

- Commits chicos, uno por unidad lógica, con mensajes en español, cortos, en imperativo, variados y descriptivos. Nada de mensajes genéricos repetidos. Sin trailers `Co-Authored-By`.
- No cambiar `git config` ni hacer push salvo que se pida.
- `.gitignore` en la raíz: `.claude/`, `_referencias/`, `.env`, `.expo/`, `node_modules/`, `dist/`, `web-build/` y `*.log`.

## Antes de dar algo por terminado

1. `npx tsc --noEmit` en `mobile/` sin errores.
2. `npm run lint` en `mobile/` sin errores.
3. Si se tocó el contrato, revisar que `doggy-backend` quede igual.
4. Hacer los commits y dar un resumen corto: qué se hizo, qué decisiones se tomaron, qué hay que probar y los commits que quedaron.
