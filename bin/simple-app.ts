#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { SimpleAppStack } from '../lib/simple-app-stack';
import { SimpleAppStackDns } from '../lib/simple-app-stack-dns';

const domainNameApex = 'jnahum.com';
const app = new cdk.App();
const { hostedZone, publicCertificate } = new SimpleAppStackDns(app, 'SimpleAppStackDns', {
    dnsName: domainNameApex,
});

new SimpleAppStack(app, 'SimpleAppStack', {
    hostedZone,
    certificate: publicCertificate,
    dnsName: domainNameApex
});
