#!/usr/bin/env bash
if [$1 = '']; then
  echo "You must define a package name to serve"
else
  docker compose exec -it 2am-nestkit /bin/sh -c "yarn nx reset"
  docker compose exec -it 2am-nestkit /bin/sh -c "yarn nx run $1:serve"
fi