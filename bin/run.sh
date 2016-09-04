#!/usr/bin/env bash
cd ./app && npm i && gulp dev && cd ../server && npm i && node index.js
