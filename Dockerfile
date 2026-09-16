FROM node:24-slim
WORKDIR /app

COPY backend/package*.json ./
RUN npm install --omit=dev

COPY backend/ .

ENV PORT=5000
ENV DB_PATH=/data/attendance.db
EXPOSE 5000

CMD ["node", "server.js"]
