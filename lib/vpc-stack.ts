import * as cdk from '@aws-cdk/core';
import * as ec2 from '@aws-cdk/aws-ec2';
import { CfnParameter, CfnOutput, Token, TagManager, Fn } from '@aws-cdk/core';
import { SubnetProps, SubnetType, CfnNatGateway, CfnInternetGateway, CfnVPC, Vpc } from '@aws-cdk/aws-ec2';

export interface customSubnetProps extends SubnetProps {
  subnetType: ec2.SubnetType,
  serviceCode?: String
}

export interface VPCStackProps extends cdk.StackProps {
  vpcProps : ec2.CfnVPCProps,
  subnetProps? : customSubnetProps[]
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

    /*
    const pubSubCIDR1 = new CfnParameter(this,"pubSubCIDR1",{
      description: "Please enter the IP range (CIDR notation) for the public subnet in the first Availability Zone",
      type: 'String',
      default: '10.1.10.0/24',
      allowedValues: ['10.1.10.0/24','10.192.10.0/24','192.168.10.0/24']
    });
    const pubSubCIDR2 = new CfnParameter(this,"pubSubCIDR2",{
      description: "Please enter the IP range (CIDR notation) for the public subnet in the second Availability Zone",
      type: 'String',
      default: '10.1.11.0/24',
      allowedValues: ['10.1.11.0/24','10.192.11.0/24','192.168.11.0/24']
    });
    const priSubCIDR1 = new CfnParameter(this,"priSubCIDR1",{
      description: "Please enter the IP range (CIDR notation) for the private subnet in the first Availability Zone",
      type: 'String',
      default: '10.1.20.0/24',
      allowedValues: ['10.1.20.0/24','10.192.20.0/24','192.168.20.0/24']
    });
    const priSubCIDR2 = new CfnParameter(this,"priSubCIDR2",{
      description: "Please enter the IP range (CIDR notation) for the private subnet in the second Availability Zone",
      type: 'String',
      default: '10.1.21.0/24',
      allowedValues: ['10.1.21.0/24','10.192.21.0/24','192.168.21.0/24']
    });
 */
   
    const tierCnt : number = 2;
    let tierIdx = 1;

    const arrAZ = this.node.tryGetContext('AZs');

/*     for( tierIdx = 1; tierIdx <= tierCnt; tierIdx++) {
      for(let az of arrAZ) {
        let subId = `sub-${tierIdx}-${az}`;
        console.log(subId);
        new CfnParameter(this,subId,{
          description: `Please enter the IP range (CIDR notation) for the private subnet in ${az}`,
          type: 'String',
          default: '10.1.21.0/24',
          allowedValues: ['10.1.21.0/24','10.192.21.0/24','192.168.21.0/24']
        });

      }
    }
 */
    // The code that defines your stack goes here
    this.vpc = new ec2.CfnVPC(this,id,{
      cidrBlock: vpcCIDR.valueAsString,
      enableDnsHostnames: true,
      enableDnsSupport: true,
      tags:[
        {"key": "Name","value": this.createTagName('VPC',this.tags)}
      ]
    });

    new CfnOutput(this,"vpcid",{
      value: this.vpc.ref
    });

    // create VPC IntergateGateway
    this.igw = this.createIGW(this.vpc);

