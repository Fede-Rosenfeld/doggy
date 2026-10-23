# Doggy — reglas del proyecto (Sprint 2)

Proyecto de la materia Programación de Aplicaciones Móviles (UCA).

- **Sprint 1 (hecho):** frontend en `mobile/` con Expo SDK 57, TypeScript estricto y Expo Router. Los datos vivían en memoria y los services simulaban la red.
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
- Lo que cambia son las funciones de `mobile/src/services/`: usan `pedirJson()` o, para los 204, `pedirSinRespuesta()` (`mobile/src/services/http.ts`), manteniendo la misma firma y los mismos tipos de retorno.
- Los dos revisan `response.ok` y lanzan un `Error` con el `{ error }` que manda el servidor. El contexto deja pasar esos errores y cada pantalla o formulario muestra el mensaje.
- Si una pantalla necesita un cambio para el backend, frená y explicá por qué antes de tocarla.

## Contrato con doggy-backend

Lo que sigue lo tienen que respetar los dos repos. **Si algo del contrato cambia, hay que cambiarlo en los dos:** acá (services, tipos y esta sección) y en `doggy-backend` (rutas y su `CLAUDE.md`).

### Endpoints

Cada función de `services/` tiene comentado su endpoint, con la ruta y el cuerpo que manda.

| Recurso | Endpoints |
| --- | --- |
| Auth | `POST /api/auth/registro`, `POST /api/auth/login`, `POST /api/auth/logout` |
| Usuario | `GET /api/usuarios/me`, `PATCH /api/usuarios/me` |
| Mascotas | `GET /api/mascotas`, `POST /api/mascotas`, `PATCH /api/mascotas/:id` |
| Registros | `GET /api/registros`, `POST /api/mascotas/:id/registros`, `PATCH /api/registros/:id`, `DELETE /api/registros/:id` |
| Turnos | `GET /api/turnos`, `POST /api/turnos`, `PATCH /api/turnos/:id`, `DELETE /api/turnos/:id` |
| Reportes | `GET /api/reportes`, `POST /api/reportes`, `PATCH /api/reportes/:id` (también para cerrarlo) |
| Cuidadores | `GET /api/cuidadores`, `DELETE /api/mascotas/:id/cuidadores/me` |
| Invitaciones | `POST /api/mascotas/:id/invitaciones`, `GET /api/invitaciones/:token`, `POST /api/invitaciones/:token/aceptar` |

- Los modelos de `mobile/src/types/models.ts` son la forma del JSON que viaja: ids numéricos, fechas como string ISO y relaciones por id.
- Para modificar se usa **PATCH, nunca PUT**: un campo que no viene no se toca.
- **Para borrar un opcional en un PATCH se manda `null`** (`proximaDosis`, `fotoEtiqueta`, `infoAdicional`, `foto`). Mandar `undefined` no sirve: `JSON.stringify` lo descarta y el servidor deja el valor viejo.
- **Cerrar un reporte ("Ya apareció") es `PATCH /api/reportes/:id` con `{ cerrado: true }`**, no un DELETE: el reporte queda guardado como historial y `GET /api/reportes` devuelve solo los activos. Un reporte cerrado no se puede editar ni reabrir (409).
- **Permisos:** solo se escribe sobre mascotas a las que el usuario está asignado, como dueño o invitado (403 si no). Generar códigos de asignación es solo para dueños. Un reporte `encontrado` puede llevar el `mascotaId` de una mascota ajena (la que identificó el QR).
- **Quién edita o cierra un reporte:** quien lo publicó o cualquier usuario asignado a la mascota del reporte. Un reporte sin `mascotaId` solo lo edita o cierra su autor. Si no, 403.
- Una mascota tiene como mucho un reporte `perdido` activo (409 si ya tiene uno).
- Las reglas de `mobile/src/utils/validaciones.ts` (`LIMITES`, caracteres permitidos, formatos y rangos de fechas) son las mismas que aplica el servidor. Si una cambia acá, cambia allá.

### Sesión

- `POST /api/auth/registro` `{ nombre, apellido, email, password }` → 201 `{ usuario, token }`; 400 si un dato no es válido (mismas reglas que la pantalla de registro), 409 si el email ya tiene cuenta. El email se guarda en minúsculas. `ubicacion` y `telefonoEmergencia` quedan como `""` hasta que el usuario los complete con `PATCH /api/usuarios/me`.
- `POST /api/auth/login` `{ email, password }` → 200 `{ usuario, token }`; 401 con `"Email o contraseña incorrectos"`, el mismo mensaje si el email no existe o si la contraseña no coincide.
- `POST /api/auth/logout` → 204 sin body; desde ahí ese token responde 401.
- **Todas las demás rutas mandan `Authorization: Bearer <token>`**, salvo `/api/health`. Sin header, con un token que no existe, vencido (30 días) o cerrado, responden **401**: la app borra el token y vuelve al login.
- El token es aleatorio (64 caracteres hex) y el servidor guarda solo su SHA-256 en la tabla `Sesion`, así el logout lo invalida al instante.
- En la app, el token se guarda con `expo-secure-store` (`mobile/src/services/sesion.ts`) para que la sesión sobreviva al cerrar la app, y `pedirJson`/`pedirSinRespuesta` lo suman al header. Un 401 de cualquier ruta salvo el login borra el token, limpia el estado y vuelve al login con un aviso.

