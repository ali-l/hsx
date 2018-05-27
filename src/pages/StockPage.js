import cheerio from 'cheerio'

const priceRegex = /^H\$(\d{1,3})\.(\d{2})/;

function convertGrossDollarsToStockPrice(dollars) {
  return Math.round(dollars / 10000)
}

export default class StockPage {
  constructor(html) {
    this.page = cheerio.load(html)
  }

  get active() {
    return this.page('#container > div.column-row > div.eight.columns > div.whitebox_content > div.security_data > div.data_column.left_col > table > tbody > tr:nth-child(2) > td:nth-child(2)').text() === 'Active'
  }

  get releaseDate() {
    return Date.parse(this.page('#container > div.column-row > div.eight.columns > div.whitebox_content > div.security_data > div.data_column.last > table > tbody > tr:nth-child(2) > td:nth-child(2)').text())
  }

  get gross() {
    const grossString = this.page('#container > div.column-row > div.eight.columns > div.whitebox_content > div.security_data > div.data_column.last > table > tbody > tr:nth-child(4) > td:nth-child(2)').text();

    if (grossString === 'n/a') {
      return 0
    } else {
      const [a, b, c] = grossString.slice(1).split(',').map(n => parseInt(n));

      if (a && b && c) {
        return convertGrossDollarsToStockPrice(a * 1000000 + b * 1000 + c)
      } else if (a && b) {
        return convertGrossDollarsToStockPrice(a * 1000 + b)
      } else if (a) {
        return convertGrossDollarsToStockPrice(a)
      } else {
        throw 'error calculating gross'
      }
    }
  }

  get price() {
    let string = this.page('#container > div.column-row > div.four.columns.last > div:nth-child(2) > div > p.value').text();
    let matches = priceRegex.exec(string);

    return parseInt(matches[1] + matches[2])
  }

  get delistDate() {
    if (this.active === true) return null;
    return Date.parse(this.page('#container > div.column-row > div.four.columns.last > div:nth-child(2) > div > p.value > span').text())
  }
}