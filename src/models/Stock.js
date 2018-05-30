// noinspection ES6CheckImport
import DynamoDB from 'aws-sdk/clients/dynamodb';
import mapStockPage from '../mappers/mapStockPage'
import {fetch, BASE_URL} from '../utils'

const client = new DynamoDB.DocumentClient({
  apiVersion: '2012-08-10',
  params: { TableName: 'hsx_securities' },
  region: 'us-east-1'
});

const ONE_DAY_AGO = Date.now() - 86400000;
const SIX_MONTHS_AGO = Date.now() - 15552000000;

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
    const dynamoAttributes = await getFromDynamo(ticker);

    let stock = dynamoAttributes && new this(dynamoAttributes);

    if (!stock || stock._shouldRefresh()) {
      console.log('fetching ', ticker, ' from site');

      const siteAttributes = await getFromSite(ticker);
      stock = new this({ ticker, ...siteAttributes });
      stock.save()
    } else {
      console.log('using ', ticker, ' from dynamo');
    }

    return stock
  }

  constructor({ ticker, price, gross, active, delistDate, updatedAt }) {
    this.ticker = ticker;
    // noinspection JSUnusedGlobalSymbols
    this.price = price;
    this.gross = gross;
    // noinspection JSUnusedGlobalSymbols
    this.active = active;
    this.delistDate = delistDate;
    this.updatedAt = updatedAt || Date.now()
  }

  _shouldRefresh() {
    return this.delistDate < SIX_MONTHS_AGO ? false : this.updatedAt < ONE_DAY_AGO
  }

  save() {
    return new Promise((resolve, reject) => {
      client.put({ Item: { ...this } }, (err, data) => {
        err ? reject(err) : resolve(data)
      })
    })
  }
}