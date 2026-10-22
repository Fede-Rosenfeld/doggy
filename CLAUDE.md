# Doggy — reglas del proyecto (Sprint 2)

Proyecto de la materia Programación de Aplicaciones Móviles (UCA).

- **Sprint 1 (hecho):** frontend en `mobile/` con Expo SDK 57, TypeScript estricto y Expo Router. Los datos viven en memoria (`mobile/src/data/mock.ts`) y los services simulan la red.
- **Sprint 2 (ahora):**
  - sumar `backend/` al lado de `mobile/` con Express + TypeScript + Prisma + SQLite;
  - sumar gestos con `react-native-gesture-handler` + `react-native-reanimated` (ya instalados en `mobile/`, no reinstalar).

Material de referencia en `_referencias/` (diseño, consignas y apuntes de la cátedra). No se versiona. Este archivo sí se versiona: lo compartimos entre los integrantes.

## Arquitectura en capas (la de la cátedra)

```
Expo (pantallas → AppContext → services) → HTTP → Express → Prisma → SQLite
```

- La app **nunca** toca la base: le pide los datos a la API.
- **Express** valida y decide (rutas, códigos de estado, permisos, reglas de negocio).
- **Prisma** define el modelo (`schema.prisma`) y hace las consultas. Los modelos salen de `mobile/src/types/models.ts`, que ya están pensados para eso: ids numéricos, fechas ISO y relaciones por id.
- Las etiquetas de un reporte (`string[]`) van en una tabla aparte, porque SQLite no tiene listas.

## Conectar el frontend sin tocar las pantallas

- Las pantallas y `mobile/src/context/AppContext.tsx` **no deberían cambiar** al conectar el backend.
- Lo que cambia son las funciones de `mobile/src/services/`: pasan de `simularRespuesta()` a `pedirJson()` (`mobile/src/services/http.ts`), manteniendo la misma firma y los mismos tipos de retorno.
- `pedirJson` ya revisa `response.ok` y lanza `Error` con el `{ error }` que manda el servidor. El contexto ya captura esos errores.
- La URL sale de `EXPO_PUBLIC_API_URL` (`mobile/src/config.ts`). Desde el celular hay que usar la IP local de la PC, no `localhost`.
- Si una pantalla necesita un cambio para el backend, frená y explicá por qué antes de tocarla.

### Endpoints que ya esperan los services

Cada función de `services/` tiene comentado su endpoint. Al implementarlo en Express, respetá esa ruta y ese cuerpo. Los comentarios que dicen `PUT` (registros y turnos) pasan a `PATCH` (ver Decisiones).

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

## Códigos de estado

La tabla de la práctica Prisma muestra los códigos que usó esa práctica, pero no es una lista cerrada. La regla es responder con el status que corresponde a cada caso:

| Status | Cuándo |
| --- | --- |
| 200 | GET o PATCH salió bien (PATCH para cambiar una parte, **nunca PUT**) |
| 201 | POST creó el recurso (se devuelve lo creado) |
| 204 | DELETE salió bien: `res.status(204).end()`, sin body |
| 400 | datos o id inválidos |
| 401 | sin sesión o token inválido |
| 403 | con sesión, pero sin permiso sobre ese recurso |
| 404 | no existe (incluye el `P2025` de Prisma) |
| 409 | conflicto con el estado actual: email ya registrado, ya asignado a la mascota, único dueño que quiere desasignarse |
| 410 | código de asignación vencido o ya usado |
| 500 | error imprevisto |

- Toda ruta `async` va con `try/catch`.
- Los errores siempre se devuelven como `{ error: "mensaje en español" }`, que es lo que `pedirJson` muestra en la app. No se filtran detalles internos (stack, SQL, mensajes de Prisma).

## Decisiones

- **Resuelta: 410 para links de asignación.** `GET /api/invitaciones/:token` y `POST /api/invitaciones/:token/aceptar` responden 410 si el código venció o ya se usó, y 404 si no existe.
- **Pendiente (Etapa 3): `PUT` en los services.** Los comentarios de `registros.ts` y `turnos.ts` dicen `PUT`; se pasan a `PATCH` cuando se conecten esos services.

