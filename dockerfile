FROM oven/bun

WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH

COPY package.json bun.lockb /app/
RUN bun install --production --frozen-lockfile

COPY src/ /app/

CMD ["bun", "/app/index.ts"]
