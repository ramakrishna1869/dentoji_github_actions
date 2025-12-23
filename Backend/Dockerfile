FROM node:18-alpine

WORKDIR /app

# Copy package.json first for caching
COPY package*.json ./
RUN npm install

# Copy the rest of the backend code
COPY . .

# --- REPLACE: Ensure this matches your index.js port (You said 5001) ---
EXPOSE 5001

CMD ["npm", "start"]
