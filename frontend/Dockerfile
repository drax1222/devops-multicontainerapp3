FROM node:alpine as builder
WORKDIR /opt/app	
COPY ./package.json .
RUN yarn install
RUN npm install react-scripts@3.4.1 -g --silent
COPY . .
RUN yarn build

FROM nginx
COPY --from=builder /opt/app/build /usr/share/nginx/html
