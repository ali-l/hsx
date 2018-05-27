// noinspection ES6CheckImport
import DynamoDB from 'aws-sdk/clients/dynamodb';
import StockPage from '../pages/StockPage'
import {fetch, BASE_URL} from '../utils'

const client = new DynamoDB.DocumentClient({
  apiVersion: '2012-08-10',
  params: { TableName: 'hsx_securities' },
  region: 'us-east-1'
});

export default class Stock {
  static async find(ticker) {
    let page = new StockPage(await fetch(BASE_URL + ticker));
    let attributes = {
      ticker,
      price: page.price,
      gross: page.gross,
      active: page.active,
      delistDate: page.delistDate
    };

    client.put({Item: attributes}, (err, data) => {});

    return new this(attributes)
    // return new Promise((resolve, reject) => {
    //   Security.client.getItem({
    //     Key: { S: ticker },
    //     ConsistentRead: true
    //   }, (err, data) => {
    //     err ? reject(err) : resolve(data)
    //   })
    // })
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