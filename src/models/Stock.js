// noinspection ES6CheckImport
import DynamoDB from 'aws-sdk/clients/dynamodb';
import mapStockPage from '../mappers/mapStockPage'
import {fetch, BASE_URL} from '../utils'

const client = new DynamoDB.DocumentClient({
  apiVersion: '2012-08-10',
  params: { TableName: 'hsx_securities' },
  region: 'us-east-1'
});

const ONE_DAY = 86400000;

async function getFromDynamo(ticker) {
  return new Promise((resolve, reject) => {
    client.get({ Key: { ticker } }, (err, { Item }) => {
      err ? reject(err) : resolve(Item)
    })
  })
}

async function getFromSite(ticker) {
  return mapStockPage(await fetch(BASE_URL + ticker));
}

export default class Stock {
  static async find(ticker) {
    const dynamoRecord = await getFromDynamo(ticker);

    if (dynamoRecord && (Date.now() - dynamoRecord.updatedAt) < ONE_DAY) {
      console.log('using ', ticker, ' from dynamo');

      return new this(dynamoRecord)
    } else {
      console.log('fetching ', ticker, ' from site');

      const siteRecord = await getFromSite(ticker);
      client.put({ Item: { ticker, ...siteRecord, updatedAt: Date.now() } }, () => {});

      return new this({ ticker, ...siteRecord })
    }
  }

  constructor({ ticker, price, gross, active, delistDate }) {
    this.ticker = ticker;
    // noinspection JSUnusedGlobalSymbols
    this.price = price;
    this.gross = gross;
    // noinspection JSUnusedGlobalSymbols
    this.active = active;
    this.delistDate = delistDate
  }
}