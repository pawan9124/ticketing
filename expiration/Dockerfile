#Fetch the node js alpine version from the Docker hub
FROM node:alpine
# creating the work dir to not conflict with the image directory like var/system/etc
WORKDIR ./app
#copy the package.json before run install will only run npm install when any changes in the pacakge.json
COPY ./package.json ./
# run npn install command then
RUN npm install --only=prod
# then copy all the working director remaning rest of the file
COPY ./ ./
# command to pass to the image to run the file
CMD ["npm","start"]