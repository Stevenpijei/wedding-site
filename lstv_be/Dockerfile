FROM python:3.8.6

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        postgresql-client redis-tools  mariadb-client-10.3 apt-utils ffmpeg \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app
COPY requirements.txt ./
RUN pip install -r requirements.txt 
COPY . .

ARG RELEASE_STAGE_DEFAULT=production
ENV RELEASE_STAGE=${RELEASE_STAGE_DEFAULT}

RUN find . | grep -E "(__pycache__|\.pyc|\.pyo$)" | xargs rm -rf

RUN echo "\pset pager off" >> ~/.psqlrc
RUN echo "\x auto" >> ~/.psqlrc

CMD ["gunicorn", "lstv_be.wsgi", "-b", "0.0.0.0:8000", "--log-level", "info", "--worker-class", "eventlet"]
#CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
EXPOSE 8000
