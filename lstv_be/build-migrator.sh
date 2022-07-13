#!/bin/bash

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
version=$(head -n 1 lstv_be/settings/__current_build__migrator__)
[ -z "$version" ] && echo "ERROR: no version found in settings/__current_build__migrator__" && exit 1
echo "current line ${version}"

export new_version=$(increment_version $version 3)

# upping version
echo "upping version to ${new_version}"

# upping __current_build version
echo $new_version >  lstv_be/settings/__current_build__migrator__ &&

echo "updating local version persistence"

# upping the version on the kubernetes yaml files
sed -i "s/$version/$new_version/g" ./kubernetes/lstv-migrator.yaml &&

# make sure we're logeged into ECT 
./awslogin.sh

# build docker images and pushing to AWS
#
docker build -t lstv2-migrator:${new_version}  --build-arg RELEASE_STAGE_DEFAULT=staging-mig  . &&
docker build -f Dockerfile-Migrator  -t lstv2-migrator:${new_version} --build-arg RELEASE_STAGE_DEFAULT=staging-mig . &&
docker tag lstv2-migrator:${new_version}  058244107102.dkr.ecr.us-east-2.amazonaws.com/lstv2-migrator:${new_version} &&
docker push 058244107102.dkr.ecr.us-east-2.amazonaws.com/lstv2-migrator:${new_version} &&


echo "committing version persistence to source control" &&

git tag "lstv2-tag-be-$new_version"
git add ./kubernetes/lstv-migrator.yaml lstv_be/settings/__current_build__migrator__ &&
git commit  -am "upping migrator build version from $version to $new_version" &&
git push origin develop  &&

# applying the containers to kubernetes

kubectl delete pod lstv-migrator
kubectl apply  -f ./kubernetes/lstv-migrator.yaml

# delete cron jobs (this must be done or the you run the risk of running stale image versions)


echo "${new_version} sent to cluster"




