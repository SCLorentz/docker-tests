FROM ubuntu:latest

# Atualizar o sistema e instalar pacotes necessários
RUN apt-get update && apt-get install -y \
    xrdp \
    tightvncserver \
    xfce4 \
    xfce4-goodies

# Criar usuário dedicado
RUN useradd -m vncuser && echo "vncuser:minhaSenhaForte" | chpasswd

# Configurar VNC para vncuser
RUN su vncuser -c "mkdir -p ~/.vnc && echo 'vncuser:1234' > ~/.vnc/passwd && vncserver -config ~/.vnc/xstartup"
# Configurar o autologin
RUN sed -i 's/autologin=0/autologin=1/g' /etc/default/xrdp

# Configurar o VNC
RUN mkdir -p ~/.vnc && \
    echo "vncuser:1234" > ~/.vnc/passwd && \
    vncserver -config /root/.vnc/xstartup

# Expor a porta VNC
EXPOSE 5901

# Executar o servidor Xrdp
CMD ["xrdp"]