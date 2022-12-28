FROM node:18-alpine
COPY . .
RUN npm install --production
CMD ["node", "server.js"]