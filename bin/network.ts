#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { NetworkStack } from '../lib/network-stack';
import { SubnetType } from '@aws-cdk/aws-ec2';

const app = new cdk.App();
new NetworkStack(app, 'NetworkStack',{
    vpcProps: {
        cidrBlock: '10.1.0.0/16'
    },
    priSubnets: [{
        name: 'test',
        subnetType: SubnetType.PRIVATE,
        cidrMask: 24
    }],
    pubSubnets: [],
    isolateSubnets: []
});
