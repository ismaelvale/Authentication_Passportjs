FROM node:16

ENV NODE_ENV=production

WORKDIR /app

COPY ["package.json", "package-lock.json*", "./"]

RUN npm install --production

COPY . .

ENV PORT 8000

EXPOSE 8000

CMD [ "node", "index.js" ]
