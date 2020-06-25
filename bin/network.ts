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
    subnetProps: [
        {
            availabilityZone: "ap-northeast-2a",
            cidrBlock: "10.1.10.0/24",
            vpcId: "",
            mapPublicIpOnLaunch: false,
            subnetType: SubnetType.PRIVATE
        },
        {
            availabilityZone: "ap-northeast-2c",
            cidrBlock: "10.1.11.0/24",
            vpcId: "",
            mapPublicIpOnLaunch: false,
            subnetType: SubnetType.PRIVATE
        },
        {
            availabilityZone: "ap-northeast-2a",
            cidrBlock: "10.1.20.0/24",
            vpcId: "",
            mapPublicIpOnLaunch: false,
            subnetType: SubnetType.PUBLIC
        },
        {
            availabilityZone: "ap-northeast-2c",
            cidrBlock: "10.1.21.0/24",
            vpcId: "",
            mapPublicIpOnLaunch: false,
            subnetType: SubnetType.PUBLIC
        },
    ]
});
