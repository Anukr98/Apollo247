# Apollo

*Note to windows users: Run the following steps on a Windows 10 Pro machine underneath an Ubuntu 18 WSL*

## First time setup
1. Install docker and docker-compose
2. Setup and init each microservice's database `docker-compose run --rm profiles-service npm install --production=false && npm run init:profiles-service`

## Usage
1. Start the api `docker-compose up api-gateway`
2. Start the frontend `docker-compose up web`

## Database viewer
Each microservice's postgres databases is viewable through the web ui, `pgweb`. Run `docker-compose up pgweb`, navigate to http://localhost:8081, and type in the connection details for the database you want to view. The hostname is the name of the service as specified in `docker-compose.yml` (convention: `service-db`, eg `profiles-db`). Leave the database entry blank to view all databases for the chosen service, and once logged in, switch between them in the upper left corner (initially the internal `postgres` database will be selected, which is not very useful)
