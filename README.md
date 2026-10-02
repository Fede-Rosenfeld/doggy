# Doggy

App móvil para el cuidado y la seguridad de tu mascota. Permite gestionar las
mascotas de la familia, llevar su carnet sanitario, organizar turnos y, si una
mascota se pierde, reportarla en un mapa colaborativo e identificarla con un
código QR en la chapita del collar.

Proyecto de la materia Programación de Aplicaciones Móviles (UCA).
Sprint 1: frontend en React Native con datos estáticos.

## Integrantes

- Ignacio Gonzalez Iñigo y Juan Federico Rosenfeld

## Stack

- React Native + Expo (SDK 57) con TypeScript estricto
- Expo Router (Stack y Bottom Tabs sobre React Navigation)
- Context API para el estado global
- `StyleSheet` + Flexbox, sin librerías de UI
- Tipografías Quicksand y Plus Jakarta Sans (`@expo-google-fonts`)
- Íconos de `@expo/vector-icons` (Material Icons)
- `react-native-svg` + `react-native-qrcode-svg` para generar el QR de identificación
- `expo-location` + `react-native-maps` para el GPS y el mapa
- `expo-camera` + `expo-haptics` para el lector de QR, la linterna y la vibración

## Branding

| Uso | Color |
| --- | --- |
| Teal (headers, botones primarios, navegación) | `#1F7A6C` |
| Teal claro (estados activos, chips) | `#2E9C8A` |
| Mostaza (CTA críticos, alertas de perdidos) | `#E8A33D` |
| Crema (fondo global) | `#FFF8F0` |

- Títulos: **Quicksand** 600/700
- Texto y labels: **Plus Jakarta Sans** 400/600/700

## Cómo correrlo

Requisitos: Node LTS y la app Expo Go en el celular, conectado a la misma red
Wi-Fi que la PC.

```bash
cd mobile
npm install
npx expo start
```

Escaneá el QR que aparece en la terminal con la cámara (iOS) o con Expo Go (Android).

## Pantallas y flujo de navegación

```
Login ──► Registro
  │
  ▼  (router.replace: "atrás" no vuelve al login)
Tabs
 ├─ Mascotas ───┬─► Agregar mascota
 │              └─► Perfil de la mascota ─┬─► Editar mascota
 │                                        ├─► Carnet Sanitario ─► (modal) Nuevo registro
 │                                        ├─► tab Agenda
 │                                        └─► (modal) Se perdió mi mascota / Editar reporte
 ├─ Perdidos ───┬─► Mapa / Lista ─► (hoja) Detalle del reporte ─► (modal) Editar reporte
 │              └─► "+" ¿Qué querés reportar? ─┬─► (modal) Se perdió mi mascota ─┐
 │                                             └─► (modal) Encontré una mascota ─┴─► vuelve a Perdidos con el nuevo marker
 ├─ Agenda ─────── (modal) Nuevo turno
 └─ Perfil ─────┬─► (modal) Editar datos personales
                ├─► Familia y Cuidadores ─┬─► (hoja) Asignar: generar link con rol ─► compartir
                │                         └─► (hoja) Desasignarme
                ├─► Tengo un link de asignación ─► (modal) Asignación de mascota
                ├─► Mis reportes activos ─► tab Perdidos
                └─► Cerrar sesión ─► Login

Link de asignación (doggy://asignar?token=...) ─► (modal) Asignación de mascota ─► Perfil de la mascota
```

