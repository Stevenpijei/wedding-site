#!/bin/bash

# LSTV2 cluster propeties
export HOSTED_ZONE_ID="Z0636543K18Q3PH11J75"
export BACKEND_SUBDOMAIN="app.lovestoriestv.com"
export BACKEND_SSL_CERT_ARN="arn:aws:acm:us-east-1:058244107102:certificate/f2341589-763d-49ed-81dc-37b59c666691"
export K_HOME_DIR="/users/ronenmagid/dev/lstv2/lstv_be/kubernetes/"
export CLUSTER_NAME="lstv-prod"
export CLUSTER_REGION="us-east-2"
export VPC_ID="vpc-051b50c4dd702a50c"
export NUM_NODES=4
export MIN_NODES=2
export MAX_NODES=10
export NODE_TYPE=t3.2xlarge
#--------------------------------------------------------------------------------------------------------

k8s_setup() {

  kubectl create secret generic lstv2-app-server-db-urls --from-literal=db_mysql_url='mysql://root:IAjyaravhesJoh0@lstv-last-db.cloqzmsbciiq.us-east-2.rds.amazonaws.com:3306/lstv'  \
  --from-literal=db_psql_url='postgres://postgres:J8N6+qRiHHXF41c&ltb_&i1!QX(Gj@lstv-prod.cluster-cloqzmsbciiq.us-east-2.rds.amazonaws.com:5432/lstv2' \
  --from-literal=db_psql_password='J8N6+qRiHHXF41c&ltb_&i1!QX(Gj'
  kubectl create secret generic aws-secret  --from-literal=aws_access_key_id='AKIAQ3D46RNPHQNKGBFK' --from-literal=aws_secret_access_key='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'
  kubectl create secret generic third-party-saas  --from-literal=sendgrid_api_key='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'

  # run migration job
  #kubectl apply -f ${K_HOME_DIR}/job-migrate-django-db.yaml
  #kubectl wait --for=condition=complete job/lstv2-migrate-db-job
  #kubectl apply  -f ${K_HOME_DIR}/lstv-app-server-prod.yaml
  #kubectl apply  -f ${K_HOME_DIR}/lstv-app-celery-prod.yaml
  kubectl apply  -f ${K_HOME_DIR}/lstv-migrator-prod.yaml

  return

  # delete migration job
  #kubectl delete job.batch/lstv2-migrate-db-job

  export ELB_HOSTNAME=""
  while [[ "${ELB_HOSTNAME}" == "" ]]
  do
    export ELB_HOSTNAME=$(kubectl get service lstv-app-server -o jsonpath='{ $.status.loadBalancer.ingress[0].hostname}')

  done
  echo "ELB Hostname: $ELB_HOSTNAME"

  # retain the nodePort for the [443:ELB] -> [xxxxx:K8S Node]
  export ELB_NODEPORT=$(kubectl get service lstv-app-server -o jsonpath='{ $.spec.ports[0].nodePort}')

  # create subdomain with routing to ELB
  TMPFILE=$(mktemp /tmp/temporary-file.XXXXXXXX)
  cat > "${TMPFILE}" << EOF
    {
      "AWSPolicyFormatVersion": "2015-10-01",
      "RecordType": "A",
      "Endpoints": {
        "endpoint-start-OimI": {
          "Type": "elastic-load-balancer",
          "Value": "${ELB_HOSTNAME}"
        }
      },
      "StartEndpoint": "endpoint-start-OimI"
    }
EOF

  # create traffic policy
  echo "creating route policy from ${TMPFILE}" &&
  export TRAFFIC_POLICY_ID=$(aws route53 create-traffic-policy --name "lstv-backend" --document file://"${TMPFILE}" | jq -r ".TrafficPolicy.Id")


  echo "created traffic policy: ${TRAFFIC_POLICY_ID}"

  # attach traffic policy to hosted zone
  echo "attaching route policy to hosted zone"
  aws route53 create-traffic-policy-instance \
    --hosted-zone-id ${HOSTED_ZONE_ID} \
    --name ${BACKEND_SUBDOMAIN} \
    --ttl 300 \
    --traffic-policy-id "${TRAFFIC_POLICY_ID}" \
    --traffic-policy-version 1
  echo "applied created traffic policy to hosted zone: ${BACKEND_SUBDOMAIN}"

  # obtain load balancer name
  export LOAD_BALANCER_NAME=$(aws elb describe-load-balancers | jq -r ".LoadBalancerDescriptions[0].LoadBalancerName")


  aws elb delete-load-balancer-listeners \
   --load-balancer-name "${LOAD_BALANCER_NAME}" \
   --load-balancer-ports 443

  sleep 5

  # enable SSL listeners on the generated ELB and plug in the certificate
  aws elb create-load-balancer-listeners \
    --load-balancer-name "${LOAD_BALANCER_NAME}" \
    --listeners Protocol=HTTPS,LoadBalancerPort=443,InstanceProtocol=HTTP,InstancePort=${ELB_NODEPORT},SSLCertificateId=${BACKEND_SSL_CERT_ARN}
}

#--------------------------------------------------------------------------------------------------------

k8s_teardown() {


  echo "hosted zone: ${BACKEND_SUBDOMAIN} (${HOSTED_ZONE_ID})"
  aws route53 list-traffic-policy-instances-by-hosted-zone --hosted-zone-id ${HOSTED_ZONE_ID}


  export TRAFFIC_POLICY_ID=$(aws route53 list-traffic-policy-instances-by-hosted-zone --hosted-zone-id ${HOSTED_ZONE_ID} | jq -r ".TrafficPolicyInstances[] | select(.Name == \"${BACKEND_SUBDOMAIN}.\") | .TrafficPolicyId")
  export TRAFFIC_POLICY_INSTANCE_ID=$(aws route53 list-traffic-policy-instances-by-hosted-zone --hosted-zone-id ${HOSTED_ZONE_ID} | jq -r ".TrafficPolicyInstances[] | select(.Name == \"${BACKEND_SUBDOMAIN}.\") | .Id")

  echo "traffic policy instance id: ${TRAFFIC_POLICY_INSTANCE_ID}"
  echo "traffic policy id: ${TRAFFIC_POLICY_ID}"

  kubectl delete deployments --all
  kubectl delete services --all
  kubectl delete statefulset.apps --all
  kubectl delete configmap --all
  kubectl delete persistentvolumeclaim --all
  kubectl delete endpoints --all
  kubectl delete secrets --all
  kubectl delete job.batch --all


  aws route53 delete-traffic-policy-instance  --id ${TRAFFIC_POLICY_INSTANCE_ID}

  # wait until we are actually deleted
  export TMP_ID="1"
  while [[ "${TMP_ID}" != "" ]]
  do
    echo "waiting to confirm policy instance deletion..."
    export TMP_ID=$(aws route53 list-traffic-policy-instances-by-hosted-zone --hosted-zone-id ${HOSTED_ZONE_ID} | jq -r ".TrafficPolicyInstances[] | select(.Name == \"${BACKEND_SUBDOMAIN}.\") | .Id")
    sleep 5
  done
  echo "traffic policy deleted!"

  aws route53  delete-traffic-policy --id ${TRAFFIC_POLICY_ID} --traffic-policy-version 1


}

#--------------------------------------------------------------------------------------------------------

if [ "$#" -ne 1 ]
then
  echo "Usage: lstv2_eks create   -- create lstv2 cluster"
  echo "                 delete   -- delete lstv2 cluster"
  echo "                 setup    -- setup lstv2 without creating the cluster"
  echo "                 teardown -- teardown lstv2 without destroying the cluster"
  exit 1
fi

if [ "$1" = "create" ]; then

  # create cluster
  eksctl create cluster \
    --region=${CLUSTER_REGION} \
    --node-type=${NODE_TYPE} \
    --nodes=${NUM_NODES} \
    --nodes-min=${MIN_NODES} \
    --nodes-max=${MAX_NODES} \
    --name=${CLUSTER_NAME} \
    --managed


  # apply services
  k8s_setup


  echo "${CLUSTER_NAME} created"
  exit 0
fi

if [ "$1" = "delete" ]; then

  k8s_teardown

  # delete cluster
  eksctl delete cluster --name=${CLUSTER_NAME}
  echo "${CLUSTER_NAME} deleted"
  exit 0
fi


if [ "$1" = "teardown" ]; then
  k8s_teardown
  exit 0
fi

if [ "$1" = "setup" ]; then
  k8s_setup
  exit 0
fi


echo "Invalid command. Use create, delete, setup or teardown."
exit 1