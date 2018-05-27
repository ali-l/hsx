// noinspection ES6CheckImport
import DynamoDB from 'aws-sdk/clients/dynamodb';
import BondPage from '../pages/BondPage'
import {fetch, BASE_URL} from '../utils'
import Stock from "./Stock";

const THREE_MONTHS = 7257600000; // Limited releases take ~ three months to get added to TAG
// Wide releases added to TAG on the 25th day after the release

const client = new DynamoDB.DocumentClient({
  apiVersion: '2012-08-10',
  params: { TableName: 'hsx_securities' },
  region: 'us-east-1'
});

export default class Bond {
  static async find(ticker) {
    let page = new BondPage(await fetch(BASE_URL + ticker));
    return new this(ticker, page.price, page.credits)
  }

  constructor(ticker, price, credits) {
    this.ticker = ticker;
    this.price = price;
    this.credits = credits;
    this.TAG = null
  }

  get creditsPotentiallyInCurrentTAG() {
    return this.credits
      .filter(credit => credit.releaseDate && (credit.releaseDate + THREE_MONTHS) < Date.now())
      .slice(0, 5)
  }

  get creditsPotentiallyInFutureTAG() {
    return this.credits
      .filter(credit => credit.releaseDate && (credit.releaseDate + THREE_MONTHS) > Date.now())
  }

  async calculateCurrentTAG() {
    console.log('calculating TAG for ', this.ticker);

    let prices = [];

    for (let { ticker } of this.creditsPotentiallyInCurrentTAG) {
      let stock = await Stock.find(ticker);
      prices.push(stock.price > 25000 ? 25000 : stock.price)
    }

    let sum = prices.reduce((sum, val) => sum + val);

    this.TAG = sum / (prices.length < 3 ? 3 : prices.length)
  }

  // calculateFutureTAG() {
  //
  // }

  save() {
    const item = { ticker: this.ticker, price: this.price, credits: this.credits, TAG: this.TAG };

    return new Promise((resolve, reject) => {
      client.put({ Item: item }, (err, data) => {
        err ? reject(err) : resolve(data)
      })
    })
  }
}