FROM node:18.0.0

WORKDIR /var/opt/mssql/source

COPY *.bak .

WORKDIR /app/sqlcmd

COPY *.sql .
COPY *.json .
COPY *.js .

RUN apt-get update

RUN npm install

CMD node index.js -S:mssql -U:sa -P:SA_Passw0rd -D:master -C -N -i:restore.sql

