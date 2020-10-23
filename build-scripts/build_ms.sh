#!/usr/bin/env bash
# $1 refers the environment: 'local' | 'development' | 'staging' | 'production' | 'aks'

echo -e "\ncleaning up any old build files..."
#rm -fv aph-ms-$1*.tar.gz
rm -rfv ms || exit 2
rm -rfv packages/api/dist/* || exit 2
rm -rfv packages/universal/dist/* || exit 2

npm install
echo -e "\nrunning bootstrap:web..."
npm run bootstrap:web || exit 2

echo -e "\nrunning migration..."
cd packages/api
npm run start:migration --if-present
cd -

echo "\n Building api-gateway..."
cd packages/api
npm run start:api-gateway || exit 2
cd -

echo -e "\nbuilding profiles-service..."
cd packages/api
npm run start:profiles-service || exit 2
cd -

echo -e "\nbuilding doctors-service..."
cd packages/api
npm run start:doctors-service || exit 2
cd -

echo -e "\nbuilding coupons-service..."
cd packages/api
npm run start:coupons-service || exit 2
cd -

echo -e "\nbuilding consults-service..."
cd packages/api
npm run start:consults-service || exit 2
cd -

echo -e "\nbuilding notifications-service..."
cd packages/api
npm run start:notifications-service || exit 2
cd -

echo -e "\nbuilding payment-service..."
cd paytm-integration
npm install || exit 2
cd -

echo -e "\ncopying all api files..."
mkdir -pv ms/apollo-hospitals/packages/api/dist || exit 2
mkdir -pv ms/apollo-hospitals/packages/api/src || exit 2
cp -Rv packages/api/dist/* ms/apollo-hospitals/packages/api/ || exit 2
cp -Rv packages/api/dist/migration ms/apollo-hospitals/packages/api/dist/ >/dev/null
cp -Rv packages/api/src/**/*.sql ms/apollo-hospitals/packages/api/ || exit 2
cp -Rv packages/api/src/assets ms/apollo-hospitals/packages/api/src || exit 2
echo "'packages/api/node_modules' -> 'ms/apollo-hospitals/packages/api/node_modules'"
cp -RL packages/api/node_modules ms/apollo-hospitals/packages/api/ || exit 2
cp packages/api/firebase-secrets.json ms/apollo-hospitals/packages/api/ || exit 2

echo -e "\ncopying universal files..."
mkdir -pv ms/apollo-hospitals/packages/universal/ || exit 2
cp -Rv packages/universal/dist/* ms/apollo-hospitals/packages/universal/ || exit 2

echo -e "\ncopying env file..."
cp -v .env ms/apollo-hospitals || exit 2

echo -e "\ncopying build-scripts..."
cp -Rv build-scripts ms/apollo-hospitals/ || exit 2

echo -e "\ncopying paytm-paymentgateway..."
cp -Rv paytm-integration ms/apollo-hospitals/ || exit 2

echo -e "\nbuilding aph-ms-$1.tar.gz artifact..."
tar -czf aph-ms-$1.tar.gz -C ms apollo-hospitals || exit 2

echo -e "\ncleaning up..."
rm -rf ms || exit 2

echo -e "\nsuccess! build artifacts"
