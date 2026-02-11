FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Expose nextjs dev server port
EXPOSE 3000

# Run dev server
CMD ["npm", "run", "dev", "--", "--hostname", "0.0.0.0"]