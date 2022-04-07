FROM node:erbium-alpine3.12 as prep

ENV PYTHONUNBUFFERED=1
RUN apk add --update --no-cache python3 && ln -sf python3 /usr/bin/python
RUN python3 -m ensurepip
RUN pip3 install --no-cache --upgrade pip setuptools

RUN apk add --update --no-cache make g++

WORKDIR /app
COPY package.json package-lock.json ./

RUN npm install

COPY .babelrc .eslintrc ./
COPY lib lib
RUN npm run build

FROM node:erbium-alpine3.12 as app

ENV CONFIG_FILE "conf/config.json"

RUN mkdir /data
RUN mkdir /app
WORKDIR /app

COPY --from=prep /app .
COPY . .

VOLUME [ "/data" ]

CMD ["node", "dist/index.js"]