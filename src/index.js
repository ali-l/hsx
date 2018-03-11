import {fetch} from './utils'
import Bond from './models/Bond'
import BondPage from './pages/BondPage'

// noinspection JSUnusedGlobalSymbols
export default ({ Records }, context, callback) => {
  const BASE_URL = 'https://www.hsx.com/security/view/';

  try {
    Records.forEach(async streamRecord => {
      let record = streamRecord.dynamodb.NewImage;

      if (record) {
        let ticker = record.starBond.S;
        let html = await fetch(BASE_URL + ticker);

        let bondPage = new BondPage(html);

        Bond.create(ticker, bondPage.price, bondPage.credits)
      } else {
        console.log('Record has no new image', streamRecord)
      }
    });

    callback(null)
  } catch (e) {
    callback(e)
  }
}