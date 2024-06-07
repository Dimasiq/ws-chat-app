FROM node:20.14.0-alpine

WORKDIR /usr/src/app

COPY ./*.json /usr/src/app/

COPY .env ./usr/src/app/

RUN npm install

# RUN npm run build

EXPOSE 8000

CMD ["npm", "run", "start:dev"]
