import cheerio from 'cheerio'

const priceRegex = /H\$(\d{1,3})\.(\d{2})H\$/;

function price(page) {
  let string = page('#container > div.column-row > div.four.columns.last > div:nth-child(2) > div > p.value').text();
  let matches = priceRegex.exec(string);

  return parseInt(matches[1] + matches[2])
}

function credits(page) {
  let creditsListString = page('#container > div.column-row > div.eight.columns > div.whitebox_content > div.inner_columns > div:nth-child(1) > ul');

  let creditsList = [];

  page(creditsListString)
    .find('li')
    .each((_, domItem) => {
      let item = page(domItem);

      creditsList.push({
        ticker: item.find('p > span > a').attr('href').substr(15),
        releaseDate: Date.parse(page(item).find('p > strong').text()) || null
      })
    });

  return creditsList
}


export default (html) => {
  let page = cheerio.load(html);

  return {
    price: price(page),
    credits: credits(page)
  }
}