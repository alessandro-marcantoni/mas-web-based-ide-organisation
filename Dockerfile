FROM node:19-alpine as builder
WORKDIR /app
COPY ./package.json ./package.json
RUN npm install
COPY . .
ENV GENERATE_SOURCEMAP=false
ENV PORT=80
ENV PUBLIC_URL=/
RUN npm run build

FROM nginx:1.27.2-alpine as runner
COPY ./nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/build /usr/share/nginx/html
EXPOSE 80
