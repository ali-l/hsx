import Security from './tables/Security'

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