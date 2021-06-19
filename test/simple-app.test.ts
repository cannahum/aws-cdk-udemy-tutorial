import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import * as SimpleApp from '../lib/simple-app-stack';

test('Empty Stack', () => {
  const app = new cdk.App();
  // WHEN
  const stack = new SimpleApp.SimpleAppStack(app, 'MyTestStack');
  // THEN
  expectCDK(stack).to(matchTemplate({
    "Resources": {
      "MySimpleAppBucket6B59014A": {
        "Type": "AWS::S3::Bucket",
        "Properties": {
          "BucketEncryption": {
            "ServerSideEncryptionConfiguration": [
              {
                "ServerSideEncryptionByDefault": {
                  "SSEAlgorithm": "AES256"
                }
              }
            ]
          }
        },
        "UpdateReplacePolicy": "Retain",
        "DeletionPolicy": "Retain",
      },
    },
    "Outputs": {
      "MySimpleAppBucketNameExport": {
        "Value": {
          "Ref": "MySimpleAppBucket6B59014A"
        },
        "Export": {
          "Name": "MySimpleAppBucketName"
        }
      }
    },
  }, MatchStyle.EXACT))
});
