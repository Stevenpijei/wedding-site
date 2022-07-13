ssh -i ~/Desktop/LSTV2/lstv2_build.pem ec2-user@ec2-3-135-227-11.us-east-2.compute.amazonaws.com "/bin/bash -c pg_dump --exclude-table-data=request_log  > lstv2.db" &&
scp -i  ~/Desktop/LSTV2/lstv2_build.pem ec2-user@ec2-3-135-227-11.us-east-2.compute.amazonaws.com:~/lstv2.db lstv2.db &&
ssh -i ~/Desktop/LSTV2/lstv2_build.pem ec2-user@ec2-3-135-227-11.us-east-2.compute.amazonaws.com "rm lstv2.db" &&
psql -c "drop database lstv2" postgres &&
psql -c "create database lstv2" postgres &&
psql < lstv2.db &&
rm lstv2.db



