import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import * as Network from '../lib/network-stack';

test('Empty Stack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new Network.NetworkStack(app, 'MyTestStack');
    // THEN
    expectCDK(stack).to(matchTemplate({
      "Resources": {}
    }, MatchStyle.EXACT))
});