    // create Subnets
    if(props.subnetProps != null && typeof props.subnetProps != "undefined") {
      for(let subProps of props.subnetProps) {

        // Subnet Naming Rule 
        // SNET-{ServiceId}-{Stage}-{SubnetType}-{AZIndex}
        var _subId = `SNET-${subProps.subnetType}-${subProps.availabilityZone.substr(-1,1)}`;
        var _subnetId = new ec2.CfnSubnet(this,_subId.toUpperCase(),{
          vpcId: this.vpc.ref,
          cidrBlock : subProps.cidrBlock,
          availabilityZone : subProps.availabilityZone,
          mapPublicIpOnLaunch: subProps.mapPublicIpOnLaunch,
          tags: [
            {"key": "Name","value": this.createTagName("SNET",this.tags,subProps)}
          ]
        });

        new CfnOutput(this,this.createTagName("SNET",this.tags,subProps),{
              value: _subnetId.ref
            });

        // create EIP for NAT Gateway
        if(subProps.subnetType == SubnetType.PUBLIC) {

          var _subId = `EIP-${subProps.availabilityZone}-${subProps.availabilityZone.substr(-1,1)}`;

          var eip = new ec2.CfnEIP(this, _subId,{
            domain: "vpc",
            tags:[{ "key": "Name", "value": this.createTagName("EIP",this.tags,subProps)}]
          });

          eip.addDependsOn(this.igw);

          // create NAT Gateway
          this.natgw = new ec2.CfnNatGateway(this,this.createTagName("NAT",this.tags,subProps),{
            allocationId: eip.attrAllocationId,
            subnetId: _subnetId.ref,
            tags: [
              {"key": "Name","value": this.createTagName("NAT",this.tags,subProps)} 
            ]
          });

          // RouteTable of Public Subnet
          var _publicRT = new ec2.CfnRouteTable(this,this.createTagName("RT",this.tags,subProps),{
            vpcId: this.vpc.ref,
            tags:[
              {"key": "Name","value": this.createTagName("RT",this.tags,subProps)}
            ] 
          });

          // AssociateRouteTableToSubnet
          new ec2.CfnSubnetRouteTableAssociation(this, this.createTagName("RT_ASSOCIATE",this.tags,subProps),{
            routeTableId: _publicRT.ref,
            subnetId: _subnetId.ref
          });

          // Add Route All to NAT at Public RouteTable
          new ec2.CfnRoute(this, this.createTagName("ROUTE",this.tags,subProps),{
            routeTableId: _publicRT.ref,
            destinationCidrBlock:"0.0.0.0/0",
            gatewayId: this.igw.ref
          });

        }
        
        else if(subProps.subnetType == SubnetType.PRIVATE ) {

          // RouteTable of Private Subnet
          var _privateRT = new ec2.CfnRouteTable(this,this.createTagName("RT",this.tags,subProps),{
            vpcId: this.vpc.ref,
            tags:[
              {"key": "Name","value": buildSubnetTagName(subProps,"RT")}
            ] 
          });

          // AssociateRouteTableToSubnet
          new ec2.CfnSubnetRouteTableAssociation(this, this.createTagName("RT_ASSOCIATE",this.tags,subProps),{
            routeTableId: _privateRT.ref,
            subnetId: _subnetId.ref
          });

          // Add Route All to NAT at Private RouteTable
          var _privateRoute = new ec2.CfnRoute(this, this.createTagName("ROUTE",this.tags,subProps),{
            routeTableId: _privateRT.ref,
            destinationCidrBlock:"0.0.0.0/0",
            natGatewayId: this.natgw.ref
          });

        }
        else {
          console.log(`SubnetType is ${subProps.subnetType} !!`);
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

    function buildSubnetTagName(props: customSubnetProps, name:string) {

      // {ConstructNmae}-{ServiceId}-{Environment}-{SubnetType}-{AZIndex}
      var result: string;
      result = `${name}-${props.subnetType}-${props.availabilityZone.substr(-1,1)}`
      return result.toUpperCase()
    }

    

    function buildName(s:string) {
      var result = `${s}`;
      return result.toUpperCase();
    }
      
  }

  private createIGW(vpc: ec2.CfnVPC): ec2.CfnInternetGateway {

    let igw = new ec2.CfnInternetGateway(this,this.createTagName("IGW",this.tags),{
      tags: [
        {"key": "Name","value":this.createTagName("IGW",vpc.tags)}
      ]
    });

    let igw_attachement = new ec2.CfnVPCGatewayAttachment(this,this.createTagName("IGW_ASSOCIATE",this.tags),{
      vpcId: vpc.ref,
      internetGatewayId: igw.ref
    });

    return igw;
  }

  public createTagName(name:string, tags: TagManager, props?: customSubnetProps ) {

    var _result: string;

    var _environment: string = 'DEV';

    var _tags: string[] = [];

    for(let tagObj of tags.renderTags()) {
      if(tagObj['key'] == 'Environment' && tagObj['value'] != undefined ) {
        _environment = tagObj['value'];
      }

    }

    // subnet tags
    if(props != undefined) {
      //for(var tag of tags.renderTags())
        _result = `${name}-${_environment}-${props.subnetType.substr(0,3)}-${props.availabilityZone.substr(-1,1)}`
    } else {
      //for(var tag of tags.renderTags())
        _result = `${name}-${_environment}`
    }

    return _result.toUpperCase()

  }


}

