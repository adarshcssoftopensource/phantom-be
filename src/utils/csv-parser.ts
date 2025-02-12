import * as csv from 'csvtojson';

export const parseCsvFile = async (file: Express.Multer.File) => {
  if (!file) {
    throw new Error('File buffer is missing');
  }
  const csvFilePath = file.path;

  const parsedData = await csv().fromFile(csvFilePath);

  return parsedData;
};
