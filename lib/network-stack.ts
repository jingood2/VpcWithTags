import * as cdk from '@aws-cdk/core';
import * as ec2 from '@aws-cdk/aws-ec2';

export interface VPCStackProps extends cdk.StackProps {
  vpcProps : ec2.CfnVPCProps;
}

export class NetworkStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props: VPCStackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here
    const vpc = new ec2.CfnVPC(this,id,{
      cidrBlock: props.vpcProps.cidrBlock,
      enableDnsHostnames: true,
      enableDnsSupport: true,
      tags:[
        {"key": "Name","value":id}
      ]
    });

    // create VPC IntergateGateway
    const igw = this.createIGW(this,vpc);
    
    // first createSubnets
    // input value, desiredLayerCnts, desiredAzCnt, region, cidrMask
    const subnetGroup = new SubnetGroup(this,vpc,{
      desiredLayers: 2,
      desiredAzs: 2,
      region: 'ap-northeast-2',
      privateEnabled: true,
      cidrMask: 24
    });

    subnetGroup.createSubnets(this);
  
      
  }

  private createIGW(scope: cdk.Construct,vpc: ec2.CfnVPC): ec2.CfnInternetGateway {

    let igw = new ec2.CfnInternetGateway(this,"igw",{
      tags: [
        {"key": "Name","value":"igw"}
      ]
    });

    let igw_attachement = new ec2.CfnVPCGatewayAttachment(this,"igw_attachement",{
      vpcId: vpc.ref,
      internetGatewayId: igw.ref
    });

    return igw;
  }

}

export interface SubnetGroupProps {
  desiredLayers: number,
  desiredAzs: number,
  region: string,
  privateEnabled: boolean,
  cidrMask: number
}

export class SubnetGroup {
  readonly _privateSubnets: string[];
  readonly _publicSubnets: string[];
  readonly _cidrMask: number ;
  readonly _desiredLayers: number ;
  readonly _desiredAzs: number ;
  readonly _region: string ;
  readonly _reservedAzs: number = 5;
  readonly _reservedLayers: number = 3;

  constructor(scope: cdk.Construct,vpc: ec2.CfnVPC, props: SubnetGroupProps) {

  }

  private get

  public createSubnets(scope: cdk.Construct) {

    for(let i=1; i<= this._desiredLayers;i++)

  }
}
