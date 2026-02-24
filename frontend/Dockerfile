FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .
RUN npm run build
# Expose nextjs dev server port
EXPOSE 3000

# Run dev server
CMD ["npm", "start"]