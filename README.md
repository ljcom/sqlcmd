# sqlcmd

alternative sqlcmd that you can use in docker installation.

## run docker-compose: 
  docker compose -f "docker-compose.yaml" up -d --build 
  
First it will install sql server
then will running migration container to restore or create your database.

## dockerfile:
- change restore.sql with filldata.sql depend on yoour purpose.

## sqlcmd:

sqlcmd is made using node.js

You are welcome to fork or pull request to fix/add any features.

  node index.js -S:mssql -U:sa -P:Passw0rd -D:master -C -N -i:restore.sql


### Parameters:
-S: server
-E: integrated authentication
-U: user id
-P: password
-D: database
-C: trust certificate
-N: encrypt
-q: simple sql query
-i: file to be executed
