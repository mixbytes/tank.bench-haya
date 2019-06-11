FROM node:12-alpine

COPY . /workdir
WORKDIR /workdir

RUN echo 'http://dl-cdn.alpinelinux.org/alpine/v3.8/main' >> /etc/apk/repositories && \
    apk add --update libssl1.0 gmp-dev gcompat && \
    npm install && \
    npm run build

ENTRYPOINT ["npm", "start", "--"]
CMD []
