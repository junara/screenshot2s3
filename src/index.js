const chromium = require('chrome-aws-lambda');
const puppeteer = require('puppeteer-core');
const aws = require('aws-sdk');
const s3 = new aws.S3();
const bucket = 'XXXXXXXXXXXXX';
const crypto = require('crypto');

exports.handler = async (event, context) => {
  const query = event.queryStringParameters;
  const displaySize = {
    pc: {width: 1024, height: 1024},
    iPhoneX: {width: 375, height: 812},
    iPad: {width: 768, height: 1024}
  };
  const devise = displaySize['pc'];

  const url = query.url;
  let browser = null;
  await chromium.font('https://rawcdn.githack.com/googlei18n/noto-cjk/cf29231ab8029678af4bbc1a9480e2b296a5b2d3/NotoSansCJKhk-Regular.otf');

  try {
    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath,
      headless: chromium.headless,
    });

    let page = await browser.newPage();

    await page.goto(url);
    page.setViewport({width: devise.width, height: devise.height})
    const screenshot = await page.screenshot();
    const filename = randomFilename(screenshot);
    let params = {Bucket: bucket, Key: filename, Body: screenshot};
    await s3.putObject(params).promise();
    const download_params = {Bucket: bucket, Key: filename, Expires: 86400};
    const download_url = s3.getSignedUrl('getObject', download_params);
    return ({
      "statusCode": 200,
      "body": JSON.stringify({download_url: download_url})
    })
  } catch (error) {
    return context.fail(error);
  } finally {
    if (browser !== null) {
      await browser.close();
    }
  }
};

const randomFilename = (data) => {
  const sha256 = crypto.createHash('sha256');
  sha256.update(data);
  return sha256.digest('hex') + '.png'
}