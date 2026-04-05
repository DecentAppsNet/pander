FROM node:22-slim
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --production
COPY . .
EXPOSE 8080
ENV PORT=8080
CMD ["node", "index.js"]
