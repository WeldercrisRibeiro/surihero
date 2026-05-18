# Estágio de construção
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Estágio de produção
FROM nginx:alpine

# Copia os arquivos do build para o diretório do Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Copia uma configuração customizada do Nginx se necessário (para lidar com rotas do React)
RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
