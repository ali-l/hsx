import {fetch} from './utils'
import cheerio from 'cheerio'
import Bond from './models/Bond'

// noinspection JSUnusedGlobalSymbols
export default ({ Records }, context, callback) => {
  const BASE_URL = 'https://www.hsx.com/security/view/';
  const priceRegex = /H\$(\d{1,3})\.(\d{2})H\$/;

  try {
    Records.forEach(async streamRecord => {
      let record = streamRecord.dynamodb.NewImage;

      if (record) {
        let bond = record.starBond.S;
        let html = await fetch(BASE_URL + bond);
        let $ = cheerio.load(html);

        // noinspection JSJQueryEfficiency
        let priceString = $('#container > div.column-row > div.four.columns.last > div:nth-child(2) > div > p.value').text();

        // noinspection JSCheckFunctionSignatures
        let price = Number.parseInt(
          priceRegex.exec(priceString)[1] + priceRegex.exec(priceString)[2]
        );

        Bond.create(bond, price)
      } else {
        console.log('Record has no new image', streamRecord)
      }
    });

    callback(null)
  } catch (e) {
    callback(e)
  }
}