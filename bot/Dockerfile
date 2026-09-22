# Bot lấy giá cho tab Valuation. Không cài package nào — Node 18+ đã có fetch sẵn.
FROM node:22-alpine

WORKDIR /app
COPY sync-prices.js ./

# Chạy bằng user không phải root
USER node

CMD ["node", "sync-prices.js"]
