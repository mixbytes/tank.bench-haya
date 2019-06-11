FROM node

COPY . /workdir
WORKDIR /workdir

RUN npm install && \
    npm run build

ENTRYPOINT ["npm", "start", "--"]
CMD []
