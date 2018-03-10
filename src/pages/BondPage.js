import cheerio from 'cheerio'

const priceRegex = /H\$(\d{1,3})\.(\d{2})H\$/;

export default class BondPage {
  constructor(html) {
    this.page = cheerio.load(html)
  }

  get price() {
    let string = this.page('#container > div.column-row > div.four.columns.last > div:nth-child(2) > div > p.value').text();

    return Number.parseInt(
      priceRegex.exec(string)[1] + priceRegex.exec(string)[2]
    );
  }
}