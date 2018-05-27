import Bond from './models/Bond'
import Job from './models/Job'

const processBond = async (job) => {
  console.log('processing bond', job);
  const bond = await Bond.find(job.ticker);
  await bond.calculateCurrentTAG();
  await bond.save();
};

// noinspection JSUnusedGlobalSymbols
export default async ({ Records }, context, callback) => {
  for (let streamRecord of Records) {
    const record = streamRecord.dynamodb.NewImage;
    if (!record) continue;

    await processBond(Job.fromStreamRecord(record))
  }

  callback(null)
}