FROM node

EXPOSE 3000/tcp

RUN apt-get update && \
apt-get upgrade -y && \
rm -rf -- /var/lib/apt && \
npm install -g bun

USER node

WORKDIR /home/node

RUN git clone https://github.com/abhishzk/lookinit app && \
cd app && \
bun install

WORKDIR /home/node/app

ENTRYPOINT ["/usr/local/bin/bun", "run", "dev"]
