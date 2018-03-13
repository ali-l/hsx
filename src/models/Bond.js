import Security from './tables/Security'
import BondPage from '../pages/BondPage'
import {fetch, BASE_URL} from '../utils'

const formatCredits = (credits) => {
  return credits.map(credit => {
    return {
      M: {
        ticker: { S: credit.ticker },
        releaseDate: credit.releaseDate ? { N: credit.releaseDate.toString() } : { NULL: true }
      }
    }
  })
};

export default class Bond {
  static async find(ticker) {
    let page = BondPage.new(await fetch(BASE_URL + ticker));
    new this(ticker, page.price, page.credits)
  }

  constructor(ticker, price, credits) {
    this.ticker = ticker;
    this.price = price;
    this.credits = credits
  }

  save() {
    let item = {
      ticker: { S: this.ticker },
      price: { N: this.price.toString() },
      credits: { L: formatCredits(this.credits) }
    };

    return new Promise((resolve, reject) => {
      Security.client.putItem({ Item: item }, (err, data) => {
        err ? reject(err) : resolve(data)
      })
    })
  }
}