- **Stack raíz** (`app/_layout.tsx`): grupo `(auth)`, grupo `(tabs)` y los modales `mi-mascota-perdida`, `reportar` y `asignar` (`presentation: 'modal'`). `asignar` es también la ruta de los links de asignación (`doggy://asignar?token=...`, esquema `doggy` de `app.json`).
- **Bottom Tabs** (`app/(tabs)/_layout.tsx`): Mascotas, Perdidos, Agenda y Perfil, con una barra propia que marca la tab activa con una píldora.
- **Stack interno de Mascotas** (`app/(tabs)/mascotas/_layout.tsx`): listado, alta, perfil (`[id]`), edición (`[id]/editar`) y carnet (`[id]/carnet`), con la barra de tabs visible.
- Las acciones que dependen del backend (descargar QR, permisos finos por cuidador, recuperar contraseña) muestran un aviso de "Disponible próximamente"; no hay botones sin respuesta.

### Detalle por pantalla

1. **Login**: email y contraseña con validación local (formato del email y largo máximo). "Ingresar" entra a la tab Mascotas.
2. **Registro**: desde "Registrarme". Pide nombre, apellido (solo letras), email, contraseña (de 8 a 64 caracteres, sin espacios, con al menos una letra y un número) y confirmación. Al crear la cuenta muestra una confirmación y entra a la app. "Ingresar" o la flecha vuelven al login.
3. **Mis Mascotas**: listado de mascotas con foto, nombre y raza. Tocar una card abre su perfil, el botón "+" abre el alta y el avatar del header lleva a Perfil.
4. **Agregar mascota**: foto (al tocarla se elige entre sacarla en el momento con la cámara o elegirla de la galería), nombre, raza, edad y señas particulares. Al guardar se genera su ID único `DOGGY-XXXX-NOMBRE` y vuelve al listado, donde ya aparece.
5. **Perfil de la mascota**: foto, raza y edad; botón "Editar mascota"; código QR real generado con el ID único (para grabar en la placa del collar), con "Compartir" (hoja nativa de compartir) y "Descargar QR" (próximamente); señas particulares; resumen del carnet sanitario con la última vacuna ("Ver historial completo" abre el carnet); próximo turno ("Ir a la Agenda de Turnos" cambia a la tab Agenda) y "Reportar como perdida", que abre "Se perdió mi mascota" con esa mascota ya elegida. Si la mascota ya tiene un reporte de perdida activo, en lugar de ese botón aparece el aviso "Reportada como perdida" (desde cuándo, zona y radio de búsqueda) con "Editar reporte" y "Ya apareció". "Editar mascota" abre el mismo formulario del alta con los datos precargados (foto, nombre, raza, edad y señas); al guardar vuelve al perfil ya actualizado. El ID único no cambia aunque cambie el nombre, para que la placa ya grabada siga funcionando.
6. **Carnet Sanitario**: pestañas Vacunas / Desparasitación / Otros que filtran los registros, card destacada con el próximo refuerzo e historial de aplicaciones (todas con el badge "Aplicada") con fecha, profesional y, si tiene, fecha de refuerzo. En el carnet solo se cargan aplicaciones ya hechas: no hay registros pendientes. "Agregar Registro" abre un formulario (tipo, nombre, fecha de aplicación con máscara dd/mm/aaaa, veterinario y, opcional, la fecha del próximo refuerzo; en las vacunas, también opcional, la foto de la etiqueta) que valida que la aplicación no tenga fecha futura y que el refuerzo sea posterior a ella. La card de próximo refuerzo muestra el más cercano a futuro, tomando solo la última aplicación de cada vacuna o producto. Cada card (incluida la del próximo refuerzo) tiene un lápiz que abre el mismo formulario con los datos cargados para corregir un registro mal cargado; si se cambia el tipo, el carnet salta a esa pestaña. **Foto de la etiqueta:** al cargar o corregir una vacuna se puede sumar la foto del sticker que el veterinario pega en la libreta (marca, lote y vencimiento), como constancia. Al tocar el recuadro se elige entre sacarla en el momento o elegirla de la galería, con recorte apaisado; con la foto cargada se ve la vista previa (tocándola se abre grande) y los botones "Cambiar" y "Quitar". En la pestaña Vacunas cada card suma la fila "Etiqueta" con el link "Ver etiqueta" (o "—"), y la card del próximo refuerzo también muestra el link.
7. **Perdidos**: mapa de CABA con un marker por reporte (mostaza perdido, teal encontrado), botón "mi ubicación" que centra el mapa con el GPS y carrusel de cards debajo; tocar una card centra el mapa en ese reporte y tocar un marker lleva a su card. Tocar un marker o una card (en el carrusel o en la lista) abre una hoja con todo lo cargado en el reporte: foto circular y centrada como en el perfil de la mascota, con el estado debajo (al tocarla se abre grande y completa a pantalla completa), raza y etiquetas, cuándo (hace cuánto, fecha y hora), dónde, radio de búsqueda, señas o descripción e información adicional, con un aviso si el reporte es propio y el botón "Ver en el mapa". Si es el reporte de perdida de una mascota del usuario (o lo publicó él), la hoja suma "Editar reporte" y "Ya apareció". El toggle Mapa / Lista cambia a una lista vertical. El buscador filtra en local por nombre o barrio y el filtro por estado (perdidos / encontrados). Si el reporte seleccionado tiene radio de búsqueda, el mapa dibuja su círculo, y la card muestra el radio junto a la zona. El FAB mostaza pregunta qué se quiere reportar: "Se perdió mi mascota" o "Encontré una mascota". Si se niega la ubicación, el mapa queda en CABA y aparece un aviso para habilitarla.
8. **Reportes: mascota propia vs. mascota encontrada.** Son dos flujos distintos porque la persona y lo que sabe son distintos.
   - **Se perdió mi mascota** (modal `mi-mascota-perdida`): el tutor elige cuál de sus mascotas se perdió (llega elegida si se abre desde su perfil) y los datos salen del perfil sin volver a cargarlos (foto, nombre, raza, edad, señas e ID de la chapita). Marca en el mini mapa dónde la vio por última vez (precargado con el GPS) y un radio de búsqueda (200 m, 500 m, 1 km o 2 km) que se dibuja como un círculo mostaza alrededor del pin. Suma información del día (qué tenía puesto, arnés, cómo reacciona) y etiquetas. Si la mascota ya tiene un reporte activo, avisa. "Publicar como perdida" publica el reporte, vibra, cierra el modal y muestra el nuevo marker con su círculo en Perdidos. Si el usuario no tiene mascotas, ofrece cargar una.
   - **Editar reporte y "Ya apareció"**: el reporte de perdida se puede corregir y cerrar desde el detalle en Perdidos o desde el perfil de la mascota. Lo puede hacer quien lo publicó o cualquier persona que tenga la mascota en su cuenta (dueño o invitado), así si la encuentra otro integrante de la familia la saca del mapa sin esperar a quien la reportó. "Editar reporte" abre el mismo modal en modo edición, con el punto, el radio, la información adicional y las etiquetas ya cargados (la mascota y la fecha del extravío no cambian); "Guardar cambios" actualiza el marker y el círculo en el mapa. "Ya apareció" pide confirmación con un aviso nativo, cierra el reporte, vibra y lo saca del mapa y del conteo de "Mis reportes activos".
   - **Encontré una mascota** (modal `reportar`): para quien encontró un perro en la calle. Escáner del QR de la chapita (autocompleta nombre, raza, señas y foto), foto sacada en el momento o elegida de la galería, nombre (opcional: si no se sabe se publica como "Sin identificar"), raza, descripción, etiquetas y un mini mapa con el punto donde se la encontró. "Publicar como encontrada" publica el reporte como encontrado, vibra y muestra el marker teal en Perdidos.
