## Node ##
FROM node:16.5.0-alpine as Node

# Working directory
WORKDIR /usr/app

## Dependencies ##
RUN apk update \
    # Git
    && apk add git

# Copy dependencies
COPY ./package.json ./
COPY ./package-lock.json ./

# Install React App
RUN npm ci --silent

# Copy 
COPY . .

# Informs Docker that the container listens on the specified network ports at runtime
EXPOSE 9000
# Command container will actually run when called
CMD ["node", "server.js"]