#!/usr/bin/env bash
# $1 refers the environment: 'local' | 'dev' | 'qa' | 'production'
# This script should run while ssh'ed into the remote server

cd apollo-hospitals
docker-compose stop
cd ..
rm -rf apollo-hospitals
tar -xzf aph-$1.tar.gz 
mv -v aph-$1.tar.gz aph-$1-$(date +%Y-%m-%d_%H-%M-%S).tar.gz
cd apollo-hospitals
docker-compose up -d
cd ..
rm -f start.sh
