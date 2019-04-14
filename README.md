# 概要
* webのスクリーンショットを撮るためのlambda

# 関連記事
https://qiita.com/junara/items/5563ad7ee133ce736ed0

## S3バケットを用意する

SAMでdeployするファイルをアップロードするバケットを用意します。

```bash
aws s3 mb s3://YOUR_NEW_BUCKET_NAME --region ap-northeast-1
```

## deployする

`YOUR_NEW_BUCKET_NAME` はご自分のバケット名に変更してください。

```bash
sam package \
    --template-file template.yaml \
    --output-template-file packaged.yaml \
    --s3-bucket YOUR_NEW_BUCKET_NAME

sam deploy \
    --template-file packaged.yaml \
    --stack-name sam-app \
    --capabilities CAPABILITY_IAM
```
