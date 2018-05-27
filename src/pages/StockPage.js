import cheerio from 'cheerio'

const priceRegex = /^H\$(\d{1,3})\.(\d{2})/;

export default class StockPage {
  constructor(html) {
    this.page = cheerio.load(html)
  }

  // get isActive() {
  //   return this.page('#container > div.column-row > div.eight.columns > div.whitebox_content > div.security_data > div.data_column.left_col > table > tbody > tr:nth-child(2) > td:nth-child(2)').text() === 'active'
  // }

  get releaseDate() {
    return Date.parse(this.page('#container > div.column-row > div.eight.columns > div.whitebox_content > div.security_data > div.data_column.last > table > tbody > tr:nth-child(2) > td:nth-child(2)').text())
  }

  // get releasePattern() {
  //
  // }

  get price() {
    let string = this.page('#container > div.column-row > div.four.columns.last > div:nth-child(2) > div > p.value').text();
    let matches = priceRegex.exec(string);

    return parseInt(matches[1] + matches[2])
  }

  // get delistDate() {
  //
  // }
}