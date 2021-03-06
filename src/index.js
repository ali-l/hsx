import Bond from './models/Bond'
import Job from './models/Job'
import sendEmail from './sendEmail';

const BOND_TYPE = 'BOND';
const BOND_BATCH_TYPE = 'BOND_BATCH';
const EMAIL_REPORT_TYPE = 'EMAIL_REPORT';

async function processBond({ ticker }) {
  console.log('processing bond ', ticker);
  const bond = await Bond.find(ticker);
  await bond.calculateCurrentTAG();
  await bond.save();
}

async function processBondBatch({ tickerList }) {
  console.log('processing bond batch ', tickerList);

  for (let ticker of tickerList) {
    await Job.create({ type: BOND_TYPE, ticker: ticker })
  }

  await Job.create({ type: EMAIL_REPORT_TYPE, tickerList: tickerList })
}

async function processEmailReport({ tickerList }) {
  console.log('processing email report for ', tickerList);
  let bonds = [];
  for (let ticker of tickerList) bonds.push(await Bond.find(ticker))

  const message = bonds.map(bond => ({ ticker: bond.ticker, TAG: bond.TAG / 100 }));
  sendEmail(message)
}

// noinspection JSUnusedGlobalSymbols
export default async ({ Records }, context, callback) => {
  for (let streamRecord of Records) {
    const record = streamRecord.dynamodb.NewImage;
    if (!record) continue;

    const job = Job.fromStreamRecord(record);

    if (job.type === BOND_TYPE) {
      await processBond(job)
    } else if (job.type === BOND_BATCH_TYPE) {
      await processBondBatch(job)
    } else if (job.type === EMAIL_REPORT_TYPE) {
      await processEmailReport(job)
    }
  }

  callback(null)
}