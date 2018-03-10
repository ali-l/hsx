import Security from './tables/Security'
import {unixTime} from "../utils";

export default class Bond {
  static create(ticker, price) {
    let item = {
      ticker: { S: ticker },
      price: { N: (price * 100).toString() },
      modifiedAt: { N: unixTime().toString() }
    };

    return new Promise((resolve, reject) => {
      Security.client.putItem({ Item: item }, (err, data) => {
        err ? reject(err) : resolve(data)
      })
    })
  }
}