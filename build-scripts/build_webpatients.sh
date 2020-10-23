#!/usr/bin/env bash
# $1 refers the environment: 'local' | 'development' | 'staging' | 'production' | 'aks'

echo -e "\ncleaning up any old build files..."
#rm -fv aph-webp-$1*.tar.gz
rm -rfv webp || exit 2
rm -rfv packages/web-patients/dist/* || exit 2
#rm -rfv packages/universal/dist/* || exit 2

#npm install
#echo -e "\nrunning bootstrap:web..."
#npm run bootstrap:web || exit 2

echo -e "\nbuilding web-patients..."
cd packages/web-patients
npm install
#node_modules/.bin/apollo schema:download --endpoint=https://aksapi.apollo247.com/graphql schema.json && mv schema.json ../api-schema
npm run build || exit 2
cd -

echo -e "\ncopying web-patients files..."
mkdir -pv webp/apollo-hospitals/packages/web-patients/ || exit 2
cp -Rv packages/web-patients/dist/* webp/apollo-hospitals/packages/web-patients/ || exit 2

echo -e "\ncopying universal files..."
mkdir -pv webp/apollo-hospitals/packages/universal/ || exit 2
cp -Rv packages/universal/dist/* webp/apollo-hospitals/packages/universal/ || exit 2

echo -e "\ncopying env file..."
cp -v .env webp/apollo-hospitals || exit 2

echo -e "\nbuilding aph-webp-$1*.tar.gz artifact..."
tar -czf aph-webp-$1.tar.gz -C webp apollo-hospitals || exit 2

echo -e "\ncleaning up..."
rm -rf webp || exit 2

echo -e "\nsuccess! build artifacts"
