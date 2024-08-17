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
const message = await inbound.once('message');

if (message) {
  console.log('received SMS from %s to %s', message?.to, message?.from);
} else {
  console.log('no SMS received');
}

// clean up
inbound.close();
