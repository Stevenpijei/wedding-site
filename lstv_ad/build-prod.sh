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
VERSION_CONTENT=$(grep APP_VERSION __current_version_prod__ | xargs)
export version=${VERSION_CONTENT#*=}
echo "current version ${version}"

# upping version
export new_version=$(increment_version $version 3)
echo "upping version to ${new_version}"
echo "APP_VERSION=${new_version}" > __current_version_prod__

# build and deplpoy frontend
yarn install &&
yarn build:prod &&
aws s3 rm s3://isaac.lovestoriestv.com/ --recursive &&
aws s3 cp ./build/ s3://isaac.lovestoriestv.com/ --recursive --exclude *.js.map --acl public-read &&
aws cloudfront create-invalidation --distribution-id E3VD3B60HKGJIS  --paths "/*" &&

git tag "lstv2-tag-ad-prod-$new_version" &&
git commit  -am "upping isaac/web build version from $version to $new_version" &&
git push origin main

