import cheerio from 'cheerio'

const priceRegex = /^H\$(\d{1,3})\.(\d{2})/;

function convertGrossDollarsToStockPrice(dollars) {
  return Math.round(dollars / 10000)
}

function active(page) {
  return page('#container > div.column-row > div.eight.columns > div.whitebox_content > div.security_data > div.data_column.left_col > table > tbody > tr:nth-child(2) > td:nth-child(2)').text() !== 'Inactive'
}

function releaseDate(page) {
  return Date.parse(page('#container > div.column-row > div.eight.columns > div.whitebox_content > div.security_data > div.data_column.last > table > tbody > tr:nth-child(2) > td:nth-child(2)').text())
}

function gross(page) {
  const fourthColumnTitle = page('#container > div.column-row > div.eight.columns > div.whitebox_content > div.security_data > div.data_column.last > table > tbody > tr:nth-child(4) > td.label').text();
  const column = fourthColumnTitle === 'Gross:' ? 4 : 3;
  const grossString = page(`#container > div.column-row > div.eight.columns > div.whitebox_content > div.security_data > div.data_column.last > table > tbody > tr:nth-child(${column}) > td:nth-child(2)`).text();

  if (grossString === 'n/a') {
    return null
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

function price(page) {
  let string = page('#container > div.column-row > div.four.columns.last > div:nth-child(2) > div > p.value').text();
  let matches = priceRegex.exec(string);

  return parseInt(matches[1] + matches[2])
}

function delistDate(page, active) {
  if (active === true) return null;
  return Date.parse(page('#container > div.column-row > div.four.columns.last > div:nth-child(2) > div > p.value > span').text())
}

export default (html) => {
  let page = cheerio.load(html);

  return {
    active: active(page),
    releaseDate: releaseDate(page),
    gross: gross(page),
    price: price(page),
    delistDate: delistDate(page, active(page))
  }
}