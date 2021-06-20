import * as cdk from '@aws-cdk/core';
import { IPublicHostedZone, PublicHostedZone } from '@aws-cdk/aws-route53';
import { DnsValidatedCertificate } from '@aws-cdk/aws-certificatemanager';
import { Certificate, CertificateValidation, ICertificate } from '@aws-cdk/aws-certificatemanager';

interface SimpleAppStackDnsProps extends cdk.StackProps {
    dnsName: string;
}

export class SimpleAppStackDns extends cdk.Stack {

    public readonly hostedZone: IPublicHostedZone;
    public readonly certificate: ICertificate;
    public readonly publicCertificate: ICertificate;

    constructor(scope: cdk.Construct, id: string, props: SimpleAppStackDnsProps) {
        super(scope, id, props);

        this.hostedZone = new PublicHostedZone(this, 'SimpleAppStackHostedZone', {
            zoneName: props.dnsName,
        });

        this.certificate = new Certificate(this, 'SimpleAppCertificateManager', {
            domainName: props.dnsName,
            validation: CertificateValidation.fromDns(this.hostedZone),
        });

        this.publicCertificate = Certificate.fromCertificateArn(
            this,
            'SimpleAppCrossRegionCertificateManager',
            'arn:aws:acm:us-east-1:502192330072:certificate/52254b15-4ce4-4a71-8fbc-7b7af277c84f',
        );
    }
}