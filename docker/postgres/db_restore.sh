#!/bin/bash
set -e

psql --username "lstv_user" --dbname "lstv2" < "/usr/src/lstv2.db"
