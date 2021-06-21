import { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2, Context } from 'aws-lambda';
import { S3 } from 'aws-sdk';

const s3 = new S3();
const bucketName = process.env.PHOTO_BUCKET_NAME!;

async function generateUrl(object: S3.Object): Promise<{ filename: string, url: string }> {
    const url = await s3.getSignedUrlPromise('getObject', {
        Bucket: bucketName,
        Key: object.Key!,
        Expires: 24 * 60 * 60
    });
    return {
        filename: object.Key!,
        url,
    }
}

async function getPhotos(event: APIGatewayProxyEventV2, ctx: Context): Promise<APIGatewayProxyStructuredResultV2> {
    console.log('I got the bucket name and it is:', bucketName);
    try {
        const { Contents: results } = await s3.listObjects({ Bucket: bucketName }).promise();
        const photos = await Promise.all(results!.map(result => generateUrl(result)));
        return {
            statusCode: 200,
            body: JSON.stringify(photos),
        }
    } catch (error) {
        return {
            statusCode: 500,
            body: error.message,
        }
    }
}

async function getPhoto(event: APIGatewayProxyEventV2, ctx: Context): Promise<APIGatewayProxyStructuredResultV2> {
    console.log(event.pathParameters);
    const key = event.pathParameters!['photoName']!;
    try {
        const photo = await generateUrl({
            Key: key,
        });
        return {
            statusCode: 200,
            body: JSON.stringify(photo),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: error.message,
        }
    }
};

export { getPhotos, getPhoto };
