/* eslint-disable no-console */
import { Inbound } from '@oyenjs/inbound';

const teamId = 'example';
const phoneNumber = '+65 8888 8888';
const accessToken = 'e30.e30....';

const inbound = new Inbound({
  teamId,
  accessToken,
  phoneNumber,
});

console.log('Waiting to receive SMS....');

const sms = await inbound.once();

console.log('received SMS message from %s', sms.from);

// clean up
inbound.close();
