g#!/bin/bash

# increment version

increment_version() {
 local v=$1
 if [ -z $2 ]; then
    local rgx='^((?:[0-9]+\.)*)([0-9]+)($)'
 else
    local rgx='^((?:[0-9]+\.){'$(($2-1))'})([0-9]+)(\.|$)'
    for (( p=`grep -o "\."<<<".$v"|wc -l`; p<$2; p++)); do
       v+=.0; done; fi
 val=`echo -e "$v" | perl -pe 's/^.*'$rgx'.*$/$2/'`
 echo "$v" | perl -pe s/$rgx.*$'/${1}'`printf %0${#val}s $(($val+1))`/
}

# get current version
version=$(head -n 1 lstv_be/settings//__current_build_prod__)
[ -z "$version" ] && echo "ERROR: no version found in settings//__current_build_prod__" && exit 1
echo "current line ${version}"

export new_version=$(increment_version $version 3)

# upping version
echo "upping version to ${new_version}"

# upping __current_build version
echo $new_version >  lstv_be/settings//__current_build_prod__ &&

echo "updating local version persistence"

# upping the version on the kubernetes yaml files
sed -i  "s/$version/$new_version/g" ./kubernetes/lstv-app-celery-prod.yaml &&
sed -i  "s/$version/$new_version/g" ./kubernetes/lstv-app-server-prod.yaml &&
sed -i  "s/$version/$new_version/g" ./kubernetes/job-tri-weekly-maintenance-prod.yaml &&
sed -i  "s/$version/$new_version/g" ./kubernetes/job-daily-isaac-digest-prod.yaml &&
sed -i  "s/$version/$new_version/g" ./kubernetes/job-daily-maintenance-prod.yaml &&
sed -i  "s/$version/$new_version/g" ./kubernetes/job-first-of-the-month-prod.yaml &&
sed -i  "s/$version/$new_version/g" ./kubernetes/job-monday-morning-prod.yaml &&

# make sure we're logeged into ECT 
./awslogin.sh

# build docker images and pushing to AWS
docker build -t lstv2-prod:${new_version}  --build-arg RELEASE_STAGE_DEFAULT=production . &&
docker build -f Dockerfile-Celery -t lstv2-celery-prod:${new_version} --build-arg RELEASE_STAGE_DEFAULT=production . &&
docker tag lstv2-prod:${new_version}  058244107102.dkr.ecr.us-east-2.amazonaws.com/lstv2-prod:${new_version} &&
docker tag lstv2-celery-prod:${new_version}  058244107102.dkr.ecr.us-east-2.amazonaws.com/lstv2-celery-prod:${new_version} &&
docker push 058244107102.dkr.ecr.us-east-2.amazonaws.com/lstv2-prod:${new_version} &&
docker push 058244107102.dkr.ecr.us-east-2.amazonaws.com/lstv2-celery-prod:${new_version} &&



echo "committing version persistence to source control" &&

git tag "lstv2-tag-be-prod-$new_version"
git add ./kubernetes/job-daily-isaac-digest-prod.yaml ./kubernetes/job-daily-maintenance-prod.yaml ./kubernetes/job-tri-weekly-maintenance-prod.yaml ./kubernetes/lstv-app-celery-prod.yaml ./kubernetes/lstv-app-server-prod.yaml lstv_be/settings/__current_build_prod__ &&
git commit  -am "upping container build version from $version to $new_version" &&
git push origin main &&

echo "applying to containers"
#export KUBECONFIG="/home/ec2-user/.kube/config-eks" &&
# applying the containers to kubernetes

kubectl apply  -f ./kubernetes/lstv-app-server-prod.yaml &&
kubectl apply  -f ./kubernetes/lstv-app-celery-prod.yaml &&

# delete cron jobs (this must be done or the you run the risk of running stale image versions)

kubectl delete cronjobs --all

# update cron jobs

kubectl apply  -f ./kubernetes/job-daily-isaac-digest-prod.yaml &&
kubectl apply  -f ./kubernetes/job-tri-weekly-maintenance-prod.yaml &&
kubectl apply  -f ./kubernetes/job-first-of-the-month-prod.yaml &&
kubectl apply  -f ./kubernetes/job-monday-morning-prod.yaml

echo "${new_version} sent to cluster"




