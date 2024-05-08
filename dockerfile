FROM node:22

WORKDIR /usr/src/app

COPY . .

RUN yarn install

EXPOSE 3000

CMD bash -c "npx prisma db push && yarn start:dev"