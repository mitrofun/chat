#!/usr/bin/env bash
cd ./server && npm i && node index.js
cd ./app && npm i && gulp
