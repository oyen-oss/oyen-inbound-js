/* eslint-disable no-console */
import { Inbound } from '@oyenjs/inbound';

const teamId = 'example';
const sms = '+65 8888 8888';
const accessToken = 'e30.e30....';

const inbound = new Inbound({
  teamId,
  accessToken,
  sms,
});

console.log('Waiting to receive SMS....');
const message = await inbound.once();

if (message) {
  const extract = await message.extract();
  console.log('received SMS message from %s', extract.from);
} else {
  console.log('no SMS received');
}

// clean up
inbound.close();
