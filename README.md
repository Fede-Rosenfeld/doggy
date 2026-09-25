# Doggy

App móvil para el cuidado y la seguridad de tu mascota. Permite gestionar las
mascotas de la familia, llevar su carnet sanitario, organizar turnos y, si una
mascota se pierde, reportarla en un mapa colaborativo e identificarla con un
código QR en la chapita del collar.

Proyecto de la materia Programación de Aplicaciones Móviles (UCA).
Sprint 1: frontend en React Native con datos estáticos.

## Integrantes

- Nombre Apellido

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

## Pantallas

| Pantalla | Estado |
| --- | --- |
| Login | Lista |
| Registro | Lista |
| Mis Mascotas | Lista |
| Agregar mascota | Lista |
| Perfil de la mascota | Lista |
| Carnet Sanitario | Lista |
| Perdidos | Lista |
| Reportar mascota perdida | Lista |
| Agenda | En construcción |
| Mi Perfil | En construcción |

## Flujo actual

1. **Login**: email y contraseña con validación local. "Ingresar" entra a la tab Mascotas.
2. **Registro**: desde "Registrarme". Pide nombre, apellido, email, contraseña (mínimo 6 caracteres) y confirmación. Al crear la cuenta muestra una confirmación y entra a la app. "Ingresar" o la flecha vuelven al login.
3. **Mis Mascotas**: listado de mascotas con foto, nombre y raza. Tocar una card abre su perfil, el botón "+" abre el alta y el avatar del header lleva a Perfil.
4. **Agregar mascota**: foto desde la galería, nombre, raza, edad y señas particulares. Al guardar se genera su ID único `DOGGY-XXXX-NOMBRE` y vuelve al listado, donde ya aparece.
5. **Perfil de la mascota**: foto, raza y edad; código QR real generado con el ID único (para grabar en la placa del collar), con "Compartir" (hoja nativa de compartir) y "Descargar QR" (próximamente); señas particulares; resumen del carnet sanitario con la última vacuna ("Ver historial completo" abre el carnet); próximo turno ("Ir a la Agenda de Turnos" cambia a la tab Agenda) y "Reportar como perdida", que abre el modal de reporte con la mascota precargada.
6. **Carnet Sanitario**: pestañas Vacunas / Desparasitación / Otros que filtran los registros, card destacada con el próximo refuerzo pendiente e historial con estado, fecha y profesional. "Agregar Registro" abre un formulario (tipo, estado, nombre, fecha con máscara dd/mm/aaaa y veterinario) que valida que lo aplicado no tenga fecha futura y lo pendiente no sea pasado.
7. **Perdidos**: mapa de CABA con un marker por reporte (mostaza perdido, teal encontrado), botón "mi ubicación" que centra el mapa con el GPS y carrusel de cards debajo; tocar una card centra el mapa en ese reporte y tocar un marker lleva a su card. El toggle Mapa / Lista cambia a una lista vertical. El buscador filtra en local por nombre o barrio y el filtro por estado (perdidos / encontrados). El FAB mostaza abre el reporte. Si se niega la ubicación, el mapa queda en CABA y aparece un aviso para habilitarla.
8. **Reportar mascota perdida** (modal): escáner del QR de la chapita (autocompleta nombre, raza, señas y foto de la mascota), foto desde la galería, nombre, raza, descripción, etiquetas y un mini mapa con el pin precargado con el GPS, que se puede arrastrar o mover tocando el mapa, con la dirección legible debajo. Si se abre desde el perfil de una mascota, llega precargado. "Marcar como Perdido" valida, publica el reporte, vibra, cierra el modal y muestra el nuevo marker seleccionado en Perdidos.

## Componentes nativos

### 1. Fototeca (galería de imágenes) — `expo-image-picker`

- **Dónde:** alta de mascota (y más adelante reporte de perdida y foto de perfil). Implementado en `src/hooks/useFototeca.ts`.
- **Qué hace:** abre el selector nativo de imágenes del sistema operativo (`launchImageLibraryAsync`) con recorte cuadrado (`allowsEditing`, `aspect: [1, 1]`) y compresión (`quality: 0.7`), y devuelve la URI local del archivo elegido.
- **Permiso:** acceso a la biblioteca de fotos (`NSPhotoLibraryUsageDescription` en iOS), declarado con el plugin de `expo-image-picker` en `app.json` y un texto en español que explica para qué se usa. En tiempo de ejecución se sigue el flujo consultar (`getMediaLibraryPermissionsAsync`) → pedir (`requestMediaLibraryPermissionsAsync`) → evaluar el resultado. Si el usuario lo niega y `canAskAgain` es `false`, la pantalla muestra un `PermissionNotice` que explica el motivo y ofrece `Linking.openSettings()`.
- **Por qué:** la foto es el dato que más ayuda a que un vecino reconozca a una mascota perdida. Tomarla de la galería evita obligar al usuario a sacar una foto nueva en el momento y reutiliza fotos que ya tiene de su mascota.

## Datos y arquitectura

La app ya está separada en capas para sumar el backend sin tocar las pantallas:

```
Pantalla → AppContext (estado global) → services → [hoy: datos en memoria | Sprint 2: fetch a la API]
```

- `src/types/models.ts`: modelos (`Usuario`, `Mascota`, `RegistroSanitario`, `Turno`, `ReportePerdida`, `Cuidador`) con ids numéricos y fechas ISO, pensados como los futuros modelos de Prisma.
- `src/data/mock.ts`: datos de ejemplo (Sofía Romero y sus mascotas Luna, Roco y Milo, reportes en CABA y turnos de octubre de 2026).
- `src/services/`: una función `async` por operación, con el endpoint REST que le va a corresponder (`GET /api/mascotas`, `POST /api/reportes`, `PATCH /api/usuarios/me`, etc.). Hoy simulan la demora de la red.
- `src/context/AppContext.tsx`: carga todo en paralelo al iniciar y expone las acciones (agregar mascota, crear reporte, agregar registro sanitario, agregar turno, actualizar usuario, iniciar y cerrar sesión).

