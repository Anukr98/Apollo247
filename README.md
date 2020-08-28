# apollo-hospitals (@aph)

## Windows users only

- Install [Ubuntu 18 WSL](https://www.microsoft.com/en-us/p/ubuntu-1804-lts/9n9tngvndl3q)
- Enable [developer mode](https://docs.microsoft.com/en-us/windows/uwp/get-started/enable-your-device-for-development)
- Disable [fast startup mode](https://www.windowscentral.com/how-disable-windows-10-fast-startup)

## Getting started

_Note to windows users: Run the following steps on a Windows 10 Pro machine in an Ubuntu 18 WSL_

- Install docker and docker-compose
- Install [nvm](https://nvm.sh), run `nvm use` (now you may have to run an `nvm install` command, read the output)
- Add the `firebase-secrets.json` to the `packages/api` folder (ask someone on the dev team for a copy)
- Copy and rename `local.env` to `.env` in the root (this file is gitignored, so you may change any variables/ports/etc as needed)
- Run `npm install`
- Optional: Install [lazydocker](https://github.com/jesseduffield/lazydocker/) to manage your docker containers

## Web
- Run `npm run delete:package-lock`
- Run `npm run bootstrap:web`
- Start the api-gateway `docker-compose up api-gateway`, graphql playground will be on http://localhost:4000
- Navigate to either `web-patients` or `web-doctors` and run `npm run start`, patients app will be running on http://localhost:3000, web-doctors on http://localhost:3001

## Mobile

- Run `npm run bootstrap:mobile`
- Start the api-gateway `docker-compose up api-gateway`, graphql playground will be on http://localhost:4000
- Navigate to either `mobile-patients` or `mobile-odctors` and run `npm run start`

## Testing

### Web

We use [Cypress](cypress.io) for web testing. Just run `npm run test` (on your host!) to get started.

### Mobile

Using jest. Run `npm run test`

### API

Using jest. Run `npm run test`

## Database viewer

Each microservice's postgres databases is viewable through the web ui, `pgweb`. Run `docker-compose up pgweb`, navigate to http://localhost:8081, and type in the connection details for the database you want to view. The hostname is the name of the service as specified in `docker-compose.yml` (convention: `<service-name>-db`, eg `profiles-db`). Leave the database entry blank to view all databases for the chosen service, and once logged in, switch between them in the upper left corner (initially the internal `postgres` database will be selected, which is not very useful)

## Storage emulator

In local and development we use the [Azurite Storage Emulator](https://github.com/Azure/Azurite). To browse files uploaded locally, you should use the [Azure Storage Explorer](https://azure.microsoft.com/en-in/features/storage-explorer). Connection strings/keys can be found in the .env file.

## Troubleshooting

### General reset

- `docker-compose stop`
- `git pull`
- `git status` - make sure you have no changes and are on the latest development branch!
- `npm run clean`
- `rm -rf node_modules`
- Now, start from the top of the readme ;)

### Common issues

#### Services crashing randomly

Check docker disk space, if there is "0B used" (or anything less than "5GB"), increase it (recommended: 80GB).

#### Module '@aph/... cannot be found'

Do `npm run bootstrap:web|mobile` to rebuild the shared modules

#### Timeuots/Unable to download new docker images

Go into your docker network settings and select Automatic DNS

#### Any kind of 'file not found' error OR Nginx error when starting a container

This usually indicates that volumes are not mounting properly due to permissions issues.
Go into your docker settings, click on hard drives, and reset the credentials.
Then close and reopen your Ubuntu WSL
