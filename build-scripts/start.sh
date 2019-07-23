#!/usr/bin/env bash
# $1 refers the environment: 'local' | 'dev' | 'qa' | 'production'
# This script should run while ssh'ed into the remote server

cd tmp
docker-compose stop
tar -xzvf aph-$1.tar.gz
cd apollo-hospitals
pwd
ls
docker-compose up
