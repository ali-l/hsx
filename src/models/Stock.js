import StockPage from '../pages/StockPage'
import {fetch, BASE_URL} from '../utils'

export default class Stock {
  static async find(ticker) {
    let page = new StockPage(await fetch(BASE_URL + ticker));
    return new this(ticker, page.price)
    // return new Promise((resolve, reject) => {
    //   Security.client.getItem({
    //     Key: { S: ticker },
    //     ConsistentRead: true
    //   }, (err, data) => {
    //     err ? reject(err) : resolve(data)
    //   })
    // })
  }

  constructor(ticker, price) {
    this.ticker = ticker;
    this.price = price
  }
}