FROM node:12

WORKDIR /usr/src/app

ENV PORT 3000
ENV HOST 0.0.0.0

COPY package.json ./
RUN npm install --production

COPY . .
EXPOSE 3000

CMD npm run start
