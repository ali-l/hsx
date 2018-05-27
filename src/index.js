import Bond from './models/Bond'
import Job from './models/Job'

const BOND = 'BOND';
const STOCK = 'STOCK';

const processBond = async (job) => {
  console.log('processing bond', job);

  let bond = await Bond.find(job.ticker);

  if (job.fetchStocks) {
    let credits = bond.creditsPotentiallyInCurrentTAG.concat(bond.creditsPotentiallyInFutureTAG);

    for (let {ticker} of credits) {
      await Job.create({ type: STOCK, ticker: ticker })
    }

    await Job.create({ type: BOND, ticker: job.ticker, fetchStocks: false })
  } else {
    await bond.calculateCurrentTAG();
    await bond.save();
  }
};

const processStock = (job) => {
  console.log('processing stock', job)
};

// noinspection JSUnusedGlobalSymbols
export default async ({ Records }, context, callback) => {
  try {
    for (let streamRecord of Records) {
      let record = streamRecord.dynamodb.NewImage;

      if (record) {
        let job = Job.fromStreamRecord(record);

        if (job.type === BOND) {
          await processBond(job)
        } else if (job.type === STOCK) {
          await processStock(job)
        } else {
          // noinspection ExceptionCaughtLocallyJS
          throw new Error('Not a stock or bond')
        }

      } else {
        console.log('Record has no new image', streamRecord)
      }
    }

    callback(null)
  } catch (e) {
    callback(e)
  }
}