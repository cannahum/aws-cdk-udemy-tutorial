import { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2, Context } from 'aws-lambda';

async function getPhotos(event: APIGatewayProxyEventV2, ctx: Context): Promise<APIGatewayProxyStructuredResultV2> {
    return {
        statusCode: 200,
        body: 'Hello from Lambda, it is live',
    };
}

export { getPhotos }