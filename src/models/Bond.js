import Security from './tables/Security'

export default class Bond {
  static create(ticker, price) {
    let item = {
      ticker: { S: ticker },
      price: { N: price.toString() },
      modifiedAt: { N: Date.now().toString() }
    };

    return new Promise((resolve, reject) => {
      Security.client.putItem({ Item: item }, (err, data) => {
        err ? reject(err) : resolve(data)
      })
    })
  }
}