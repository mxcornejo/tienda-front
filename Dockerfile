# ================================================================
# Stage 1: Build con Node.js
# ================================================================
FROM node:22-alpine AS build
WORKDIR /app

# Copiar manifiestos de dependencias primero para aprovechar caché de capas
COPY package*.json ./
RUN npm ci

# Copiar el resto del proyecto y compilar en modo producción
COPY . .
RUN npm run build --configuration=production

# ================================================================
# Stage 2: Servir con Nginx
# ================================================================
FROM nginx:alpine

# Copiar el output del build (Angular 20: dist/<proyecto>/browser)
COPY --from=build /app/dist/tienda-front/browser /usr/share/nginx/html

# Copiar configuración de nginx para SPA (soporte de rutas Angular)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
