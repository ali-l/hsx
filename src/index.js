import Bond from './models/Bond'
import Job from './models/Job'

const BOND_TYPE = 'BOND';
const HEALTH_CHECK_TYPE = 'HEALTH_CHECK';

async function processBond({ ticker }) {
  console.log('processing bond ', ticker);
  const bond = await Bond.find(ticker);
  await bond.calculateCurrentTAG();
  await bond.save();
}

async function processHealthCheck({ tickerList }) {
  console.log('processing health check for ', tickerList);

  for (let ticker of tickerList) {
    await Job.create({ type: BOND_TYPE, ticker: ticker })
  }

  // await Job.create({ type: EMAIL_REPORT_TYPE, tickerList: tickerList})
}

// noinspection JSUnusedGlobalSymbols
export default async ({ Records }, context, callback) => {
  for (let streamRecord of Records) {
    const record = streamRecord.dynamodb.NewImage;
    if (!record) continue;

    const job = Job.fromStreamRecord(record);

    if (job.type === BOND_TYPE) {
      await processBond(job)
    } else if (job.type === HEALTH_CHECK_TYPE) {
      await processHealthCheck(job)
    }
  }

  callback(null)
}