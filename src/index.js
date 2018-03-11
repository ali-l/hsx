import Bond from './models/Bond'
import BondPage from './pages/BondPage'

// noinspection JSUnusedGlobalSymbols
export default ({ Records }, context, callback) => {
  try {
    Records.forEach(async streamRecord => {
      let record = streamRecord.dynamodb.NewImage;

      if (record) {
        let ticker = record.starBond.S;
        let bondPage = await BondPage.fromTicker(ticker);

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