### 2. GPS / Geolocalización — `expo-location` + `react-native-maps`

- **Dónde:** pantalla Perdidos (y el mini mapa del reporte de extravío). Implementado en `src/hooks/useUbicacion.ts`.
- **Qué hace:** sigue el patrón de hook tipado de la cátedra. Primero verifica que los servicios de ubicación estén activos (`hasServicesEnabledAsync`), después pide el permiso en primer plano (`getForegroundPermissionsAsync` → `requestForegroundPermissionsAsync`) y hace una lectura puntual con `getCurrentPositionAsync` y `Accuracy.High`. Con `reverseGeocodeAsync` traduce las coordenadas a una dirección legible (calle, número y barrio). La posición se dibuja en un `MapView` nativo (Apple Maps en iOS, Google Maps en Android) con `showsUserLocation`, y la cámara se mueve con `animateToRegion`.
- **Permiso:** ubicación "mientras se usa la app" (`locationWhenInUsePermission`), declarada con el plugin de `expo-location` en `app.json`. No se pide ubicación en segundo plano porque la app solo la necesita con la pantalla abierta. Si se niega, el mapa arranca centrado en CABA y un `PermissionNotice` ofrece volver a pedirla o abrir los ajustes.
- **Por qué:** cuando una mascota se pierde, lo que importa es la cercanía. Con la posición del usuario el mapa muestra primero los reportes de su zona, y al reportar se registra el punto exacto de extravío en vez de depender de una dirección escrita a mano. Se usa una consulta puntual (no `watchPositionAsync`) porque no hace falta seguir al usuario en tiempo real y así se ahorra batería.

### 3. Cámara (lector de QR y linterna) — `expo-camera` + `expo-haptics`

- **Dónde:** modal Reportar mascota perdida. Implementado en `src/components/reporte/EscanerQr.tsx`.
- **Qué hace:** monta un `CameraView` con `barcodeScannerSettings={{ barcodeTypes: ['qr'] }}` y `onBarcodeScanned`. Cuando lee un código con formato `DOGGY-XXXX-NOMBRE`, busca la mascota en el estado global y autocompleta el formulario. Tras la primera lectura se bloquean las siguientes (el lector dispara varias veces por segundo mientras el QR está en cuadro) y la cámara se desmonta. Permite prender el flash como linterna (`enableTorch`) para leer chapitas de noche, cambiar a la cámara frontal (`facing`) y leer un QR desde una imagen de la galería con `scanFromURLAsync`. Cada lectura se confirma con `Haptics.notificationAsync` (éxito o error).
- **Permiso:** cámara, pedido con `useCameraPermissions` recién cuando el usuario toca "Escanear" y declarado con el plugin de `expo-camera` en `app.json` (sin micrófono, porque no se graba audio). Si se niega, se muestra un `PermissionNotice` y queda la alternativa de subir una foto del QR.
- **Por qué:** quien encuentra un perro suele estar en la calle, apurado y con una mano ocupada. Escanear la chapita identifica a la mascota y trae sus datos en un segundo, sin tipear un código. La cámara solo se enciende a pedido y se apaga al leer para no gastar batería.

## Componentes reutilizables

- `ScreenContainer`: safe area, fondo y scroll con ajuste al teclado.
- `Input`: label, ícono, foco, error y modo contraseña.
- `PrimaryButton`: variantes primaria (teal), secundaria (mostaza) y outline.
- `BackButton`: volver al stack anterior, en tono claro u oscuro.
- `TabBar`: barra inferior con la píldora de tab activa.
- `AppHeader`: marca y avatar del usuario con acceso al perfil.
- `Avatar`: foto circular con respaldo de inicial y huella si no hay imagen.
- `PetCard`: card de mascota del listado.
- `Fab`: botón flotante mostaza, simple o extendido con texto.
- `Cargando` / `EstadoVacio`: estados de carga, vacío y error de las listas.
- `ScreenHeader`: volver, título y subtítulo para pantallas internas.
- `Chip`: píldora informativa o seleccionable.
- `FotoEditable`: foto circular con botón de cámara para elegir imagen.
- `PermissionNotice`: aviso de permiso denegado con acceso a los ajustes.
- `Badge`: etiqueta de estado ("Placa & Collar", "Aplicada", "URGENTE").
- `SectionCard`: card de sección con decoración, acción y pie con link.
- `QrIdentificacion`: card con el QR de la mascota y las acciones de compartir y descargar.
- `SegmentedControl`: pestañas con subrayado para filtrar listas.
- `FormModal`: hoja modal que sube desde abajo para formularios cortos.
- `carnet/RegistroCard`, `carnet/ProximoRefuerzoCard`, `carnet/NuevoRegistroForm`: piezas del carnet sanitario.
- `perdidos/MapaReportes`: mapa con markers y método `centrar` por ref (con una versión `.web.tsx` que muestra un aviso, porque react-native-maps no funciona en el navegador).
- `perdidos/ReporteCard`, `perdidos/ReporteMarker`: card y pin de cada reporte.
- `reporte/EscanerQr`: escáner de QR con linterna, cámara frontal y lectura desde imagen.
- `reporte/MapaSelector`: mini mapa con pin arrastrable (con versión `.web.tsx`).
- `reporte/EtiquetasInput`: chips de etiquetas con alta y baja.

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

En el Sprint 2 se suma una carpeta `backend/` al lado de `mobile/`, con
Express + Prisma + SQLite.
