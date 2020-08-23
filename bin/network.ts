#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { VpcStack } from '../lib/vpc-stack';
import { SubnetType, CfnVPCEndpoint } from '@aws-cdk/aws-ec2';
import { Tag, CfnParameter } from '@aws-cdk/core';
import { customTags } from '../lib/custom_resources/mandatory_tags';
import { VpcEndpointStack } from '../lib/vpc-endpoint-stack';

const app = new cdk.App();

const devVpc = new VpcStack(app, 'DevVpcStack',{
            env: {
                account: '234730403556', region: 'ap-northeast-2'
            },
            envProps: {
                prj: 'ATCL', stage: 'DEV'
            },
            vpcProps: {
                cidrBlock: '10.1.0.0/16'
            },
            subnetProps: [
                {
                    availabilityZone: "ap-northeast-2a",
                    cidrBlock: "10.1.20.0/24",
                    vpcId: "",
                    mapPublicIpOnLaunch: true,
                    subnetType: SubnetType.PUBLIC
                },
                {
                    availabilityZone: "ap-northeast-2c",
                    cidrBlock: "10.1.21.0/24",
                    vpcId: "",
                    mapPublicIpOnLaunch: true,
                    subnetType: SubnetType.PUBLIC,
                    createNat: false
                },
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
                    cidrBlock: "10.1.100.0/24",
                    vpcId: "",
                    mapPublicIpOnLaunch: false,
                    subnetType: SubnetType.ISOLATED
                },
                {
                    availabilityZone: "ap-northeast-2c",
                    cidrBlock: "10.1.101.0/24",
                    vpcId: "",
                    mapPublicIpOnLaunch: false,
                    subnetType: SubnetType.ISOLATED
                },
        
            ]
        });

        const prodVpc = new VpcStack(app, 'ProdVpcStack',{
            env: {
                account: '234730403556', region: 'ap-northeast-2'
            },
            envProps: {
                prj: 'ATCL', stage: 'PROD'
            },
            vpcProps: {
                cidrBlock: '10.2.0.0/16'
            },
            subnetProps: [
                {
                    availabilityZone: "ap-northeast-2a",
                    cidrBlock: "10.2.10.0/24",
                    vpcId: "",
                    mapPublicIpOnLaunch: true,
                    subnetType: SubnetType.PUBLIC
                },
                {
                    availabilityZone: "ap-northeast-2c",
                    cidrBlock: "10.2.11.0/24",
                    vpcId: "",
                    mapPublicIpOnLaunch: true,
                    subnetType: SubnetType.PUBLIC
                },
                {
                    availabilityZone: "ap-northeast-2a",
                    cidrBlock: "10.2.20.0/24",
                    vpcId: "",
                    mapPublicIpOnLaunch: false,
                    subnetType: SubnetType.PRIVATE
                },
                {
                    availabilityZone: "ap-northeast-2c",
                    cidrBlock: "10.2.21.0/24",
                    vpcId: "",
                    mapPublicIpOnLaunch: false,
                    subnetType: SubnetType.PRIVATE
                },
                {
                    availabilityZone: "ap-northeast-2a",
                    cidrBlock: "10.2.100.0/24",
                    vpcId: "",
                    mapPublicIpOnLaunch: false,
                    subnetType: SubnetType.ISOLATED
                },
                {
                    availabilityZone: "ap-northeast-2c",
                    cidrBlock: "10.2.101.0/24",
                    vpcId: "",
                    mapPublicIpOnLaunch: false,
                    subnetType: SubnetType.ISOLATED
                },
        
            ]
        });

// add EndPoint 
/* new VpcEndpointStack(app,"VpcEndpointStack",{ 
        vpc: vpc.vpc, 
        vpcEndpoints:[
            { serviceName: "",
              vpcId: vpc.vpc.ref,
              policyDocument: ""
            }
        ]
    });
 */// add VPN 


// add Trangit Gateway

cdk.Tag.add(app, "cz-project", "ATCL" );
cdk.Tag.add(app, "cz-owner", "ATCL CCOE");
//cdk.Tag.add(app, "cz-stage", "prod");
cdk.Tag.add(app, "cz-org", "Cloud Transformation Group" || ' ');
cdk.Tag.add(app, "cz-appl", ' ');
cdk.Tag.add(app, "cz-createdAt", new Date().toUTCString());



