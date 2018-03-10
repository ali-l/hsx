import {fetch} from './utils'

// noinspection JSUnusedGlobalSymbols
export default ({ Records }, context, callback) => {
  const BASE_URL = 'https://www.hsx.com/security/view/';

  try {
    Records.forEach(async streamRecord => {
      let record = streamRecord.dynamodb.NewImage;

      if (record) {
        let bond = record.starBond.S;
        let html = await fetch(BASE_URL + bond);
        console.log(bond);
        console.log(html)
      } else {
        console.log('Record has no new image', streamRecord)
      }
    });

    callback(null)
  } catch (e) {
    callback(e)
  }
}