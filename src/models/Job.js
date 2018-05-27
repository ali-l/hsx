// noinspection ES6CheckImport
import DynamoDB from 'aws-sdk/clients/dynamodb';

const client = new DynamoDB.DocumentClient({
  apiVersion: '2012-08-10',
  params: { TableName: 'hsx_jobs' },
  region: 'us-east-1'
});

export default class Job {
  static create({ ticker, type, fetchStocks }) {
    return new Promise((resolve, reject) => {
      // noinspection JSUnusedLocalSymbols
      client.put({ Item: { ticker, type, fetchStocks } }, (err, _data) => {
        err ? reject(err) : resolve(new Job({ticker, type, fetchStocks}))
      })
    })
  }

  static fromStreamRecord(streamRecord) {
    const ticker = streamRecord.ticker.S;
    const type = streamRecord.type.S;
    const fetchStocks = streamRecord.fetchStocks && streamRecord.fetchStocks.BOOL;

    return new Job({ticker, type, fetchStocks})
  }

  constructor({ticker, type, fetchStocks}) {
    this.ticker = ticker;
    this.type = type;
    this.fetchStocks = fetchStocks
  }
}