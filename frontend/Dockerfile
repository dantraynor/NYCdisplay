FROM node:18-slim

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies and Next.js globally
RUN npm install && \
    npm install -g next

# Copy the rest of the application
COPY . .

# Expose the port
EXPOSE 3000

# Start the application in development mode
CMD ["npm", "run", "dev"] 