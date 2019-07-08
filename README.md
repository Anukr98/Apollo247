# apollo-hospitals (@aph)

*Note to windows users: Run the following steps on a Windows 10 Pro machine in an Ubuntu 18 WSL*

## Getting started
1. Install docker and docker-compose
2. Install [lazydocker](https://github.com/jesseduffield/lazydocker)
3. Install [nvm](https://nvm.sh), run `nvm use` (now you may have to run an `nvm install` command, read the output)
4. Add the `firebase-secrets.json` to the `packages/api/src/profiles-service` folder (ask someone on the dev team for a copy)

## Web
4. Run `npm install --cache .npm-cache --unsafe-perm` 
5. Run `npm run bootstrap:web`
6. Start the api-gateway and patients-web containers (-d for daemon mode) `docker-compose up -d api-gateway patients-web`

## Mobile
4. Run `npm install --cache .npm-cache` 
5. Run `npm run bootstrap:mobile`
6. Start the api-gateway `docker-compose up api-gateway`

7. Run `lazydocker` to manage containers
8. patients-web app will be running on http://localhost:3000, graphql playground on http://localhost:4000


## Database viewer
Each microservice's postgres databases is viewable through the web ui, `pgweb`. Run `docker-compose up pgweb`, navigate to http://localhost:8081, and type in the connection details for the database you want to view. The hostname is the name of the service as specified in `docker-compose.yml` (convention: `<service-name>-db`, eg `profiles-db`). Leave the database entry blank to view all databases for the chosen service, and once logged in, switch between them in the upper left corner (initially the internal `postgres` database will be selected, which is not very useful)

## Web Testing
We use [Cypress](cypress.io) for web testing. Please download their gui binary to your host machine and point it at the `web` folder to the to run the tests.

## Mobile Testing
Using jest. Execute `npm run test`
