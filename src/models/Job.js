// noinspection ES6CheckImport
import DynamoDB from 'aws-sdk/clients/dynamodb';

const client = new DynamoDB.DocumentClient({
  apiVersion: '2012-08-10',
  params: { TableName: 'hsx_jobs' },
  region: 'us-east-1'
});

function unixTimestamp() {
  return Math.round(Date.now() / 1000)
}

function mapStreamRecord(streamRecord) {
  return {
    ticker: streamRecord.ticker.S,
    type: streamRecord.type.S
  }
}

export default class Job {
  // noinspection JSUnusedGlobalSymbols
  static create(attributes) {
    const job = new Job(attributes);

    job.save();

    return job;
  }

  static fromStreamRecord(streamRecord) {
    return new Job(mapStreamRecord(streamRecord))
  }

  constructor({ ticker, type }) {
    this.ticker = ticker;
    // noinspection JSUnusedGlobalSymbols
    this.type = type
  }

  // noinspection JSUnusedGlobalSymbols
  save() {
    return new Promise((resolve, reject) => {
      client.put({ Item: { ...this, expireAt: unixTimestamp() } }, (err, data) => {
        err ? reject(err) : resolve(data)
      })
    })
  }
}