# apollo-hospitals (@aph)

*Note to windows users: Run the following steps on a Windows 10 Pro machine underneath an Ubuntu 18 WSL*

## Usage
1. Install docker and docker-compose
2. Add the `firebase-secrets.json` to `api/services/profiles` folder (ask someone on the dev team for a copy)
2. Start the profiles-service `docker-compose up profiles-service`
3. Start the api-gateway `docker-compose up api-gateway`
4. Start the web client `docker-compose up web` (this could take up to ~10 minutes)

## Database viewer
Each microservice's postgres databases is viewable through the web ui, `pgweb`. Run `docker-compose up pgweb`, navigate to http://localhost:8081, and type in the connection details for the database you want to view. The hostname is the name of the service as specified in `docker-compose.yml` (convention: `<service-name>-db`, eg `profiles-db`). Leave the database entry blank to view all databases for the chosen service, and once logged in, switch between them in the upper left corner (initially the internal `postgres` database will be selected, which is not very useful)

## Web Testing
We use [Cypress](cypress.io) for web testing. Please download their gui binary to your host machine and point it at the `web` folder to the to run the tests.

## Mobile Testing
Using jest. Execute `npm run test`