## Datos de entrada

- El body **nunca** entra crudo a Prisma: se filtra a los campos permitidos (pick) de cada recurso. Nada de `prisma.x.create({ data: req.body })`.
- Los campos que asigna el servidor (`id`, `codigo`, `tutorId`, `autorId`, fechas de creación) no se aceptan desde el body.
- **La validación también va en el servidor:** se aplican las mismas reglas de `mobile/src/utils/validaciones.ts`, que son:
  - los largos máximos de `LIMITES`;
  - los caracteres permitidos de cada tipo de campo (nombres de persona, nombres de mascota y etiquetas, textos libres);
  - los formatos (email, teléfono de 8 a 15 dígitos, edad entera hasta 30, fechas y horas);
  - los rangos de fechas: una aplicación no puede ser futura ni de hace más de 30 años; el refuerzo tiene que ser posterior a la aplicación y no más de 5 años después; un turno tiene que ser a futuro y a no más de 2 años;
  - la limpieza de espacios (`limpiarTexto`).
- El servidor no puede aceptar algo que la app rechazaría ni rechazar algo que la app acepta. Si una regla cambia, cambia en los dos lados.

## Gestos (gesture-handler + reanimated)

- Se anima con `useSharedValue` y `useAnimatedStyle`, en el hilo de UI.
- `runOnJS` solo en `onEnd` (o en un callback final), **nunca** en `onUpdate`.
- Todo gesto tiene una alternativa tocable (botón o ícono) que hace lo mismo, por accesibilidad. El gesto es un atajo, no la única forma.
- Feedback con `expo-haptics` al cruzar un umbral (por ejemplo, cuando un swipe pasa el punto en que se va a confirmar), una sola vez por cruce.
- Animar solo `transform` y `opacity`.

## Código y estilo

- Código, nombres y comentarios en español, con el mismo estilo de JSDoc del repo:
  - encabezado `/** ... */` en cada archivo explicando qué es y qué rol cumple;
  - JSDoc en cada función, hook, componente, handler y ruta, con qué hace, qué recibe y qué devuelve;
  - secciones `// --- Estado ---`, `// --- Handlers ---`, `// --- Render ---`, `// --- Estilos ---` en los componentes largos.
- En el backend se sigue el mismo estilo (encabezado y JSDoc por ruta, con el verbo, la ruta y las respuestas posibles).
- Textos de la UI en español rioplatense ("Escaneá", "Gestioná", "vos").
- Estilos con `StyleSheet.create` y el theme de `mobile/src/theme/` (colores, tipografías, espaciado, radios y sombras). Nada de valores escritos a mano ni librerías de UI nuevas.
- TypeScript estricto en los dos proyectos, sin `any`.

## Se mantiene del Sprint 1

- Todo tiene que seguir funcionando en **Expo Go** (sin development build).
- En `mobile/` se instala siempre con `npx expo install <paquete>`.
- Doggy es solo para perros: no hay especie ni tamaño en modelos, formularios ni reportes.
- Ningún botón queda muerto: lo que todavía no existe muestra un `Alert` de "Disponible próximamente".
- Git: commits chicos, uno por unidad lógica, con mensajes en español, cortos y en imperativo, sin trailers `Co-Authored-By`. No cambiar `git config` ni hacer push salvo que se pida.
- `.gitignore` en la raíz: `.claude/`, `_referencias/`, `.env`, `.expo/`, `node_modules/`, `dist/`, `web-build/` y `*.log`. En `backend/` además van la base SQLite (`*.db`) y su `.env`; se versiona un `.env.example`.

## Antes de dar algo por terminado

1. `npx tsc --noEmit` en `mobile/` sin errores.
2. `npx tsc --noEmit` en `backend/` sin errores.
3. `npm run lint` en `mobile/` sin errores.
4. Hacer los commits y dar un resumen corto: qué se hizo, qué decisiones se tomaron, qué hay que probar y los commits que quedaron.
