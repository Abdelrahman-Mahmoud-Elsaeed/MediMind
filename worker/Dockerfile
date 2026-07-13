FROM node:20-alpine

WORKDIR /app

# Copy both worker and backend (worker needs backend models)
COPY worker/package*.json ./worker/
COPY backend/package*.json ./backend/

# Install worker dependencies
RUN cd worker && npm install --omit=dev

# Install backend dependencies (needed because worker requires backend models)
RUN cd backend && npm install --omit=dev

# Copy source code
COPY worker ./worker
COPY backend ./backend

WORKDIR /app/worker

EXPOSE 3001

CMD ["node", "index.js"]
