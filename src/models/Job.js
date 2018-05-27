// noinspection ES6CheckImport
import DynamoDB from 'aws-sdk/clients/dynamodb';

const client = new DynamoDB.DocumentClient({
  apiVersion: '2012-08-10',
  params: { TableName: 'hsx_jobs' },
  region: 'us-east-1'
});

export default class Job {
  // noinspection JSUnusedGlobalSymbols
  static create({ ticker }) {
    return new Promise((resolve, reject) => {
      // noinspection JSUnusedLocalSymbols
      client.put({ Item: { ticker } }, (err, _data) => {
        err ? reject(err) : resolve(new Job({ ticker }))
      })
    })
  }

  static fromStreamRecord(streamRecord) {
    return new Job({ ticker: streamRecord.ticker.S })
  }

  constructor({ ticker }) {
    this.ticker = ticker;
  }
}