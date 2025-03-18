# Stage 1: Build the Vite React app
FROM node:14-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve the built app using NGINX
FROM nginx:alpine
RUN rm -rf /usr/share/nginx/html/*
# Copy the production output (dist folder) from the build stage
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
