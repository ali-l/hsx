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
  static create(ticker, price, credits) {
    let item = {
      ticker: { S: ticker },
      price: { N: price.toString() },
      credits: { L: formatCredits(credits) },
      modifiedAt: { N: Date.now().toString() }
    };

    return new Promise((resolve, reject) => {
      Security.client.putItem({ Item: item }, (err, data) => {
        err ? reject(err) : resolve(data)
      })
    })
  }
}