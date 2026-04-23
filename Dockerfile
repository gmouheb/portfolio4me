FROM node:22-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM deps AS source
WORKDIR /app
COPY . .

FROM source AS frontend-dev
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]

FROM source AS backend-dev
EXPOSE 5000
CMD ["npm", "run", "server"]

FROM source AS frontend-build
ARG VITE_API_BASE_URL=/api
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
RUN npm run build

FROM nginx:1.27-alpine AS frontend-prod
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=frontend-build /app/dist /usr/share/nginx/html
EXPOSE 80

FROM source AS backend-prod
ENV NODE_ENV=production
RUN mkdir -p /app/uploads
EXPOSE 5000
CMD ["npm", "run", "server"]
