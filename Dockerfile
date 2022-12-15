FROM node:19-alpine as builder
WORKDIR /app
COPY ./package.json ./package.json
RUN npm install
COPY . .
RUN npm run build

FROM nginx:1.23.2-alpine as runner
COPY ./nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/build /usr/share/nginx/html
EXPOSE 8080
