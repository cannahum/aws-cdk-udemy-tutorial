import { Bucket, BucketEncryption } from '@aws-cdk/aws-s3';
import * as lambda from '@aws-cdk/aws-lambda-nodejs';
import * as cdk from '@aws-cdk/core';
import { Runtime } from '@aws-cdk/aws-lambda';
import * as path from 'path';
import { BucketDeployment, Source } from '@aws-cdk/aws-s3-deployment';
import { PolicyStatement } from '@aws-cdk/aws-iam';
import { CorsHttpMethod, HttpApi, HttpMethod } from '@aws-cdk/aws-apigatewayv2';
import { LambdaProxyIntegration } from '@aws-cdk/aws-apigatewayv2-integrations';
import { Distribution } from '@aws-cdk/aws-cloudfront';
import { S3Origin } from '@aws-cdk/aws-cloudfront-origins';
import { ARecord, IPublicHostedZone, RecordTarget } from '@aws-cdk/aws-route53';
import { ICertificate } from '@aws-cdk/aws-certificatemanager';
import { CloudFrontTarget } from '@aws-cdk/aws-route53-targets';

interface SimpleAppStackProps extends cdk.StackProps {
  hostedZone: IPublicHostedZone
  certificate: ICertificate
  dnsName: string
}

export class SimpleAppStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props: SimpleAppStackProps) {
    super(scope, id, props);

    const bucket = new Bucket(this, 'MySimpleAppBucket', {
      encryption: BucketEncryption.S3_MANAGED,
    });

    new BucketDeployment(this, 'MySimpleAppPhotos', {
      sources: [
        Source.asset(path.join(__dirname, '..', 'photos')),
      ],
      destinationBucket: bucket
    });

    const websiteBucket = new Bucket(this, 'MySimpleAppWebsiteBucket', {
      websiteIndexDocument: 'index.html',
      publicReadAccess: true,
    });

    const cloudFront = new Distribution(this, 'MySimpleAppDistribution', {
      defaultBehavior: { origin: new S3Origin(websiteBucket) },
      domainNames: [props?.dnsName],
      certificate: props.certificate,
    });

    new ARecord(this, 'MySimpleAppARecordApex', {
      zone: props.hostedZone,
      target: RecordTarget.fromAlias(new CloudFrontTarget(cloudFront)),
    });

    new BucketDeployment(this, 'MySimpleAppWebsiteDeploy', {
      sources: [
        Source.asset(path.join(__dirname, '..', 'frontend', 'build'))
      ],
      destinationBucket: websiteBucket,
      distribution: cloudFront,
    });

    const getPhotos = new lambda.NodejsFunction(this, 'MySimpleAppLambda', {
      runtime: Runtime.NODEJS_14_X,
      entry: path.join(__dirname, '..', 'api', 'get-photos', 'index.ts'),
      handler: 'getPhotos',
      environment: {
        PHOTO_BUCKET_NAME: bucket.bucketName,
      }
    });

    const bucketContainerPermissions = new PolicyStatement()
    bucketContainerPermissions.addResources(bucket.bucketArn);
    bucketContainerPermissions.addActions('s3:ListBucket');

    const bucketPermissions = new PolicyStatement();
    bucketPermissions.addResources(`${bucket.bucketArn}/*`);
    bucketPermissions.addActions('s3:GetObject', 's3:PutObject');

    getPhotos.addToRolePolicy(bucketPermissions);
    getPhotos.addToRolePolicy(bucketContainerPermissions);

    const httpApi = new HttpApi(this, 'MySimpleAppHttpApi', {
      corsPreflight: {
        allowOrigins: ['*'],
        allowMethods: [CorsHttpMethod.GET]
      },
      apiName: 'photo-api',
      createDefaultStage: true
    });

    const lambdaIntegration = new LambdaProxyIntegration({
      handler: getPhotos,
    });

    httpApi.addRoutes({
      path: '/getAllPhotos',
      methods: [
        HttpMethod.GET,
      ],
      integration: lambdaIntegration
    });

    new cdk.CfnOutput(this, 'MySimpleAppBucketNameExport', {
      value: bucket.bucketName,
      exportName: 'MySimpleAppBucketName',
    });

    new cdk.CfnOutput(this, 'MySimpleAppWebsiteUrl', {
      value: cloudFront.distributionDomainName,
      exportName: 'MySimpleAppUrl'
    });

    new cdk.CfnOutput(this, 'MySimpleAppApi', {
      value: httpApi.url!,
      exportName: 'MySimpleAppApiEndpoint',
    });

    new cdk.CfnOutput(this, 'MySimpleAppWebsiteBucketNameExport', {
      value: websiteBucket.bucketName,
      exportName: 'MySimpleAppWebsiteBucketName'
    });
  }
}
