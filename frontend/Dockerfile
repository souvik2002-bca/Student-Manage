FROM node:22-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm install --silent

COPY . .

# 🔥 memory limit (important)
ENV NODE_OPTIONS="--max-old-space-size=256"

RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf   ✅
