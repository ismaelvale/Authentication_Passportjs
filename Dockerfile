FROM node:16

ENV NODE_ENV=production

WORKDIR /app

COPY ["package.json", "package-lock.json*", "./"]

RUN npm install --production

COPY . .

ENV PORT 3000

ENV mongoDB mongodb+srv://ismaelvale:Authy1@cluster0.jopgwjc.mongodb.net/?retryWrites=true&w=majority

EXPOSE mongodb+srv://ismaelvale:Authy1@cluster0.jopgwjc.mongodb.net/?retryWrites=true&w=majority

EXPOSE 3000

CMD [ "node", "app.js" ]
