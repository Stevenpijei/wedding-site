FROM postgres:latest

#DB file path
ARG DB_PATH

#credentials
ENV POSTGRES_USER=lstv_user
ENV POSTGRES_PASSWORD=lstv_pass
ENV POSTGRES_DB=lstv2

#working directory
WORKDIR /usr/src

#copying the .db file and init script
EXPOSE 5432
# COPY lstv2.db .
COPY db_restore.sh /docker-entrypoint-initdb.d/db_restore.sh


