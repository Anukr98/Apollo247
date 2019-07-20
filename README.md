# apollo-hospitals (@aph)

## Windows users only

- Install [Ubuntu 18 WSL](https://www.microsoft.com/en-us/p/ubuntu-1804-lts/9n9tngvndl3q)
- Enable [developer mode](https://docs.microsoft.com/en-us/windows/uwp/get-started/enable-your-device-for-development)
- Disable [fast startup mode](https://www.windowscentral.com/how-disable-windows-10-fast-startup)

## Getting started

_Note to windows users: Run the following steps on a Windows 10 Pro machine in an Ubuntu 18 WSL_

- Install docker and docker-compose
- Install [nvm](https://nvm.sh), run `nvm use` (now you may have to run an `nvm install` command, read the output)
- Add the `firebase-secrets.json` to the `packages/api/src/profiles-service` and `packages/api/src/` folders (ask someone on the dev team for a copy)
- Copy and rename `local.env` to `.env` in the root
- Run `npm install`

## Web

- Run `npm run bootstrap:web`
- Start the api-gateway `docker-compose up api-gateway`, graphql playground will be on http://localhost:4000
- Navigate to either `web-patients` or `web-doctors` and run `npm run start`, patients app will be running on http://localhost:3000, web-doctors on http://localhost:3001

## Mobile

- Run `npm run bootstrap:mobile`
- Start the api-gateway `docker-compose up api-gateway`, graphql playground will be on http://localhost:4000
- Navigate to either `mobile-patients` or `mobile-odctors` and run `npm run start`

## Web Testing

We use [Cypress](cypress.io) for web testing. Just run `npm run test` (on your host!!) to get started.

## Mobile Testing

Using jest. Run `npm run test`

## Database viewer

Each microservice's postgres databases is viewable through the web ui, `pgweb`. Run `docker-compose up pgweb`, navigate to http://localhost:8081, and type in the connection details for the database you want to view. The hostname is the name of the service as specified in `docker-compose.yml` (convention: `<service-name>-db`, eg `profiles-db`). Leave the database entry blank to view all databases for the chosen service, and once logged in, switch between them in the upper left corner (initially the internal `postgres` database will be selected, which is not very useful)

## Troubleshooting

### General reset

- `docker-compose stop`
- `git pull`
- `git status` - make sure you have no changes and are on the latest development branch!
- `npm run clean`
- `rm -rf node_modules`
- Now, start from the top of the readme ;)

### Common issues

#### Timeuots/Unable to download new docker images

Go into your docker network settings and select Automatic DNS

#### Any kind of 'file not found' error OR Nginx error when starting a container

This usually indicates that volumes are not mounting properly due to permissions issues.
Go into your docker settings, click on hard drives, and reset the credentials.
Then close and reopen your Ubuntu WSL
