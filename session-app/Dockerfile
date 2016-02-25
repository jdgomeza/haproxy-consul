FROM dahlb/alpine-node

# Install nodemon
RUN npm install -g nodemon

WORKDIR /src

COPY package.json /src/package.json
# Define working directory
RUN npm install
COPY index.js /src
COPY docker-entrypoint.sh /src


# Expose port
EXPOSE 3000

# Run app using nodemon
ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["nodemon", "."]
