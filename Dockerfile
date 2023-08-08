FROM node:16
ENV NODE_ENV=production
WORKDIR /app
COPY ["package.json", "package-lock.json*", "./"]
COPY . .
RUN npm install --production
CMD [ "node", "app.js" ]
ENV PORT 3000
EXPOSE 3000


