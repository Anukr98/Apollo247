#!/usr/bin/env bash
# $1 refers the environment: 'local' | 'dev' | 'qa' | 'production'

echo -e "\nusing $1 env..."
cp -fv "$1.env" .env
echo -e ""
cat .env

echo -e "\nusing docker-compose-$1.yml..."

echo -e "\ncleaning up any old build files..."
rm -fv aph-$1.tar.gz
rm -rfv skeleton
rm -rfv packages/api/dist/*
rm -rfv packages/web-doctors/dist/*
rm -rfv packages/web-patients/dist/*

echo -e "\nbuilding api-gateway..."
docker-compose -f docker-compose-$1.yml run --no-deps --rm api-gateway npm run start:api-gateway 

echo -e "\nbuilding profiles-service..."
docker-compose -f docker-compose-$1.yml run --no-deps --rm profiles-service npm run start:profiles-service 

echo -e "\nbuilding doctors-service..."
docker-compose -f docker-compose-$1.yml run --no-deps --rm doctors-service npm run start:doctors-service 

echo -e "\nbuilding web-patients..."
cd packages/web-patients && npm run build && cd -

echo -e "\nbuilding web-doctors..."
cd packages/web-doctors && npm run build && cd -

echo -e "\npreparing to build aph-$1.tar.gz artifact..."
mkdir -pv skeleton

echo -e "\ncopying nginx files..."
mkdir -pv skeleton/apollo-hospitals/nginx
cp -rv nginx/conf.d skeleton/apollo-hospitals/nginx

echo -e "\ncopying all api files..."
mkdir -pv skeleton/apollo-hospitals/packages/api/
cp -rv packages/api/dist/* skeleton/apollo-hospitals/packages/api/
cp -rv packages/api/src/**/*.sql skeleton/apollo-hospitals/packages/api/
echo "packages/api/node_modules -> skeleton/apollo-hospitals/packages/api/node_modules"
cp -r packages/api/node_modules skeleton/apollo-hospitals/packages/api/
cp packages/api/firebase-secrets.json skeleton/apollo-hospitals/packages/api/

echo -e "\ncopying web-patients files..."
mkdir -pv skeleton/apollo-hospitals/packages/web-patients/
cp -rv packages/web-patients/dist/* skeleton/apollo-hospitals/packages/web-patients/

echo -e "\ncopying web-doctors files..."
mkdir -pv skeleton/apollo-hospitals/packages/web-doctors/
cp -rv packages/web-doctors/dist/* skeleton/apollo-hospitals/packages/web-doctors/

echo -e "\ncopying env and docker-compose files..."
cp -v .env skeleton/apollo-hospitals
cp -v docker-compose-$1.yml skeleton/apollo-hospitals/docker-compose.yml

echo -e "\ncopying build-scripts..."
cp -rv build-scripts skeleton/apollo-hospitals/

echo -e "\nbuilding aph-$1.tar.gz artifact..."
tar -czf aph-$1.tar.gz -C skeleton apollo-hospitals

echo -e "\ncleaning up..."
rm -rf skeleton

echo -e "\nsuccess! build artifact: aph-$1-tar.gz"
