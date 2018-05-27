import Bond from './models/Bond'
import Job from './models/Job'

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

    await processBond(Job.fromStreamRecord(record))
  }

  callback(null)
}