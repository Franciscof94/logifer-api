FROM node:20.5.0

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

# Crear y generar migraciones


EXPOSE 3000

CMD ["npm", "run", "start:debug"]