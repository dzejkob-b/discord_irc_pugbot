FROM node:18-alpine

# ENV CONFIG_FILE "conf/config.json"

WORKDIR /app
COPY . ./

RUN npm install

# RUN mkdir data

# VOLUME [ "/data" ]
# VOLUME [ "/db" ]
# VOLUME [ "/conf" ]
CMD ["npm", "run", "start"]