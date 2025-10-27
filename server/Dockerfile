FROM node:20-alpine AS base

WORKDIR /app

COPY package.json ./

RUN npm install --omit=dev

RUN npm install sqlite

COPY src ./src

EXPOSE 4000

ENV PORT=4000

CMD ["npm", "run", "start"]

