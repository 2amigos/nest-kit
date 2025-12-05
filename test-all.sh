#!/usr/bin/env bash
set -e
yarn nx reset
yarn nx run crudx:test
yarn nx reset
yarn nx run crudx-swagger:test