# 🚗 CarTrack

**Aplicación web responsiva para la asignatura de **Capstone**. Ofrece funcionalidades para la gestión, análisis y transferencia de vehículos personales**

## 🔧 Requisitos Previos
1. **Node.js** (versión 18 o superior)
2. **PostgreSQL** (versión 12 o superior)
3. **Angular CLI** - Se instalará globalmente
4. **Git** - Para clonar el repositorio

## � Pasos para Configurar CarTrack desde Cero

### 🚀 **Paso 1: Clonar el Repositorio**
```bash
git clone https://github.com/salvadorbravo09/CarTrack.git
cd CarTrack
```

### 🗄️ **Paso 2: Configurar la Base de Datos**
1. **Instalar y configurar PostgreSQL**
2. **Crear la base de datos:**
   ```sql
   CREATE DATABASE cartrack;
   ```
3. **Anotar las credenciales de conexión** (usuario, contraseña, host, puerto)

### ⚙️ **Paso 3: Configurar el Backend**
```bash
# Navegar al directorio del backend
cd backend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
```

**Editar el archivo `.env`** con tus datos reales:
```bash
# Base de datos
DATABASE_URL="postgresql://cartrack_db_user:GVRkbvIh5O8zD5lsMnojo8P4EycHH63h@dpg-d30p45jipnbc73divji0-a.oregon-postgres.render.com/cartrack_db"

# JWT Configuration
JWT_SECRET="secret_key"
JWT_EXPIRES_IN="7d"

# Servidor
PORT=3000
NODE_ENV="development"

# Frontend URL para CORS
FRONTEND_URL="http://localhost:4200"
```

**Ejecutar migraciones de Prisma:**
```bash
# Generar el cliente de Prisma
npx prisma generate

# Ejecutar migraciones
npx prisma migrate dev

# (Opcional) Ver la base de datos en Prisma Studio
npx prisma studio
```

**Iniciar el servidor backend:**
```bash
npm run dev
```
El backend estará disponible en `http://localhost:3000`

### 🎨 **Paso 4: Configurar el Frontend**
**Abrir una nueva terminal** y navegar al frontend:
```bash
cd frontend

# Instalar Angular CLI globalmente (si no está instalado)
npm install -g @angular/cli

# Instalar dependencias
npm install

# Iniciar el servidor de desarrollo
ng serve -o
```
El frontend se abrirá automáticamente en `http://localhost:4200`

### ✅ **Paso 5: Verificar la Instalación**
1. **Backend**: Visita `http://localhost:3000` - deberías ver la API funcionando
2. **Frontend**: Visita `http://localhost:4200` - deberías ver la aplicación Angular
3. **Base de datos**: Verifica que las tablas se crearon correctamente con `npx prisma studio`

## 👨‍💻 Autor

**Salvador Bravo** - [GitHub](https://github.com/salvadorbravo09)

**Sebastian Mena**

**Diego de la Sotta**
