import * as cdk from '@aws-cdk/core';
import { TagManagerOptions, CfnParameter, Tag } from '@aws-cdk/core';


export interface CustomTagProps extends  TagManagerOptions {}

export class customTags extends cdk.Construct implements cdk.ITaggable {

    tags: cdk.TagManager;

    constructor(scope: cdk.Construct, id: string, prop?: cdk.StackProps) {
        super(scope,id);

        this.tags = new cdk.TagManager(cdk.TagType.KEY_VALUE, 'MandatoryTagManager');

          /*
         new CfnParameter(this,"costCenter",{
            type: 'String',
            default: '73050',
            description: 'An environment name that is prefixed to resource names',
            allowedValues: ['73050','73070','73060']
          });

        const environment = new CfnParameter(this,"Environment",{
            type: 'String',
            default: 'DEV',
            description: 'An environment name that is prefixed to resource names',
            allowedValues: ['DEV','STG','POC','PRD']
          });

        const serviceName = new CfnParameter(this,"ServiceName",{
            description: 'An environment name that is prefixed to resource names',
            type: 'String'
          });

        const department = new CfnParameter(this,"Department",{
            description: 'An environment name that is prefixed to resource names',
            type: 'String',
            allowedValues: ['Finance','Development','Operation','Sales']
          }); */
          


    }

    prepare() {

        Tag.add(this,"costCenter", '73050');
        Tag.add(this,"Environment", 'DEV');
        Tag.add(this,"CreateAt", new Date().toUTCString());
        

        let myTags = this.tags.renderTags().map((tag: any) => {
            console.log( '"' + tag.Key + ":" + tag.Value + '"' );
        });


    }

}