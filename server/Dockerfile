FROM node:20-alpine AS base

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci --omit=dev

COPY src ./src
COPY .env.example* ./

EXPOSE 4000

ENV PORT=4000

CMD ["npm", "run", "start"]

