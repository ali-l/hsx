// noinspection ES6CheckImport
import DynamoDB from 'aws-sdk/clients/dynamodb';
import mapBondPage from '../mappers/mapBondPage'
import {fetch, BASE_URL} from '../utils'
import Stock from "./Stock";

const ONE_DAY = 86400000;
const THREE_MONTHS = 7257600000; // Limited releases take ~ three months to get added to TAG
// Wide releases added to TAG on the 25th day after the release

const client = new DynamoDB.DocumentClient({
  apiVersion: '2012-08-10',
  params: { TableName: 'hsx_securities' },
  region: 'us-east-1'
});

async function getFromSite(ticker) {
  return mapBondPage(await fetch(BASE_URL + ticker));
}

async function getFromDynamo(ticker) {
  return new Promise((resolve, reject) => {
    client.get({ Key: { ticker } }, (err, { Item }) => {
      err ? reject(err) : resolve(Item)
    })
  })
}

export default class Bond {
  static async find(ticker) {
    const dynamoAttributes = await getFromDynamo(ticker);

    if (dynamoAttributes && (Date.now() - dynamoAttributes.updatedAt) < ONE_DAY) {
      console.log('using ', ticker, ' from dynamo');

      return new this(dynamoAttributes)
    } else {
      console.log('fetching ', ticker, ' from site');
      const siteAttributes = await getFromSite(ticker);

      return new this({ ticker, ...siteAttributes });
    }
  }

  constructor({ ticker, price, credits, TAG, updatedAt }) {
    this.ticker = ticker;
    // noinspection JSUnusedGlobalSymbols
    this.price = price;
    this.credits = credits;
    // noinspection JSUnusedGlobalSymbols
    this.TAG = TAG;
    this.updatedAt = updatedAt || Date.now()
  }

  get creditsAffectingTAG() {
    return this._creditsPotentiallyInCurrentTAG().concat(this._creditsPotentiallyInFutureTAG())
  }

  _creditsPotentiallyInCurrentTAG() {
    return this.credits
      .filter(credit => credit.releaseDate && (credit.releaseDate + THREE_MONTHS) < Date.now())
      .slice(0, 5)
  }

  _creditsPotentiallyInFutureTAG() {
    return this.credits
      .filter(credit => credit.releaseDate && (credit.releaseDate + THREE_MONTHS) > Date.now())
  }

  async _stocksAffectingTAG() {
    let stocks = [];

    for (let { ticker } of this.creditsAffectingTAG) {
      let stock = await Stock.find(ticker);
      stocks.push(stock)
    }

    return stocks
  }

  async calculateCurrentTAG() {
    console.log('calculating TAG for ', this.ticker);

    let prices = [];
    let stocks = await this._stocksAffectingTAG();

    stocks =
      stocks
        .filter(stock => !stock.active)
        .sort((a, b) => a.delistDate < b.delistDate)
        .slice(0, 5);

    for (let stock of stocks) {
      console.log('including stock ', stock.ticker, ' at gross ', stock.gross);
      prices.push(stock.gross > 25000 ? 25000 : stock.gross)
    }

    let sum = prices.reduce((sum, val) => sum + val);
    let TAG = sum / (prices.length < 3 ? 3 : prices.length);

    // noinspection JSUnusedGlobalSymbols
    this.TAG = Math.round(TAG)
  }

  // calculateFutureTAG() {
  //
  // }

  // noinspection JSUnusedGlobalSymbols
  save() {
    return new Promise((resolve, reject) => {
      client.put({ Item: { ...this } }, (err, data) => {
        err ? reject(err) : resolve(data)
      })
    })
  }
}