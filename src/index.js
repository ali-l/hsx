import {fetch} from './utils'
import cheerio from 'cheerio'

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

        const $ = cheerio.load(html);
        // noinspection JSJQueryEfficiency
        console.log($('#container > div.column-row > div.four.columns.last > div:nth-child(2) > div > p.value').text());
        // noinspection JSJQueryEfficiency
        console.log($('#container > div.column-row > div.eight.columns > div.whitebox_content > div.inner_columns > div:nth-child(1) > ul > li:nth-child(1) > p > span > a').attr('href'))
      } else {
        console.log('Record has no new image', streamRecord)
      }
    });

    callback(null)
  } catch (e) {
    callback(e)
  }
}