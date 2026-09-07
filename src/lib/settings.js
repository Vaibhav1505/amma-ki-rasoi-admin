import dbConnect from './mongodb';
import BusinessSettings from './models/BusinessSettings';

export async function getBusinessSettings() {
  await dbConnect();
  let settings = await BusinessSettings.findById('business').lean();
  if (!settings) {
    settings = (await BusinessSettings.create({ _id: 'business' })).toObject();
  }
  return settings;
}