### Códigos de estado

La tabla de la práctica Prisma muestra los códigos que usó esa práctica, pero no es una lista cerrada. La regla es responder con el status que corresponde a cada caso, y la app tiene que manejarlos todos:

| Status | Cuándo |
| --- | --- |
| 200 | GET o PATCH salió bien (PATCH para cambiar una parte, **nunca PUT**) |
| 201 | POST creó el recurso (se devuelve lo creado) |
| 204 | DELETE salió bien, **sin body** |
| 400 | datos o id inválidos |
| 401 | sin `Authorization: Bearer`, token inválido, vencido o cerrado con logout; login con email o contraseña incorrectos |
| 403 | con sesión, pero sin permiso sobre ese recurso |
| 404 | no existe |
| 409 | conflicto con el estado actual: email ya registrado, ya asignado a la mascota, único dueño que quiere desasignarse |
| 410 | código de asignación vencido o ya usado |
| 500 | error imprevisto |

- Todo error llega como `{ error: "mensaje en español" }`. La app muestra ese mensaje tal cual, sin armar textos propios por status, salvo en casos puntuales (por ejemplo, un 401 lleva al login).
- Los errores genéricos de largo y caracteres llevan el campo adelante ("Nombre: puede tener hasta 30 caracteres."), porque la app los muestra en un Alert y no debajo del input.
- Una respuesta 204 no trae body: la app no tiene que intentar leer JSON de ella (se pide con `pedirSinRespuesta`).

## Decisiones

### Contrato con doggy-backend

- **Resuelta: 410 para links de asignación.** `GET /api/invitaciones/:token` y `POST /api/invitaciones/:token/aceptar` responden 410 si el código venció o ya se usó, y 404 si no existe.
- **Resuelta (Etapa 3B): `PATCH` en vez de `PUT`.** `actualizarRegistro` y `actualizarTurno` usan `PATCH` con todos los datos del formulario; en el registro, los opcionales que no vienen se mandan como `null` para que se borren.
- **Resuelta (Etapa 3B): flujos que escribían en el mock y leían de la API.** Alta de mascota y aceptar un código de asignación van contra la API (`POST /api/mascotas`, `GET /api/invitaciones/:token` y `POST /api/invitaciones/:token/aceptar`). Se borraron `mobile/src/data/mock.ts`, `simularRespuesta`, `siguienteId`, `idsMascotasDe` y `asignarCreador`; los datos de ejemplo viven en el seed de `doggy-backend`.
- **Resuelta (Etapa 3B): 204 sin body.** `pedirSinRespuesta` (`services/http.ts`) solo revisa `response.ok` y no lee JSON. La usan los DELETE.

### Código

- **Resuelta: efectos con setState (`react-hooks/set-state-in-effect`).** No se silencia con `eslint-disable`. Se resuelve así:
  - cargar datos al montar: separar una función que pide y devuelve los datos sin tocar el estado (como `pedirTodo` en `AppContext` o `leerGps` en `useUbicacion`) de otra que los aplica, y aplicarlos en el `.then` de la promesa, con una bandera `vigente` para la limpieza. La regla marca cualquier función con setState que se llame desde el efecto, aunque el setState esté después de un `await`;
  - reaccionar a un cambio de prop o param: ajustar el estado durante el render guardando el valor anterior (como `seleccionadoPrevio` en `ReporteMarker` o `reporteRecibido` en Perdidos), y dejar en el efecto solo lo imperativo (timers, mover el mapa);
  - dependencias de un hook que devuelve un objeto nuevo en cada render (como `gps`): desestructurar la función estable (`const { obtenerDireccion } = gps`) y depender de ella, nunca del objeto entero, porque genera un loop.

### Para revisar

- **Header de los modales en iOS.** La variante `bar` de `ScreenHeader` suma `insets.top`. En los modales tipo hoja (`reportar`, `mi-mascota-perdida`, `asignar`) puede sobrar espacio arriba. Verificar en un iPhone y, si sobra, no sumar el inset dentro de un modal.
- **Título del mes del calendario en web.** `adjustsFontSizeToFit` no funciona en el navegador: en pantallas de 320 px "Septiembre 2026" se corta con "…". En el celular se achica bien.
- **Foto de Nieve.** El reporte de ejemplo de Nieve (`prisma/seed.ts` de `doggy-backend`) no tiene foto y muestra el avatar con la inicial. Falta una foto de un perro blanco.
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
