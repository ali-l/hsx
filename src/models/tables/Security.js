import DynamoDB from 'aws-sdk/clients/dynamodb';

export default class Security {
  static client = new DynamoDB({
    apiVersion: '2012-08-10',
    params: {TableName: 'hsx_securities'},
    region: 'us-east-1'
  })
}