FROM node:18.0.0

WORKDIR /var/opt/mssql/data

#RUN touch text.txt
# RUN touch egccrm_data.mdf
# RUN touch egccrm_data_log.ldf
# RUN touch egccrm_v4.mdf
# RUN touch egccrm_v4_log.ldf

WORKDIR /var/opt/mssql/source

COPY *.bak .

WORKDIR /app/sqlcmd

COPY *.sql .
COPY *.json .
COPY *.js .

RUN apt-get update

RUN npm install

#CMD node index.js -S:mssql,1433 -U:sa -P:SA_Passw0rd -D:master -C -N -i:./filldata.sql

#CMD node index.js -S:mssql,1433 -U:sa -P:SA_Passw0rd -D:master -C -N
CMD node index.js -S:mssql -U:sa -P:SA_Passw0rd -D:master -C -N -i:restore.sql

