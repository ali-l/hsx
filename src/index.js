import Bond from './models/Bond'
import Job from './models/Job'

const BOND_TYPE = 'BOND';

const processBond = async ({ ticker }) => {
  console.log('processing bond', ticker);
  const bond = await Bond.find(ticker);
  await bond.calculateCurrentTAG();
  await bond.save();
};

// noinspection JSUnusedGlobalSymbols
export default async ({ Records }, context, callback) => {
  for (let streamRecord of Records) {
    const record = streamRecord.dynamodb.NewImage;
    if (!record) continue;

    const job = Job.fromStreamRecord(record);

    if (job.type === BOND_TYPE) {
      await processBond(job)
    }
  }

  callback(null)
}