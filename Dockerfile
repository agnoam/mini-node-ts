FROM node:slim

WORKDIR /usr/src/mini-node

# Copy the project into /usr/src/mini-node folder
COPY . .
RUN rm -rf ./node_modules
# RUN rm -rf yarn.lock

# Building dist folder
RUN yarn
RUN yarn build

# Remove all build data
RUN rm -rf ./src ./node_modules
RUN rm -rf docker-compose.yml Dockerfile
RUN rm -rf jest.config.js webpack.config.json nodemon.json
RUN rm -rf .eslintrc.json tsconfig.json
RUN rm -rf README.md CHANGELOG.md app.json .gitignore
RUN rm -rf ./test

RUN yarn --production

WORKDIR /usr/src/mini-node/dist

# Remove all not bundled files
RUN rm -rf ./config ./components ./middlewares ./config ./utils
RUN rm -rf ./server.js ./server.js.map

# Clear cache of yarn
RUN yarn cache clean

EXPOSE 8810
CMD ["yarn", "start"]