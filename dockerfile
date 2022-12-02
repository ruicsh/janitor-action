FROM node:19-alpine

WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH

COPY package.json .yarnrc /app/
RUN yarn install --production && yarn cache clean

COPY src/ /app/

CMD ["tsx", "/app/index.ts"]
