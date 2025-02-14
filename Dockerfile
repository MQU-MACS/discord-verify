FROM node:18-alpine3.20

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile

COPY . ./

RUN yarn build

EXPOSE 3000

CMD [ "yarn", "start:docker" ]
