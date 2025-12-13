FROM node:20-alpine

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto de los archivos
COPY . .

# Exponer el puerto 3000
EXPOSE 3000

# Variables de entorno para desarrollo
ENV NODE_ENV=development
ENV WATCHPACK_POLLING=true

# Comando para desarrollo con hot reload
CMD ["npm", "run", "dev"]

