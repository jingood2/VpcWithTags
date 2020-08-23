import * as cdk from '@aws-cdk/core';
import * as ec2 from '@aws-cdk/aws-ec2';
import { CfnParameter, CfnOutput, Token, TagManager, Fn, Tags, Tag } from '@aws-cdk/core';
import { SubnetProps, SubnetType, CfnNatGateway, CfnInternetGateway, CfnVPC, Vpc } from '@aws-cdk/aws-ec2';

var randomize = require('randomatic');
var camelcase = require('camelcase');

export interface MyEnvProps extends cdk.StackProps {
  prj: string,
  stage: string,
  svcCode?: string
}

export interface customSubnetProps extends SubnetProps {
  subnetType: ec2.SubnetType,
  serviceCode?: String,
  createNat?: boolean 
  
}

export interface VPCStackProps extends cdk.StackProps {
  vpcProps : ec2.CfnVPCProps,
  subnetProps? : customSubnetProps[]
  envProps? : MyEnvProps
}

export class VpcStack extends cdk.Stack {

  readonly vpc : CfnVPC;
  readonly pubSubnets? : ec2.SubnetConfiguration[];
  readonly natgw : CfnNatGateway;
  readonly igw : CfnInternetGateway;

  constructor(scope: cdk.Construct, id: string, props: VPCStackProps) {
    super(scope, id, props);

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
      allowedValues: ['10.1.0.0/16','10.192.0.0/16','192.168.0.0/16']
    });

    const prj: string = props.envProps?.prj || 'example' ;
    const stage: string = props.envProps?.stage || 'dev';
    const nat_gateways: any = this.node.tryGetContext(stage);

    // The code that defines your stack goes here
    this.vpc = new ec2.CfnVPC(this,"VPC"+randomize('0A',6),{
      cidrBlock: props.vpcProps.cidrBlock,
      enableDnsHostnames: true,
      enableDnsSupport: true,
      tags:[
        {"key": "Name","value": this.createTagName(prj,stage,'VPC',this.tags)}
      ]
    });

    Tag.add(this,"cz-stage",stage);

    new CfnOutput(this,"vpcid",{
      value: this.vpc.ref
    });

    // create VPC IntergateGateway
    //this.igw = this.createIGW(this.vpc);

    this.igw = new ec2.CfnInternetGateway(this,"IGW"+randomize('0A',6),{
      tags: [
        {"key": "Name","value":this.createTagName(prj,stage,"IGW",this.vpc.tags)}
      ]
    });

    new ec2.CfnVPCGatewayAttachment(this,"IGW_ASSOCIATE"+randomize('0A',6),{
      vpcId: this.vpc.ref,
      internetGatewayId: this.igw.ref
    });

    // create Subnets
    if(props.subnetProps != null && typeof props.subnetProps != "undefined") {
      for(let subProps of props.subnetProps) {

        // Subnet Naming Rule 
        // SNET-{ServiceId}-{Stage}-{SubnetType}-{AZIndex}
        var _subId = `${subProps.subnetType.substr(0,3)}-Subnet-${subProps.availabilityZone.substr(-1,1)}`;
        var _subnetId = new ec2.CfnSubnet(this,camelcase(_subId),{
          vpcId: this.vpc.ref,
          cidrBlock : subProps.cidrBlock,
          availabilityZone : subProps.availabilityZone,
          mapPublicIpOnLaunch: subProps.mapPublicIpOnLaunch,
          tags: [
            {"key": "Name","value": this.createTagName(prj,stage,"SNET",this.tags,subProps)}
          ]
        });

        new CfnOutput(this,this.createTagName(prj,stage,"SNET",this.tags,subProps),{
              value: _subnetId.ref
            });

        // create EIP for NAT Gateway
        if(subProps.subnetType == SubnetType.PUBLIC) {

          var _subId = this.createTagName(prj,stage,"EIP",this.tags,subProps);

          if(subProps.createNat != false) {
            var eip = new ec2.CfnEIP(this, "EIP"+randomize('0A',6),{
              domain: "vpc",
              tags:[{ "key": "Name", "value": this.createTagName(prj,stage,"EIP",this.tags,subProps)}]
            });

            eip.addDependsOn(this.igw);

            // create NAT Gateway
            this.natgw = new ec2.CfnNatGateway(this,"NatGW"+randomize('0A',6),{
              allocationId: eip.attrAllocationId,
              subnetId: _subnetId.ref,
              tags: [
                {"key": "Name","value": this.createTagName(prj,stage,"NATGW",this.tags,subProps)} 
              ]
            });
          }

          // RouteTable of Public Subnet
          var _publicRT = new ec2.CfnRouteTable(this,"RouteTable"+randomize('0A',6),{
            vpcId: this.vpc.ref,
            tags:[
              {"key": "Name","value": this.createTagName(prj,stage,"RT",this.tags,subProps)}
            ] 
          });

          // AssociateRouteTableToSubnet
          new ec2.CfnSubnetRouteTableAssociation(this, "RTAssociate"+randomize('0A',6),{
            routeTableId: _publicRT.ref,
            subnetId: _subnetId.ref
          });

          // Add Route All to NAT at Public RouteTable
          new ec2.CfnRoute(this, "Route"+randomize('0A',6),{
            routeTableId: _publicRT.ref,
            destinationCidrBlock:"0.0.0.0/0",
            gatewayId: this.igw.ref
          });

        }
        
        else if(subProps.subnetType == SubnetType.PRIVATE ) {

          // RouteTable of Private Subnet
          var _privateRT = new ec2.CfnRouteTable(this,"RouteTable"+randomize('0A',6),{
            vpcId: this.vpc.ref,
            tags:[
              {"key": "Name","value": this.createTagName(prj,stage,"RT",this.tags,subProps)}
            ] 
          });

          // AssociateRouteTableToSubnet
          new ec2.CfnSubnetRouteTableAssociation(this, "RTAssociate"+randomize('0A',6),{
            routeTableId: _privateRT.ref,
            subnetId: _subnetId.ref
          });

          // Add Route All to NAT at Private RouteTable
          var _privateRoute = new ec2.CfnRoute(this, "Route"+randomize('0A',6),{
            routeTableId: _privateRT.ref,
            destinationCidrBlock:"0.0.0.0/0",
            natGatewayId: this.natgw.ref
          });

        }
        else {
          //console.log(`SubnetType is ${subProps.subnetType} !!`);
          // RouteTable of Private Subnet
          /* var _isolateRT = new ec2.CfnRouteTable(this,`RT+${subProps.subnetType}+${subProps.availabilityZone.substr(-1,1)}`,{
            vpcId: vpc.ref,
            tags:[
              {"key": "Name","value": buildSubnetTagName(subProps,"RT")}
            ] 
          });

          // AssociateRouteTableToSubnet
          new ec2.CfnSubnetRouteTableAssociation(this, buildSubnetTagName(subProps,"RT_ASSOCIATE"),{
            routeTableId: _isolateRT.ref,
            subnetId: _subnetId.ref
          });
 */
        } 
      }
    }

  }

  private createTagName(prj:string, stage:string, name:string, tags: TagManager, props?: customSubnetProps ) {

    var _result: string;
    var _tags: string[] = [];

        // subnet tags
    if(props != undefined) {
      //for(var tag of tags.renderTags())
        _result = `${prj}-${stage}-${props.subnetType.substr(0,3)}-${name}-${props.availabilityZone.substr(-1,1)}`
    } else {
      //for(var tag of tags.renderTags())
        _result = `${prj}-${stage}-${name}`
    }
    return _result.toUpperCase()

  }


}

