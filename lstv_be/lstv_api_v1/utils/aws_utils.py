import urllib
from time import time
import boto3
from botocore.config import Config
from botocore.exceptions import ClientError
import requests
import os
from urllib.parse import urlparse

from lstv_be.settings import DEFAULT_CDN, DEFAULT_CDN_DISTRIBUTION_ID, DEFAULT_CDN_BUCKET_NAME, WEB_SERVER_URL, \
    DEFAULT_CDN_BUCKET_URL


def process_thumbnail_url(thumbnail_url):
    if DEFAULT_CDN in thumbnail_url or DEFAULT_CDN_BUCKET_URL in thumbnail_url :
        if DEFAULT_CDN_BUCKET_URL in thumbnail_url:
            old_key = thumbnail_url.replace(DEFAULT_CDN_BUCKET_URL + "/", "")
        if DEFAULT_CDN in thumbnail_url:
            old_key = thumbnail_url.replace(DEFAULT_CDN + "/", "")
        new_key = old_key.replace("photos/uploads", "photos/originals")
        success = aws_s3_move_file_to_another_key(old_key, new_key)
        if success:
            aws_s3_change_file_acl(DEFAULT_CDN_BUCKET_NAME, new_key, True)
            return f"{DEFAULT_CDN}/{new_key}"
    return thumbnail_url



def get_upload_pre_signed_url(bucket_name, key, expiration=3600):
    from lstv_api_v1.tasks.tasks import job_alert_cto
    s3 = boto3.client('s3',
                      aws_access_key_id="AKIAQ3D46RNPMVSXAMR2",
                      aws_secret_access_key="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",
                      config=Config(region_name='us-east-2', s3={"use_accelerate_endpoint": True}))

    try:
        url = s3.generate_presigned_url('put_object', Params={'Bucket': bucket_name, 'Key': key},
                                        ExpiresIn=3600,
                                        HttpMethod='PUT')

    except ClientError as e:
        job_alert_cto.delay("AWS/S3: issues invalidating CDN path",
                            "invalidate_public_cdn_path",
                            f"{e} - bucket_name: {bucket_name}  key: {key} expiration: {expiration}")
        return None

    return url


def invalidate_public_cdn_path(url):
    from lstv_api_v1.tasks.tasks import job_alert_cto
    client = boto3.client('cloudfront')

    url = url.replace(DEFAULT_CDN, '')

    try:
        response = client.create_invalidation(
            DistributionId=DEFAULT_CDN_DISTRIBUTION_ID,
            InvalidationBatch={
                'Paths': {
                    'Quantity': 1,
                    'Items': [
                        url
                    ],
                },
                'CallerReference': str(time()).replace("..", "")
            }
        )
    except ClientError as e:
        job_alert_cto.delay("AWS/S3: issues invalidating CDN path",
                            "invalidate_public_cdn_path",
                            f"{e} - url: {url}")
        return False

    return True


def invalidate_server_endpoint(url):
    from lstv_api_v1.tasks.tasks import job_alert_cto
    client = boto3.client('cloudfront')

    url = url.replace('https://d3g1ohya32imgb.cloudfront.net', '')

    try:
        response = client.create_invalidation(
            DistributionId='ED8APJP3B6B6R',
            InvalidationBatch={
                'Paths': {
                    'Quantity': 1,
                    'Items': [
                        url
                    ],
                },
                'CallerReference': str(time()).replace("..", "")
            }
        )
    except ClientError as e:
        job_alert_cto.delay("AWS/S3: issues invalidating server endpoint",
                            "invalidate_server_endpoint",
                            f"{e} - url: {url}")
        return False

    return True


