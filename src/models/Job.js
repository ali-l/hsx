// noinspection ES6CheckImport
import DynamoDB from 'aws-sdk/clients/dynamodb'
import {unixTimestamp} from '../utils'

const client = new DynamoDB.DocumentClient({
  apiVersion: '2012-08-10',
  params: { TableName: 'hsx_jobs' },
  region: 'us-east-1'
});

function mapStreamRecord(streamRecord) {
  return {
    id: streamRecord.id.N,
    type: streamRecord.type.S,
    ticker: streamRecord.ticker && streamRecord.ticker.S,
    tickerList: streamRecord.tickerList &&
    (streamRecord.tickerList.SS || streamRecord.tickerList.S && JSON.parse(streamRecord.tickerList.S))
  }
}

export default class Job {
  // noinspection JSUnusedGlobalSymbols
  static create(attributes) {
    const job = new Job(attributes);

    job.save();

    return job
  }

  static fromStreamRecord(streamRecord) {
    return new Job(mapStreamRecord(streamRecord))
  }

  constructor({ id, type, ticker, tickerList }) {
    // noinspection JSUnusedGlobalSymbols
    this.id = id || Math.round(Math.random() * 1000);
    this.ticker = ticker;
    // noinspection JSUnusedGlobalSymbols
    this.tickerList = tickerList;
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