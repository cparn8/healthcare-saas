# Use official Node image
FROM node:20

WORKDIR /app

# Copy package.json first
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the code
COPY . .

# Start React
CMD ["npm", "start"]