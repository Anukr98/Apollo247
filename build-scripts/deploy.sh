#!/usr/bin/env bash
# $1 refers the environment: 'local' | 'dev' | 'qa' | 'production'

./build-scripts/build.sh $1

echo -e "\nscping build artifact aph-$1-tar.gz and sshing into $1.api.aph.popcornapps.com..."
scp aph-$1.tar.gz "apollodev@$1.api.aph.popcornapps.com:/home/apollodev"
ssh apollodev@$1.api.aph.popcornapps.com "cd /home/apollodev && tar -xzf aph-$1.tar.gz && ./apollo-hospitals/build-scripts/start.sh $1"
