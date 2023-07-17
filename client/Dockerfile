# BUILD PHASE : install dependencies and build the application
FROM node:16-alpine as builder
WORKDIR '/app'
COPY ./package.json ./
# RUN npm install
RUN npm install --save-dev @babel/plugin-proposal-private-property-in-object
COPY . .
RUN npm run build
# the output of this goes to the working directory

# RUN PHASE
FROM nginx
EXPOSE 3000
COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/build /usr/share/nginx/html