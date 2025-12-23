# Stage 1: Build the React Application
FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# --- NOTE: This accepts the URL we set in GitHub Variables ---
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# Stage 2: Serve the React App with Nginx
FROM nginx:alpine

# Clean default Nginx files
RUN rm -rf /usr/share/nginx/html/*

# --- REPLACE: If you are NOT using Vite, change '/app/dist' to '/app/build' ---
# Since you are using Vite, keep it as '/app/dist'
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
ENTRYPOINT ["nginx", "-g", "daemon off;"]
