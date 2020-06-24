import * as cdk from '@aws-cdk/core';
import * as ec2 from '@aws-cdk/aws-ec2';
import { CfnParameter } from '@aws-cdk/core';

export interface VPCStackProps extends cdk.StackProps {
  vpcProps : ec2.CfnVPCProps,
  pubSubnets? : ec2.SubnetConfiguration[],
  priSubnets? : ec2.SubnetConfiguration[],
  isolateSubnets? : ec2.SubnetConfiguration[]
}

export class NetworkStack extends cdk.Stack {

  readonly pubSubnets? : ec2.SubnetConfiguration[];

  constructor(scope: cdk.Construct, id: string, props: VPCStackProps) {
    super(scope, id, props);

    this.pubSubnets = props.pubSubnets;

    const prefix = new CfnParameter(this,"prefix",{
      description: 'An environment name that is prefixed to resource names',
      type: 'String',
      default: 'dev',
      allowedValues: ['dev','stage','prod']
    });

    const vpcCIDR = new CfnParameter(this,"vpcCIDR",{
      description: "Please enter the IP range (CIDR notation) for this VPC",
      type: 'String',
      default: '10.1.0.0/16',
      allowedValues: ['10.1.0.0./16','10.192.0.0/16','192.168.0.0/16']
    });

    const pubSubCIDR1 = new CfnParameter(this,"pubSubCIDR1",{
      description: "Please enter the IP range (CIDR notation) for the public subnet in the first Availability Zone",
      type: 'String',
      default: '10.1.10.0/24',
      allowedValues: ['10.1.10.0./16','10.192.10.0/16','192.168.10.0/16']
    });
    const pubSubCIDR2 = new CfnParameter(this,"pubSubCIDR2",{
      description: "Please enter the IP range (CIDR notation) for the public subnet in the second Availability Zone",
      type: 'String',
      default: '10.1.11.0/24',
      allowedValues: ['10.1.11.0./24','10.192.11.0/24','192.168.11.0/24']
    });
    const priSubCIDR1 = new CfnParameter(this,"priSubCIDR1",{
      description: "Please enter the IP range (CIDR notation) for the private subnet in the first Availability Zone",
      type: 'String',
      default: '10.1.20.0/24',
      allowedValues: ['10.1.20.0./16','10.192.20.0/16','192.168.20.0/16']
    });
    const priSubCIDR2 = new CfnParameter(this,"priSubCIDR2",{
      description: "Please enter the IP range (CIDR notation) for the private subnet in the second Availability Zone",
      type: 'String',
      default: '10.1.21.0/24',
      allowedValues: ['10.1.21.0./24','10.192.21.0/24','192.168.21.0/24']
    });

    // The code that defines your stack goes here
    const vpc = new ec2.CfnVPC(this,id,{
      cidrBlock: vpcCIDR.valueAsString,
      enableDnsHostnames: true,
      enableDnsSupport: true,
      tags:[
        {"key": "Name","value": buildName('VPC')}
      ]
    });

    // create VPC IntergateGateway
    const igw = this.createIGW(this,vpc);


    function buildName(s:string) {
      return `${prefix}/${s}`;
    }
      
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

