# Apollo

## Getting started
*Note to windows users: Run the following steps on a Windows 10 Pro machine underneath an Ubuntu 18 WSL*
1. Install docker
2. Setup the api container `docker-compose run --rm api install --production=false`
3. Init the microservices `docker-compose run --rm api npm run init:doctors`
4. Run `docker-compose up api` to start the api gateway and microservices
5. From a separate terminal tab, run `docker-compose up web` to start the frontend
6. Navigate to http://localhost:3000 to see the webapp
