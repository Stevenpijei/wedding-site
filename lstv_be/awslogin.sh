export AWSLOGIN=$(aws ecr get-login --no-include-email)
echo $AWSLOGIN > login.sh
chmod +x login.sh
./login.sh
rm login.sh
unset AWSLOGIN
