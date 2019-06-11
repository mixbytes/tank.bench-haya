FROM ubuntu:16.04

COPY . /workdir
WORKDIR /workdir

RUN apt-get update && \
    apt-get install curl -y && \
    curl -sL https://raw.githubusercontent.com/creationix/nvm/v0.34.0/install.sh -o install_nvm.sh && \
    bash install_nvm.sh && \
    export NVM_DIR="$HOME/.nvm" && \
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" && \
    nvm install --latest-npm 12.4.0 && \
    nvm use --delete-prefix 12.4.0 && \
    npm install && \
    npm run build

ENV PATH=$PATH:/root/.nvm/versions/node/v12.4.0/bin/

ENTRYPOINT ["npm", "start", "--"]
CMD []
