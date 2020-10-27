#!/usr/bin/env bash
# $1 refers the environment: 'local' | 'development' | 'staging' | 'production' | 'aks'

echo -e "\ncleaning up any old build files..."
#rm -fv aph-webd-$1*.tar.gz
rm -rfv webd || exit 2
rm -rfv packages/web-doctors/dist/* || exit 2
#rm -rfv packages/universal/dist/* || exit 2

#npm install
#echo -e "\nrunning bootstrap:web..."
#npm run bootstrap:web || exit 2

echo -e "\nbuilding web-doctors..."
cd packages/web-doctors
npm install
#node_modules/.bin/apollo schema:download --endpoint=https://aksapi.apollo247.com/graphql schema.json && mv schema.json ../api-schema
npm run build || exit 2
cd -

echo -e "\ncopying web-doctors files..."
mkdir -pv webd/apollo-hospitals/packages/web-doctors/ || exit 2
cp -Rv packages/web-doctors/dist/* webd/apollo-hospitals/packages/web-doctors/ || exit 2

echo -e "\ncopying universal files..."
mkdir -pv webd/apollo-hospitals/packages/universal/ || exit 2
cp -Rv packages/universal/dist/* webd/apollo-hospitals/packages/universal/ || exit 2

echo -e "\ncopying env file..."
cp -v .env webd/apollo-hospitals || exit 2

echo -e "\nbuilding aph-webd-$1*.tar.gz artifact..."
tar -czf aph-webd-$1.tar.gz -C webd apollo-hospitals || exit 2

echo -e "\ncleaning up..."
rm -rf webd || exit 2

echo -e "\nsuccess! build artifacts"
