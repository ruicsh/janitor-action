FROM node:20-alpine

WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH

COPY package.json package-lock.json /app/
RUN npm install --omit=dev --no-audit

COPY src/ /app/

CMD ["tsx", "/app/index.ts"]
