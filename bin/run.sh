#!/usr/bin/env bash
cd ./app && npm i && gulp build && cd ../server && npm i && node index.js
