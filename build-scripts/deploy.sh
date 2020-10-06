#!/usr/bin/env bash
# $1 refers the environment: 'local' | 'development' | 'staging' | 'production'

./build-scripts/build.sh $1

echo -e "\nscping build artifacts and sshing into aph.$1.api.popcornapps.com..."
scp aph-$1.tar.gz build-scripts/start.sh "apollodev@aph.$1.api.popcornapps.com:/home/apollodev"
ssh apollodev@aph.$1.api.popcornapps.com "cd /home/apollodev && ./start.sh $1"
