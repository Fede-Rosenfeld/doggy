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
| Mis Mascotas | En construcción |
| Perfil de la mascota | En construcción |
| Carnet Sanitario | En construcción |
| Perdidos | En construcción |
| Reportar mascota perdida | En construcción |
| Agenda | En construcción |
| Mi Perfil | En construcción |

## Flujo actual

1. **Login**: email y contraseña con validación local. "Ingresar" entra a la tab Mascotas.
2. **Registro**: desde "Registrarme". Pide nombre, apellido, email, contraseña (mínimo 6 caracteres) y confirmación. Al crear la cuenta muestra una confirmación y entra a la app. "Ingresar" o la flecha vuelven al login.

## Componentes reutilizables

- `ScreenContainer`: safe area, fondo y scroll con ajuste al teclado.
- `Input`: label, ícono, foco, error y modo contraseña.
- `PrimaryButton`: variantes primaria (teal), secundaria (mostaza) y outline.
- `BackButton`: volver al stack anterior, en tono claro u oscuro.
- `TabBar`: barra inferior con la píldora de tab activa.

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
