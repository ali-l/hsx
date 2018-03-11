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

  get credits() {
    let creditsListString = this.page('#container > div.column-row > div.eight.columns > div.whitebox_content > div.inner_columns > div:nth-child(1) > ul');

    let creditsList = [];

    this.page(creditsListString)
      .find('li')
      .each((_, domItem) => {
        let item = this.page(domItem);

        creditsList.push({
          ticker: item.find('p > span > a').attr('href').substr(15),
          releaseDate: Date.parse(this.page(item).find('p > strong').text()) || null
        })
      });

    return creditsList
  }
}