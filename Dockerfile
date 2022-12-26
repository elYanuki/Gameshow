FROM node:18-alpine
WORKDIR /gameshow
COPY . .
RUN yarn install --production
CMD ["node", "server.js"]