FROM debian:bookworm-slim

COPY cmd/ /root/

ENV DENO_INSTALL="/root/.deno/bin/bin" \
    FLASK_APP=becca

RUN rm -rf ~/.bashrc \
    && mv ~/.bash ~/.bashrc

RUN apt-get update && apt-get install -y --no-install-recommends \
    curl xz-utils ca-certificates libssl-dev net-tools unzip git gcc \
    && rm -rf /var/lib/apt/lists/*

RUN curl -fsSL https://deno.land/install.sh | sh

ENV PATH="${DENO_INSTALL}/bin:${PATH}" 

EXPOSE 8000

ENTRYPOINT ["/bin/bash", "-l", "-c", "flask run --host 0.0.0.0 --port 8000"]