FROM node

COPY . /tool
WORKDIR /tool

RUN npm install \
    && npm run build

ENTRYPOINT ["npm", "start", "--"]
CMD []
