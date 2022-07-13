#!/bin/bash
branch=$(git branch | sed -n -e 's/^\* \(.*\)/\1/p')
echo "current branch ${branch}"

if [ $# -eq 1 ]
then
  echo "building using the DB path provided"
  DB_PATH=$1
  echo "checking if $1 exists"
  if [[ ! -f $DB_PATH ]]
  then
    echo "The file ${DB_PATH} does not exist!"
    exit 1

  else
    echo "Database file found, copying database to docker build context"
    cp $DB_PATH docker/postgres/lstv2.db
  fi

  echo "Building images for database, web, redis and celery"
  docker-compose -f docker-compose-be.yml build  --no-cache db web redis celery elasticsearch
fi

echo "Starting images for database, web, redis and celery in detached mode."
docker-compose -f docker-compose-be.yml up -d db web redis celery elasticsearch
echo "to check logs run docker-compose logs -f"


