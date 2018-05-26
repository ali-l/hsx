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

const THREE_MONTHS = 7257600000; // Limited releases take ~ three months to get added to TAG
// Wide releases added to TAG on the 25th day after the release


export default class Bond {
  static async find(ticker) {
    let page = new BondPage(await fetch(BASE_URL + ticker));
    return new this(ticker, page.price, page.credits)
  }

  constructor(ticker, price, credits) {
    this.ticker = ticker;
    this.price = price;
    this.credits = credits
  }

  get stocksPotentiallyInCurrentTag() {
    return this.credits
      .filter(credit => credit.releaseDate && (credit.releaseDate + THREE_MONTHS) < Date.now())
      .slice(0, 5)
  }

  get stocksPotentiallyInFutureTag() {
    return this.credits
      .filter(credit => credit.releaseDate && (credit.releaseDate + THREE_MONTHS) > Date.now())
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