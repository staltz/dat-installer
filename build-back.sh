#!/bin/sh

echo "Setting up...";
mkdir -p ./rnnodeapp/;
cp ./src/backend/package.json ./rnnodeapp/;

echo "Compiling...";
$(npm bin)/tsc --project ./tsconfig-backend.json;

echo "Installing dependencies...";
cd ./rnnodeapp && npm i && cd ..;

echo "Minifying...";
$(npm bin)/noderify ./rnnodeapp/main.js > ./rnnodeapp/index.js;
rm ./rnnodeapp/main.js;
rm ./rnnodeapp/utils.js;

echo "Cleaning up...";
declare -a keepModules=("blake2b-wasm"
                        "append-tree"
                        "siphash24")
for i in "${keepModules[@]}"
do
  mv ./rnnodeapp/node_modules/$i ./rnnodeapp/$i;
done
rm -rf ./rnnodeapp/node_modules;
mkdir -p ./rnnodeapp/node_modules;
for i in "${keepModules[@]}"
do
  mv ./rnnodeapp/$i ./rnnodeapp/node_modules/$i;
done

echo "Inserting into Android app...";
$(npm bin)/react-native-node insert ./rnnodeapp

echo "Done.";