FROM node:18-alpine

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy application source code
COPY . .

# Expose port (ensure it matches your .env or defaults)
EXPOSE 5000

# Start the application
CMD ["npm", "start"]
