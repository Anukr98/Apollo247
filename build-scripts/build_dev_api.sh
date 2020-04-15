#!/usr/bin/env bash
# $1 refers the environment: 'local' | 'development' | 'staging' | 'production'

echo -e "\ncleaning up any old build files..."
rm -fv aph-$1*.tar.gz
rm -rfv skeleton || exit 2
rm -rfv packages/api/dist/* || exit 2
rm -rfv packages/web-doctors/dist/* || exit 2
rm -rfv packages/web-patients/dist/* || exit 2
rm -rfv packages/universal/dist/* || exit 2

echo -e "\nrunning bootstrap:web..."
npm run bootstrap:web || exit 2
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

#echo -e "\nbuilding web-patients..."
#cd packages/web-patients
#npm run build || exit 2
#cd -

#echo -e "\nbuilding web-doctors..."
#cd packages/web-doctors
#npm run build || exit 2
#cd -

echo -e "\ncopying all api files..."
mkdir -pv skeleton/apollo-hospitals/packages/api/ || exit 2
cp -Rv packages/api/dist/* skeleton/apollo-hospitals/packages/api/ || exit 2
cp -Rv packages/api/src/**/*.sql skeleton/apollo-hospitals/packages/api/ || exit 2
echo "'packages/api/node_modules' -> 'skeleton/apollo-hospitals/packages/api/node_modules'"
cp -RL packages/api/node_modules skeleton/apollo-hospitals/packages/api/ || exit 2
cp packages/api/firebase-secrets.json skeleton/apollo-hospitals/packages/api/ || exit 2

#echo -e "\ncopying web-patients files..."
#mkdir -pv skeleton/apollo-hospitals/packages/web-patients/ || exit 2
#cp -Rv packages/web-patients/dist/* skeleton/apollo-hospitals/packages/web-patients/ || exit 2

#echo -e "\ncopying web-doctors files..."
#mkdir -pv skeleton/apollo-hospitals/packages/web-doctors/ || exit 2
#cp -Rv packages/web-doctors/dist/* skeleton/apollo-hospitals/packages/web-doctors/ || exit 2

echo -e "\ncopying universal files..."
mkdir -pv skeleton/apollo-hospitals/packages/universal/ || exit 2
cp -Rv packages/universal/dist/* skeleton/apollo-hospitals/packages/universal/ || exit 2

echo -e "\ncopying env file..."
cp -v .env skeleton/apollo-hospitals || exit 2

echo -e "\ncopying build-scripts..."
cp -Rv build-scripts skeleton/apollo-hospitals/ || exit 2

echo -e "\ncopying paytm-paymentgateway..."
cp -Rv paytm-integration skeleton/apollo-hospitals/ || exit 2
#cp -v .env skeleton/apollo-hospitals/paytm-integration || exit 2

echo -e "\nbuilding aph-$1.tar.gz artifact..."
tar -czf aph-$1.api.tar.gz -C skeleton apollo-hospitals || exit 2

echo -e "\ncleaning up..."
rm -rf skeleton || exit 2


echo -e "\nsuccess! build artifacts"
