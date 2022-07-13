ssh  -i ~/Desktop/LSTV2/prodbox21.pem ec2-user@ec2-3-138-60-76.us-east-2.compute.amazonaws.com "/bin/bash -c pg_dump --exclude-table-data=request_log > lstv2_prod.db" &&
scp  -i ~/Desktop/LSTV2/prodbox21.pem ec2-user@ec2-3-138-60-76.us-east-2.compute.amazonaws.com:~/lstv2_prod.db lstv2_prod.db &&
ssh  -i ~/Desktop/LSTV2/prodbox21.pem ec2-user@ec2-3-138-60-76.us-east-2.compute.amazonaws.com "rm lstv2_prod.db" &&
psql -c "drop database lstv2_prod" postgres &&
psql -c "create database lstv2_prod" postgres &&
psql lstv2_prod < lstv2_prod.db &&
rm lstv2_prod.db
