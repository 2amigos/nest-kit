#!/usr/bin/env bash
set -e
yarn install --frozen-lockfile 
yarn global add @nestjs/cli
yarn nx reset
yarn nx run crudx:test
yarn nx reset
yarn nx run crudx-swagger:test