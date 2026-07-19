# SCUNSIS

Sistema de Constancias Universitario — Aplicación web para la generación, gestión e historial de constancias académicas.

## Tecnologías

| Tecnología | Versión |
|---|---|
| **Vue 3** (Composition API) | ^3.5.13 |
| **Vite** | ^6.3.5 |
| **Vuetify 3** | ^3.8.8 |
| **vue-router** | ^4.5.1 |
| **vue-toastification** | ^2.0.0-rc.5 |
| **jsPDF** | ^3.0.1 |
| **pdf-lib** | ^1.17.1 |
| **pdfjs-dist** | ^5.3.31 |
| **xlsx** | ^0.18.5 |
| **@mdi/font** (íconos) | ^7.4.47 |

## Funcionalidades

- **Autenticación** con JWT y control de roles (ADMIN, usuario estándar).
- **Generación de constancias** en PDF con datos de participantes.
- **Historial** de constancias generadas.
- **Edición de plantillas** de constancias (papel membretado).
- **Configuración** del sistema (solo ADMIN).
- **Cambio de contraseña** obligatorio al primer ingreso.
- **Importación/exportación** de archivos Excel (.xlsx).
- Diseño responsivo con Vuetify 3.
- Contenedor Docker para producción con Nginx.

## Requisitos

- Node.js >= 22
- npm >= 10

> [!NOTE]
> Este proyecto usa **ESM nativo** (`"type": "module"` en `package.json`). Asegúrate de usar Node.js 22 o superior.

## Instalación y uso

```bash
# Clonar el repositorio
git clone <url-del-repo>
cd SCUNSIS

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Compilar para producción
npm run build

# Vista previa de la compilación
npm run preview
```

El servidor de desarrollo corre en `http://localhost:5173` por defecto.

## Despliegue con Docker

> [!TIP]
> Si levantas el proyecto con **docker-compose** (junto al backend), no necesitas construir ni ejecutar la imagen manualmente.

```bash
# Construir la imagen
docker build -t scunsis .

# Ejecutar el contenedor
docker run -p 80:80 scunsis
```

El `nginx.conf` incluido redirige las peticiones `/api/` al backend (`backend:8082`).

## Estructura del proyecto

```
SCUNSIS/
├── public/             # Archivos estáticos (imágenes)
├── src/
│   ├── assets/         # SVG y recursos gráficos
│   ├── common/         # Constantes de API
│   ├── components/     # Componentes reutilizables
│   ├── store/          # Estado global (auth)
│   ├── utils/          # Utilidades (fetch wrapper)
│   ├── views/          # Vistas/páginas de la aplicación
│   ├── App.vue         # Componente raíz
│   ├── main.js         # Punto de entrada
│   ├── router.js       # Configuración de rutas
│   └── style.css       # Estilos globales
├── Dockerfile          # Build multi-etapa Docker
├── nginx.conf          # Configuración de Nginx para producción
└── package.json
```

## Autenticación

El sistema usa autenticación basada en tokens JWT almacenados en `localStorage`. Las rutas protegidas redirigen al login si no hay token válido. La ruta `/configuracion` está restringida a usuarios con rol `ADMIN`.

> [!WARNING]
> El token JWT se guarda en `localStorage`. No almacenes información sensible en el token ni uses este mecanismo si requieres cumplir con estándares de seguridad avanzados (OWASP recomienda usar cookies `httpOnly`).

## API

El frontend espera un backend REST en `/api/v1/`. Las rutas se definen en `src/common/ConstClass.js`. Todas las peticiones incluyen el token `Bearer` en el encabezado `Authorization` de forma automática.

> [!IMPORTANT]
> El backend debe estar corriendo y accesible para que el frontend funcione correctamente. En producción, el `nginx.conf` redirige `/api/` al contenedor `backend:8082`.

> [!CAUTION]
> No expongas el frontend en producción sin un proxy inverso (como Nginx) que gestione el enrutamiento de la SPA y la comunicación con el backend.
