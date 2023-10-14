FROM node:18-alpine

WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH

COPY package.json yarn.lock /app/
RUN yarn install --production --frozen-lockfile

COPY src/ /app/

CMD ["tsx", "/app/index.ts"]
