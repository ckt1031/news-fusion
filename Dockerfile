FROM node:18-alpine

WORKDIR /app

ENV PORT=8080

COPY package*.json ./

RUN npm ci

COPY . .

EXPOSE 8080

CMD ["npm", "run", "start"]