def delete_file_from_aws_s3(path, filename):
    from lstv_api_v1.tasks.tasks import job_alert_cto
    aws_region = "us-east-2"
    aws_bucket_name = DEFAULT_CDN_BUCKET_NAME
    aws_access_key_id = "AKIAIQ4ZL5GC47JEIYZQ"
    aws_secret_access_key = "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"

    s3 = boto3.resource(
        's3',
        aws_access_key_id=aws_access_key_id,
        aws_secret_access_key=aws_secret_access_key,
        region_name=aws_region)

    a = urlparse(filename)
    filename = os.path.basename(a.path)

    try:
        my_object = s3.Object(aws_bucket_name, path + "/" + filename)
        response = my_object.delete()
    except ClientError as e:
        job_alert_cto.delay("AWS/S3: issues deleting a file",
                            "delete_file_from_aws_s3",
                            f"{e} - path: {path}/{filename}")
        return False

    return True


def delete_full_path_from_aws_s3(path):
    from lstv_api_v1.tasks.tasks import job_alert_cto
    aws_region = "us-east-2"
    aws_bucket_name = DEFAULT_CDN_BUCKET_NAME
    # aws_s3_endpoint = "s3.us-east-2.amazonaws.com"
    aws_access_key_id = "AKIAIQ4ZL5GC47JEIYZQ"
    aws_secret_access_key = "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"

    s3 = boto3.resource(
        's3',
        aws_access_key_id=aws_access_key_id,
        aws_secret_access_key=aws_secret_access_key,
        region_name=aws_region)

    try:
        my_object = s3.Object(aws_bucket_name, path.split('.amazonaws.com/')[1])
        response = my_object.delete()
    except ClientError as e:
        job_alert_cto.delay("AWS/S3: issues deleting a file",
                            "delete_full_path_from_aws_s3",
                            f"{e} - path: {path}")
        return False

    return True


def aws_s3_move_file_to_another_key(current_key, new_key):
    from lstv_api_v1.tasks.tasks import job_alert_cto
    aws_region = "us-east-2"
    aws_bucket_name = DEFAULT_CDN_BUCKET_NAME
    aws_access_key_id = "AKIAIQ4ZL5GC47JEIYZQ"
    aws_secret_access_key = "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"

    # get the connection of AWS S3 Bucket
    s3 = boto3.resource(
        's3',
        aws_access_key_id=aws_access_key_id,
        aws_secret_access_key=aws_secret_access_key,
        region_name=aws_region
    )

    try:
        s3.Object(aws_bucket_name, new_key).copy_from(CopySource=aws_bucket_name + "/" + current_key)
        s3.Object(aws_bucket_name, current_key).delete()
    except ClientError as e:
        print(current_key)
        print(new_key)
        print(e)
        # job_alert_cto.delay(f"({WEB_SERVER_URL}) JAWS/S3: issues moving files",
        #                     "aws_s3_move_file_to_another_key",
        #                     f"{e} - current key: {current_key}, new key: {new_key}")

        return False

    return True


def aws_s3_get_object_url(bucket, key):
    from lstv_api_v1.tasks.tasks import job_alert_cto
    aws_region = "us-east-2"
    aws_access_key_id = "AKIAIQ4ZL5GC47JEIYZQ"
    aws_secret_access_key = "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"

    # get the connection of AWS S3 Bucket
    s3_client = boto3.client(
        's3',
        aws_access_key_id=aws_access_key_id,
        aws_secret_access_key=aws_secret_access_key,
        region_name=aws_region
    )
    return s3_client.generate_presigned_url('get_object', Params={'Bucket': bucket,
                                                                  'Key': key})

def aws_s3_is_object_public(bucket, key):
    from lstv_api_v1.tasks.tasks import job_alert_cto
    aws_region = "us-east-2"
    aws_access_key_id = "AKIAIQ4ZL5GC47JEIYZQ"
    aws_secret_access_key = "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"

    # get the connection of AWS S3 Bucket
    s3 = boto3.resource(
        's3',
        aws_access_key_id=aws_access_key_id,
        aws_secret_access_key=aws_secret_access_key,
        region_name=aws_region
    )

    object_acl = s3.ObjectAcl(bucket, key)
    rc = False
    try:
        for grant in object_acl.grants:
            if grant.get('Grantee', {}).get('URI', {}) == 'http://acs.amazonaws.com/groups/global/AllUsers' and \
                    grant.get('Permission', {}) == 'READ':
                rc = True
    except ClientError as e:
        job_alert_cto.delay(f"({WEB_SERVER_URL}) AWS/S3: Object public status", "aws_s3_is_object_public",
                            f"{e} - bucket: "
                            f"{bucket}, key: {key}")
    return rc


