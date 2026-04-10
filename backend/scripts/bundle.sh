#!/bin/bash
set -e

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BUNDLE_DIR="$ROOT/.lambda-bundle"

echo "🗑  Limpiando bundle anterior..."
rm -rf "$BUNDLE_DIR"
mkdir -p "$BUNDLE_DIR"

echo "📦 Compilando TypeScript..."
cd "$ROOT"
npm run build

echo "🔗 Bundleando con esbuild (excluyendo @prisma/client)..."
node_modules/.bin/esbuild dist/src/lambda.js \
  --bundle \
  --platform=node \
  --target=node20 \
  --outfile="$BUNDLE_DIR/index.js" \
  --external:@prisma/client \
  --external:.prisma \
  --external:@nestjs/microservices \
  --external:@nestjs/websockets \
  --external:class-transformer/storage \
  --external:cache-manager \
  --external:fastify \
  --external:kafkajs \
  --external:mqtt \
  --external:nats \
  --external:amqplib \
  --external:amqp-connection-manager \
  --external:ioredis \
  --minify=false

echo "📁 Copiando Prisma client y engine..."
mkdir -p "$BUNDLE_DIR/node_modules/.prisma/client"
mkdir -p "$BUNDLE_DIR/node_modules/@prisma"

# Copiar TODO el contenido de .prisma/client (JS files, wasm, schema, etc.)
cp node_modules/.prisma/client/*.js "$BUNDLE_DIR/node_modules/.prisma/client/" 2>/dev/null || true
cp node_modules/.prisma/client/*.d.ts "$BUNDLE_DIR/node_modules/.prisma/client/" 2>/dev/null || true
cp node_modules/.prisma/client/*.json "$BUNDLE_DIR/node_modules/.prisma/client/" 2>/dev/null || true
cp node_modules/.prisma/client/*.wasm "$BUNDLE_DIR/node_modules/.prisma/client/" 2>/dev/null || true
cp node_modules/.prisma/client/*.mjs "$BUNDLE_DIR/node_modules/.prisma/client/" 2>/dev/null || true
cp node_modules/.prisma/client/schema.prisma "$BUNDLE_DIR/node_modules/.prisma/client/"
# Solo el engine de Linux (rhel = Amazon Linux 2)
find node_modules/.prisma/client -name "*rhel*" -exec cp {} "$BUNDLE_DIR/node_modules/.prisma/client/" \;

# Copiar @prisma/client completo
cp -r node_modules/@prisma/client "$BUNDLE_DIR/node_modules/@prisma/client"
# Copiar dependencias de prisma necesarias en runtime
for pkg in "@prisma/client-runtime-utils" "@prisma/debug" "@prisma/get-platform" "@prisma/prisma-schema-wasm"; do
  if [ -d "node_modules/$pkg" ]; then
    mkdir -p "$BUNDLE_DIR/node_modules/$pkg"
    cp -r "node_modules/$pkg/." "$BUNDLE_DIR/node_modules/$pkg/"
  fi
done

echo "🗜  Creando ZIP..."
cd "$BUNDLE_DIR" && zip -r "$ROOT/.lambda-bundle.zip" . > /dev/null
echo "📏 Tamaño del ZIP:"
du -sh "$ROOT/.lambda-bundle.zip"

echo "✅ Bundle listo en $BUNDLE_DIR"
