FROM node:20-alpine

# Thư mục làm việc trong container
WORKDIR /usr/src/app

# Copy package.json & package-lock.json để cài dependencies
COPY package*.json ./

# Cài dependencies production
RUN npm install --production

# Copy toàn bộ source code vào container
COPY . .

# EXPOSE port (Render sẽ override bằng PORT env)
EXPOSE 3000

# Chạy file entry point index.js
CMD ["node", "index.js"]
