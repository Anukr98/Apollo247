#!/usr/bin/env bash
# $1 refers the environment: 'local' | 'dev' | 'qa' | 'production'

./build-scripts/build.sh $1

echo -e "\nscping build artifacts and sshing into $1.api.aph.popcornapps.com..."
scp aph-$1.tar.gz start.sh "apollodev@$1.api.aph.popcornapps.com:/home/apollodev"
ssh apollodev@$1.api.aph.popcornapps.com "cd /home/apollodev && ./start.sh $1"
