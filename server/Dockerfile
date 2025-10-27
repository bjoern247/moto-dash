FROM node:20-slim

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev

RUN npm install sqlite sqlite3

COPY . .

EXPOSE 4000
ENV PORT=4000

CMD ["npm", "start"]
RUN ls -l node_modules/sqlite && ls -l node_modules/sqlite3