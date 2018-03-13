import Bond from './models/Bond'

// noinspection JSUnusedGlobalSymbols
export default ({ Records }, context, callback) => {
  try {
    Records.forEach(async streamRecord => {
      let record = streamRecord.dynamodb.NewImage;

      if (record) {
        let ticker = record.starBond.S;
        Bond.find(ticker).save()
      } else {
        console.log('Record has no new image', streamRecord)
      }
    });

    callback(null)
  } catch (e) {
    callback(e)
  }
}