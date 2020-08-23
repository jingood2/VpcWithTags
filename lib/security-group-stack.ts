
import { Construct, StackProps, Stack } from '@aws-cdk/core';
import { IVpc, ISecurityGroup, SecurityGroup, Port } from '@aws-cdk/aws-ec2';

export interface MyEnvProps extends StackProps {
    prj: string,
    stage: string,
    svcCode?: string
}

export interface VPCStackProps extends StackProps {
    vpc: IVpc,
    myEnv: MyEnvProps 
}

export class SecurityGroupStack extends Stack {

    // export security group here
    public readonly appSg: SecurityGroup;  

    constructor(scope: Construct, id: string, props: VPCStackProps) {
        super(scope, id, props);

        this.appSg = new SecurityGroup(this, "AppSg", {
            allowAllOutbound: true,
            vpc: props.vpc,
            securityGroupName: `${props.myEnv.prj}-${props.myEnv.stage}-${props.myEnv.svcCode}-sg`.toUpperCase(),
            description: "Application in Private Subnet Application Security Group"
        });

        this.appSg.addIngressRule(
            this.appSg,
            Port.tcp(22),
            "allow SSH"
          );
          this.appSg.addIngressRule(
            this.appSg,
            Port.tcp(8080),
            "allow 8080"
          );

    }
}