# Use uma imagem base Debian bullseye-slim
FROM debian:bullseye-slim

# Instale o Nginx e crie o usuário nginx
RUN apt-get update && \
    apt-get install -y nginx && \
    apt-get clean && \
    useradd -r -s /sbin/nologin nginx

# Crie um diretório para os arquivos estáticos
RUN mkdir -p /var/www/html

# Copie os arquivos do frontend para o diretório public
COPY public /var/www/html

RUN chown -R www-data:www-data /var/www/html && \
    find /var/www/html -type d -exec chmod 755 {} \; && \
    find /var/www/html -type f -exec chmod 644 {} \;

# Adicione o usuário nginx ao grupo www-data
RUN usermod -a -G www-data nginx

# Copie a configuração do Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Configure o Nginx para usar o diretório public
RUN echo "server { \
    listen 8080; \
    root /var/www/html; \
    index index.html; \
    server_name localhost; \
    location / { \
        try_files \$uri \$uri/ =404; \
    } \
}" > /etc/nginx/sites-available/default

# Exponha a porta 80
EXPOSE 80

# Inicie o Nginx quando o container for executado
CMD ["nginx", "-g", "daemon off;"]