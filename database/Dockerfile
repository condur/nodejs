FROM postgres:10.5

ENV POSTGRES_PASSWORD       demo
ENV POSTGRES_DB             nodejs
ENV NODEJS_DB_PASSWORD      nodejs_demo

COPY ./init-scripts/ /docker-entrypoint-initdb.d/
