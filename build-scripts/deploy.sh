#!/usr/bin/env bash
# $1 refers the environment: 'local' | 'dev' | 'qa' | 'production'

./build-scripts/build.sh $1

# echo -e "\n scping build artifact and sshing into $1.aph.popcornapps.com..."
# scp aph-$1.tar.gz "$1.api.aph.popcornapps.com:/srv"
# ssh $1.aph.popcornapps.com "cd /srv && tar -xzvf aph-$1.tar.gz && ./apollo-hospitals/build-scripts/start.sh \"$1\""
rm -rf tmp
mkdir tmp
mv aph-$1.tar.gz tmp/
./build-scripts/start.sh $1
