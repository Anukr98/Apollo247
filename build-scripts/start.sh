#!/usr/bin/env bash
# $1 refers the environment: 'local' | 'development' | 'staging' | 'production'
# This script should run while ssh'ed into the remote server

if [ -d "./apollo-hospitals" ] 
then
  echo -e "\nstopping old containers..."
  cd apollo-hospitals
  docker-compose stop
  cd ..

  echo -e "\nremoving old apollo-hospitals dir..."
  rm -rf apollo-hospitals
fi

echo -e "\nuntaring aph-$1.tar.gz artifact..."
tar -xzf aph-$1.tar.gz 
mv -v aph-$1.tar.gz aph-$1-$(date +%Y-%m-%d_%H-%M-%S).tar.gz

echo -e "\nstarting newly deployed containers..."
cd apollo-hospitals
docker-compose up -d

echo -e "\ncleaning up..."
cd ..
rm -f start.sh