9. **Agenda**: calendario mensual hecho a mano con `Date` (semana de lunes a domingo, navegación entre meses, día seleccionado, "Hoy" marcado y puntos de color por categoría en los días con turnos). Al tocar un día vibra suave (`Haptics.selectionAsync`) y lista sus turnos con hora, categoría, mascota, motivo y lugar. "Nuevo turno" abre un formulario (mascota, categoría, fecha, hora, motivo y lugar) que valida que el turno sea a futuro. El lápiz de cada turno abre el mismo formulario con sus datos para editarlo; al guardar, la agenda salta al nuevo día si se cambió la fecha. Al editar, la regla de "a futuro" solo aplica si se cambia la fecha o la hora, así se puede corregir el motivo o el lugar de un turno que ya pasó.
10. **Mi Perfil**: foto de perfil editable, sacada con la cámara o elegida de la galería, nombre, ubicación y cantidad de mascotas registradas (calculada desde el estado global). "Editar datos personales" abre un formulario (nombre, apellido, ubicación, email, teléfono de emergencia y WhatsApp). Card de contacto de emergencia, familia y cuidadores agrupados por mascota, menú (notificaciones, link de asignación, mis reportes activos con el conteo real, ayuda y "Guía de paseos y normativas CABA", que abre en el navegador la página oficial de la Ciudad [Perros y gatos en el espacio público](https://buenosaires.gob.ar/gcaba_historico/agenciaambiental/animalesba/perros-y-gatos-en-el-espacio-publico): correa y collar o pretal, bozal si es agresivo, chapita con nombre y teléfono, levantar la caca y soltarlo solo en caniles. El incumplimiento está penado por el art. 1.3.12 del Código Contravencional, según la Ley 6839/2025, con multas de 150 a 1.000 unidades fijas) y "Cerrar sesión", que vuelve al login sin dejar historial.
11. **Asignación de mascotas (dueño / invitado).** Cada persona asignada a una mascota tiene un rol:
    - **Dueño**: puede asignar la mascota a otras personas. Quien da de alta una mascota queda como dueño.
    - **Invitado**: tiene la mascota en su cuenta (perfil, carnet, turnos), pero no puede asignarla a nadie.

    En Perfil → Familia y Cuidadores, cada mascota lista a sus personas con su rol (el usuario marcado como "Vos"). Solo si el usuario es dueño aparece "+ Asignar a…", que abre una hoja para elegir el rol y generar un link (`doggy://asignar?token=XXXX`; en Expo Go, la URL de desarrollo equivalente) con un código de 8 caracteres, para compartir con la hoja nativa. El link sirve para una sola persona y vence a los 7 días. Al abrirlo (o al pegar el link o el código en "Tengo un link de asignación") se ve la mascota y el rol ofrecido; "Aceptar" la suma a la cuenta y abre su perfil. Si el link no existe, ya se usó, venció o el usuario ya está asignado, la pantalla lo explica.

    Cualquiera puede **desasignarse** con "Desasignarme de…": la mascota sale de su cuenta (con su carnet y turnos) y las demás personas la siguen teniendo. El único dueño no puede desasignarse, para que la mascota no quede sin nadie que la administre; la app le pide sumar antes a otro dueño. Para probarlo con los datos de ejemplo: en "Tengo un link de asignación" cargar el código **TOBY2026**, que suma a Toby (de otra usuaria) como invitado.

## Componentes nativos

### 1. Fototeca y cámara para fotos — `expo-image-picker`

- **Dónde:** alta y edición de mascota, foto del reporte de mascota encontrada, foto de perfil y foto de la etiqueta de una vacuna en el carnet (galería o cámara), y lectura de un QR desde una captura (solo galería). Implementado en `src/hooks/useFototeca.ts`.
- **Qué hace:** al tocar la foto pregunta de dónde sacarla, con la hoja de acciones nativa en iOS (`ActionSheetIOS`) y un aviso con botones en Android: "Sacar foto" abre la cámara del sistema (`launchCameraAsync`, cámara trasera) y "Elegir de la galería" abre el selector de imágenes (`launchImageLibraryAsync`). En los dos casos hay recorte cuadrado (`allowsEditing`, `aspect: [1, 1]`) y compresión (`quality: 0.7`), y se devuelve la URI local de la foto. En web va directo al selector de archivos.
- **Permiso de cámara:** se pide recién cuando el usuario elige "Sacar foto", con el mismo flujo (`getCameraPermissionsAsync` → `requestCameraPermissionsAsync`). El texto de `NSCameraUsageDescription` está en los plugins de `expo-image-picker` y `expo-camera` y explica los dos usos (sacar fotos y escanear el QR). Si se niega, `AvisoPermisoFoto` explica qué permiso falta y recuerda que se puede usar la otra opción.
- **Permiso:** acceso a la biblioteca de fotos (`NSPhotoLibraryUsageDescription` en iOS), declarado con el plugin de `expo-image-picker` en `app.json` y un texto en español que explica para qué se usa. En tiempo de ejecución se sigue el flujo consultar (`getMediaLibraryPermissionsAsync`) → pedir (`requestMediaLibraryPermissionsAsync`) → evaluar el resultado. Si el usuario lo niega y `canAskAgain` es `false`, la pantalla muestra un `PermissionNotice` que explica el motivo y ofrece `Linking.openSettings()`.
- **Por qué:** la foto es el dato que más ayuda a que un vecino reconozca a una mascota perdida. La galería permite reutilizar fotos que el usuario ya tiene de su mascota; la cámara sirve cuando no tiene una buena foto guardada o, al reportar una mascota encontrada, para sacarle una foto ahí mismo.

### 2. GPS / Geolocalización — `expo-location` + `react-native-maps`

- **Dónde:** pantalla Perdidos (y el mini mapa del reporte de extravío). Implementado en `src/hooks/useUbicacion.ts`.
- **Qué hace:** sigue el patrón de hook tipado de la cátedra. Primero verifica que los servicios de ubicación estén activos (`hasServicesEnabledAsync`), después pide el permiso en primer plano (`getForegroundPermissionsAsync` → `requestForegroundPermissionsAsync`) y hace una lectura puntual con `getCurrentPositionAsync` y `Accuracy.High`. Con `reverseGeocodeAsync` traduce las coordenadas a una dirección legible (calle, número y barrio). La posición se dibuja en un `MapView` nativo (Apple Maps en iOS, Google Maps en Android) con `showsUserLocation`, y la cámara se mueve con `animateToRegion`.
- **Permiso:** ubicación "mientras se usa la app" (`locationWhenInUsePermission`), declarada con el plugin de `expo-location` en `app.json`. No se pide ubicación en segundo plano porque la app solo la necesita con la pantalla abierta. Si se niega, el mapa arranca centrado en CABA y un `PermissionNotice` ofrece volver a pedirla o abrir los ajustes.
- **Por qué:** cuando una mascota se pierde, lo que importa es la cercanía. Con la posición del usuario el mapa muestra primero los reportes de su zona, y al reportar se registra el punto exacto de extravío en vez de depender de una dirección escrita a mano. Se usa una consulta puntual (no `watchPositionAsync`) porque no hace falta seguir al usuario en tiempo real y así se ahorra batería.

### 3. Cámara (lector de QR y linterna) — `expo-camera` + `expo-haptics`

- **Dónde:** modal Encontré una mascota. Implementado en `src/components/reporte/EscanerQr.tsx`.
- **Qué hace:** monta un `CameraView` con `barcodeScannerSettings={{ barcodeTypes: ['qr'] }}` y `onBarcodeScanned`. Cuando lee un código con formato `DOGGY-XXXX-NOMBRE`, busca la mascota en el estado global y autocompleta el formulario. Tras la primera lectura se bloquean las siguientes (el lector dispara varias veces por segundo mientras el QR está en cuadro) y la cámara se desmonta. Permite prender el flash como linterna (`enableTorch`) para leer chapitas de noche, cambiar a la cámara frontal (`facing`) y leer un QR desde una imagen de la galería con `scanFromURLAsync`. Cada lectura se confirma con `Haptics.notificationAsync` (éxito o error).
- **Permiso:** cámara, pedido con `useCameraPermissions` recién cuando el usuario toca "Escanear" y declarado con el plugin de `expo-camera` en `app.json` (sin micrófono, porque no se graba audio). Si se niega, se muestra un `PermissionNotice` y queda la alternativa de subir una foto del QR.
- **Por qué:** quien encuentra un perro suele estar en la calle, apurado y con una mano ocupada. Escanear la chapita identifica a la mascota y trae sus datos en un segundo, sin tipear un código. La cámara solo se enciende a pedido y se apaga al leer para no gastar batería.

## Validación de datos

Todos los formularios validan en local antes de guardar, con las reglas centralizadas en `src/utils/validaciones.ts`. El error aparece en rojo debajo del campo y se borra apenas se corrige.

- **Largo máximo:** cada campo tiene su límite en `LIMITES`, que se usa también como `maxLength` del input, así no se puede escribir de más (nombre y apellido 40, email 100, contraseña 64, ubicación 60, nombre de mascota 30, raza 40, señas 200, descripción e información adicional 300, etiqueta 24, motivo y lugar del turno 80, nombre del registro y profesional 60). Los textos largos muestran el contador de caracteres.
- **Caracteres permitidos:** nombres y apellidos solo con letras (con tildes, ñ y ü), espacios, guiones y apóstrofes; nombres de mascota, razas y etiquetas con letras, números, espacios, puntos y guiones (y al menos una letra); los textos libres (señas, descripción, motivo, lugar, veterinario, ubicación) con letras, números y la puntuación común, incluidas las comillas y guiones que iOS pone solo. No se aceptan emojis, símbolos como `< > { } * =`, caracteres invisibles ni textos hechos solo de números o signos ("!!!!"); el mensaje dice qué carácter sacar.
- **Formatos:** email `usuario@dominio.ext` (se guarda en minúsculas), teléfono de 8 a 15 dígitos (las letras se descartan mientras se escribe), edad entera hasta 30 años, fechas `dd/mm/aaaa` reales y horas `HH:MM`.
- **Rangos de fechas:** una aplicación del carnet no puede ser futura ni de hace más de 30 años; el refuerzo tiene que ser posterior a la aplicación y no más de 5 años después; un turno tiene que ser a futuro y a no más de 2 años.
- **Limpieza:** antes de guardar se sacan los espacios de los bordes y los repetidos, y en los textos de varias líneas se deja como mucho una línea en blanco seguida (`limpiarTexto`).

## Datos y arquitectura

La app ya está separada en capas para sumar el backend sin tocar las pantallas:

```
Pantalla → AppContext (estado global) → services → [hoy: datos en memoria | Sprint 2: fetch a la API]
```

- `src/types/models.ts`: modelos (`Usuario`, `Mascota`, `RegistroSanitario`, `Turno`, `ReportePerdida`, `Cuidador` con su `RolMascota` dueño/invitado, `Invitacion`) con ids numéricos y fechas ISO, pensados como los futuros modelos de Prisma.
- `src/data/mock.ts`: datos de ejemplo (Sofía Romero y sus mascotas Luna, Roco y Milo, reportes en CABA, turnos de octubre de 2026, y Toby, de otra usuaria, con el link de asignación `TOBY2026` para probar el flujo de invitado).
- `src/services/`: una función `async` por operación, con el endpoint REST que le va a corresponder (`GET /api/mascotas`, `POST /api/reportes`, `PATCH /api/usuarios/me`, etc.). Hoy simulan la demora de la red.
- `src/context/AppContext.tsx`: carga todo en paralelo al iniciar y expone las acciones (agregar y editar mascota, crear, editar y cerrar reporte, agregar y editar registro sanitario, agregar y editar turno, actualizar usuario, generar, ver y aceptar links de asignación, desasignarse, iniciar y cerrar sesión).

## Componentes reutilizables

- `ScreenContainer`: safe area, fondo y scroll con ajuste al teclado.
- `Input`: label, ícono, foco, error y modo contraseña; en los textos largos muestra el contador de caracteres (`120/300`).
- `PrimaryButton`: variantes primaria (teal), secundaria (mostaza), outline, tonal y de peligro, en dos tamaños.
- `BackButton`: volver al stack anterior, en tono claro u oscuro.
- `TabBar`: barra inferior con la píldora de tab activa.
- `AppHeader`: marca y avatar del usuario con acceso al perfil.
- `IconButton`: botón circular de un ícono, resaltable (buscar y filtrar en Perdidos).
- `AvatarPerfil`: avatar clickeable del usuario que lleva a Perfil; lo usan `AppHeader` y `ScreenHeader` para que aparezca en todas las pantallas.
- `Avatar`: foto circular con respaldo de inicial y huella si no hay imagen.
- `VisorFoto`: modal a pantalla completa para ver una foto grande y entera, con fondo oscuro y botón de cerrar.
- `PetCard`: card de mascota del listado.
- `Fab`: botón flotante mostaza, simple o extendido con texto.
- `Cargando` / `EstadoVacio`: estados de carga, vacío y error de las listas.
- `ScreenHeader`: volver, título, subtítulo y avatar del usuario para pantallas internas.
- `Chip`: píldora informativa o seleccionable.
- `FotoEditable`: foto circular con botón de cámara para sacar o elegir la imagen.
- `AvisoPermisoFoto`: aviso de permiso de galería o cámara denegado, con el texto según lo que se intentó usar.
- `PermissionNotice`: aviso de permiso denegado con acceso a los ajustes.
- `Badge`: etiqueta de estado ("Placa & Collar", "Aplicada", "URGENTE").
- `SectionCard`: card de sección con decoración, acción y pie con link.
- `QrIdentificacion`: card con el QR de la mascota y las acciones de compartir y descargar.
- `SegmentedControl`: pestañas con subrayado o en píldora (Mapa / Lista).
- `FormModal`: hoja modal que sube desde abajo para formularios cortos.
- `mascotas/MascotaForm`: formulario de mascota (foto, nombre, raza, edad y señas) compartido por el alta y la edición.
- `carnet/RegistroCard`, `carnet/ProximoRefuerzoCard`, `carnet/RegistroForm`, `carnet/FotoEtiqueta`, `carnet/VerEtiqueta`: piezas del carnet sanitario. Las cards tienen todas la misma estructura (ícono del tipo, nombre, badge "Aplicada", lápiz para editar y filas fijas de aplicación, profesional y refuerzo, más la de etiqueta en las vacunas) y `RegistroForm` sirve tanto para el alta como para corregir un registro. `FotoEtiqueta` es el campo opcional de la foto de la etiqueta (cámara o galería) y `VerEtiqueta`, el link que la abre en grande.
- `perdidos/DetalleReporte`: hoja con el detalle completo de un reporte (usa `FormModal`) y, si la mascota es del usuario, las acciones "Editar reporte" y "Ya apareció".
- `src/hooks/useCerrarReporte.ts`: confirmación y cierre de un reporte cuando la mascota aparece, compartido por el detalle en Perdidos, el perfil de la mascota y la edición del reporte.
- `perdidos/MapaReportes`: mapa con markers y método `centrar` por ref (con una versión `.web.tsx` que muestra un aviso, porque react-native-maps no funciona en el navegador).
- `perdidos/ReporteCard`, `perdidos/ReporteMarker`: card y pin de cada reporte.
- `reporte/EscanerQr`: escáner de QR con linterna, cámara frontal y lectura desde imagen.
- `reporte/MapaSelector`: mini mapa con pin arrastrable y, opcional, el círculo del radio de búsqueda (con versión `.web.tsx`).
- `reporte/EtiquetasInput`: chips de etiquetas con alta y baja.
- `reporte/SelectorMascota`: fila deslizable de las mascotas del usuario para elegir cuál se perdió.
- `reporte/ResumenMascota`: card de solo lectura con los datos del perfil que se publican en el reporte.
- `agenda/Calendario`: calendario mensual con puntos por categoría y leyenda (la lógica de fechas está documentada en `src/utils/calendario.ts`).
- `agenda/TurnoCard`, `agenda/TurnoForm`: card de turno (con lápiz para editar) y formulario que sirve para agendar y para editar.
- `MenuRow`: fila de menú con ícono, badge, flecha o un elemento propio (Switch).
- `SectionTitle`: título de sección con ícono en círculo y badge.
- `perfil/ContactoEmergencia`, `perfil/CuidadoresMascota`, `perfil/EditarPerfilForm`: piezas del perfil de usuario. `CuidadoresMascota` muestra el rol de cada persona y, según el rol del usuario, "Asignar" (solo dueños) y "Desasignarme".
- `perfil/InvitarForm`: elige el rol (Dueño / Invitado), genera el link de asignación y lo comparte.
- `src/utils/invitaciones.ts`: arma el link a partir del código (`expo-linking`) y saca el código de un link pegado.

## Estructura

```
doggy/
└── mobile/                  app Expo
    ├── app.json
    ├── assets/images/       logo, ícono y splash
    ├── app/                 rutas (Expo Router)
    │   ├── _layout.tsx      Stack raíz, fuentes y splash
    │   ├── index.tsx        redirige a /login
    │   ├── (auth)/          login y registro
    │   ├── (tabs)/          Mascotas, Perdidos, Agenda y Perfil
    │   │   └── mascotas/    stack interno: listado, alta, perfil y carnet
    │   └── reportar.tsx     modal de reporte
    └── src/
        ├── theme/           colores, tipografías, espaciado y sombras
        ├── components/      componentes reutilizables
        ├── context/         estado global
        ├── hooks/           hooks propios
        ├── services/        acceso a datos (hoy mocks, luego la API)
        ├── data/            datos de ejemplo
        ├── types/           modelos
        ├── utils/           validaciones y helpers
        └── config.ts        URL de la API (EXPO_PUBLIC_API_URL)
```

## Próximos sprints

- **Sprint 2 — Backend:** se suma `backend/` al lado de `mobile/` con Express + TypeScript + Prisma + SQLite, siguiendo la arquitectura en capas vista en la práctica (Expo → HTTP → Express → Prisma → SQLite). Los modelos de `src/types/models.ts` pasan a ser el `schema.prisma` y cada función de `src/services/` reemplaza la simulación por ``pedirJson(`${API_URL}/api/...`)``, que ya revisa `response.ok` y devuelve el error del servidor. Las pantallas y el contexto no cambian.
- **Configuración:** la URL del backend se lee de la variable `EXPO_PUBLIC_API_URL` (ver `src/config.ts`). Para probar desde el celular hay que usar la IP local de la PC, no `localhost`:

  ```bash
  # mobile/.env
  EXPO_PUBLIC_API_URL=http://192.168.0.10:3000
  ```

- **Código único de vacuna (SENASA):** cada aplicación del carnet va a llevar el código único de la vacuna, validado contra una API de SENASA (o la fuente oficial que corresponda), para que el carnet sirva como constancia. Queda marcado con un `TODO` en `RegistroSanitario` (`src/types/models.ts`).
- **Pendientes que dependen del backend:** login real con token, persistencia de mascotas, reportes y turnos, subida de fotos, baja de turnos, links de asignación entre usuarios reales (hoy se prueban con un solo usuario y el código de ejemplo), recordatorios por notificaciones push y descarga del QR como imagen.
