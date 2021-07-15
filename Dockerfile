FROM node:latest

WORKDIR /usr/src/mini-node

# Copy the project into /usr/src/file-validator folder
COPY . .
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

RUN yarn --production

# EXPOSE 3000
WORKDIR /usr/src/mini-node/dist
CMD ["yarn", "production"]