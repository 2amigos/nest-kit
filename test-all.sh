#!/usr/bin/env bash
set -e
docker compose exec -it 2am-nestkit /bin/sh -c "yarn nx reset"
docker compose exec -it 2am-nestkit /bin/sh -c "yarn nx run crudx:test"
docker compose exec -it 2am-nestkit /bin/sh -c "yarn nx reset"
docker compose exec -it 2am-nestkit /bin/sh -c "yarn nx run crudx-swagger:test"