def aws_s3_change_file_acl(bucket, key, public=True):
    from lstv_api_v1.tasks.tasks import job_alert_cto
    aws_region = "us-east-2"
    aws_access_key_id = "AKIAIQ4ZL5GC47JEIYZQ"
    aws_secret_access_key = "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"

    # get the connection of AWS S3 Bucket
    s3 = boto3.resource(
        's3',
        aws_access_key_id=aws_access_key_id,
        aws_secret_access_key=aws_secret_access_key,
        region_name=aws_region
    )

    object_acl = s3.ObjectAcl(bucket, key)
    try:
        response = object_acl.put(ACL='public-read' if public else 'private')
    except ClientError as e:
        job_alert_cto.delay(f"({WEB_SERVER_URL}) AWS/S3: issues changing ACL", "aws_s3_change_file_acl",
                            f"{e} - bucket: "
                            f"{bucket}, key: {key}")
        return False
    return True


def upload_file_to_aws_s3(url, path, filename, ACL='public-read', remove_after=False, alt_bucket=None):
    from lstv_api_v1.tasks.tasks import job_alert_cto
    aws_region = "us-east-2"
    aws_bucket_name = alt_bucket or DEFAULT_CDN_BUCKET_NAME
    aws_s3_endpoint = DEFAULT_CDN
    aws_access_key_id = "AKIAIQ4ZL5GC47JEIYZQ"
    aws_secret_access_key = "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"

    file_url = ''
    # get the connection of AWS S3 Bucket
    s3 = boto3.resource(
        's3',
        aws_access_key_id=aws_access_key_id,
        aws_secret_access_key=aws_secret_access_key,
        region_name=aws_region
    )

    remote_file = url.startswith('http://') or url.startswith('https://')
    if not alt_bucket:
        key = path + "/" + filename.lower()
    else:
        key = filename.lower()

    if remote_file:
        response = requests.get(url)
        if response.status_code == 200:
            raw_data = response.content
            url_parser = urlparse(url)
            # file_name = os.path.basename(url_parser.path)

            with open(filename, 'wb') as new_file:
                new_file.write(raw_data)
            new_file.close()

    try:
        # Open the server file as read mode and upload in AWS S3 Bucket.
        data = open(filename, 'rb')
        s3.Bucket(aws_bucket_name).put_object(Key=key, Body=data, ACL=ACL)
        data.close()
        # Format the return URL of upload file in S3 bucket
        file_url = '%s/%s' % (aws_s3_endpoint, key)
    except Exception as e:
        print(e)
        job_alert_cto.delay(f"({WEB_SERVER_URL}) AWS/S3: file upload issues", "upload_file_to_aws_s3", f"{e} - url: "
                                                                                                       f"{url}, path: {path}, "
                                                                                                       f"filename: {filename}, ACL: {ACL}")
    finally:
        # Close and remove file from Server
        if remove_after:
            os.remove(filename)
        return file_url


def aws_s3_does_object_exist(bucket, key):
    aws_region = "us-east-2"
    aws_access_key_id = "AKIAIQ4ZL5GC47JEIYZQ"
    aws_secret_access_key = "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"

    # get the connection of AWS S3 Bucket
    s3_client = boto3.client(
        's3',
        aws_access_key_id=aws_access_key_id,
        aws_secret_access_key=aws_secret_access_key,
        region_name=aws_region
    )
    try:
        s3_client.head_object(Bucket=bucket, Key=key)
        return True
    except ClientError:
        return False


