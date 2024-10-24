#!/usr/bin/env bash
docker compose exec -it 2am-nestkit /bin/sh -c "yarn nx reset"
docker compose exec -it 2am-nestkit /bin/sh -c "yarn test"