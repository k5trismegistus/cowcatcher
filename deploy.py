import sys
import datetime
import os
import re
import boto3


s3client = boto3.client('s3')

def delete_all_keys_v2(bucket, prefix, dryrun=False):
    contents_count = 0
    next_token = ''

    while True:
        if next_token == '':
            response = s3client.list_objects_v2(Bucket=bucket, Prefix=prefix)
        else:
            response = s3client.list_objects_v2(Bucket=bucket, Prefix=prefix, ContinuationToken=next_token)

        if 'Contents' in response:
            contents = response['Contents']
            contents_count = contents_count + len(contents)
            for content in contents:
                s3client.delete_object(Bucket=bucket, Key=content['Key'])

        if 'NextContinuationToken' in response:
            next_token = response['NextContinuationToken']
        else:
            break

    print(contents_count)


def detect_content_type(key):
    if key.endswith('.html'):
        return 'text/html'
    if key.endswith('.png'):
        return 'image/png'
    if key.endswith('.jpg'):
        return 'image/jpeg'
    if key.endswith('.js'):
        return 'text/javascript'
    return ''

def upload_directory(path, bucket, prefix, exclude_suffixes=[]):
        for root, dirs, files in os.walk(path):
            for file in files:
                exclude = any([root.endswith(e) or file.endswith(e) for e in exclude_suffixes])
                if exclude:
                    continue
                new_root = re.sub(f'{path}\/?', '', root)
                key = f"{new_root}{'/' if new_root else ''}{file}"

                content_type = detect_content_type(key)
                if content_type:
                    print(content_type)
                    s3client.upload_file(os.path.join(root,file), bucket, f"{prefix}/{key}", ExtraArgs={"ContentType": content_type})
                else:
                    s3client.upload_file(os.path.join(root,file), bucket, f"{prefix}/{key}")


if __name__ == '__main__':
    prefix_new = datetime.datetime.now().strftime('%Y%m%d%H%M%S')

    bucket = 'tedder-frontend'
    prefix_current = 'current'
    delete_all_keys_v2(bucket, prefix_current)

    excludes = []
    upload_directory('dist', bucket, prefix_new, exclude_suffixes=excludes)
    upload_directory('dist', bucket, prefix_current, exclude_suffixes=excludes)

