FROM debian:buster

# Instala o XFCE e outras ferramentas
RUN apt-get update && \
    apt-get install -y xfce4 xfce4-goodies xrdp

# Configura o autologin
RUN useradd -m meuusuario && \
    echo "meuusuario:minhaSenha" | chpasswd && \
    sed -i 's/autologin=0/autologin=1/g' /etc/default/xrdp

# Executa o servidor Xrdp
CMD ["xrdp"]
