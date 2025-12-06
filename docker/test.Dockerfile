FROM node:20-slim
WORKDIR /app
COPY package*.json ./
RUN npm ci --ignore-scripts
COPY . .
ENV NODE_ENV=test
CMD ["npm", "test"]
