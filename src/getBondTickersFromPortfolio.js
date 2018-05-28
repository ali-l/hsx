// Run this script on portfolio page to get a list of Bond tickers

const table = document.querySelector('#sortable_StarBonds > tbody');

const tickers = [];

for (let row of table.children) {
  const nameColumn = row.children[0];
  const textContainer = nameColumn.children[0];
  tickers.push(textContainer.textContent)
}

console.log(JSON.stringify(tickers));