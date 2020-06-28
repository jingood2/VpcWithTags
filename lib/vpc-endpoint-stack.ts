import * as cdk from '@aws-cdk/core';
import * as ec2 from '@aws-cdk/aws-ec2';
import { CfnVPCEndpointProps, CfnVPCEndpoint } from '@aws-cdk/aws-ec2';
import { Fn } from '@aws-cdk/core';


export interface VPCStackProps extends cdk.StackProps {
    vpc: ec2.CfnVPC,
    vpcEndpoints: CfnVPCEndpointProps[]
  }


export class VpcEndpointStack extends cdk.Stack {

    constructor(scope: cdk.Construct, id: string, props: VPCStackProps) {
        super(scope,id,props);

      //  new CfnVPCEndpoint(scope,"CustomVPCEndpoint",props.vpcEndpoints[0]);
         for(let prop of props.vpcEndpoints) {
            //new CfnVPCEndpoint(scope,"CustomVPCEndpoint",prop);
            console.log(Fn.refAll('AWS::EC2::VPCEndpoint.ServiceName'));

        }

    }


    /* public createTagName(name:string, tags: TagManager, props?: customSubnetProps ) {

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
 */
}