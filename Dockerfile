FROM node:20-alpine
LABEL author="Izzatbek"
WORKDIR /app
COPY package*.json .
RUN npm install
COPY . .
CMD [ "node", "index.js", ]