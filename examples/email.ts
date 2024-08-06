/* eslint-disable no-console */
import { Inbound } from '@oyen-oss/inbound';

const teamId = 'example';
const email = 'test@oyenbound.com';
const accessToken = 'e30.e30....';

const inbound = new Inbound({
  teamId,
  accessToken,
  email,
});

console.log('Waiting to receive....');
const message = await inbound.once('message');

if (message) {
  console.log('received email from %s to %s', message?.to, message?.from);
} else {
  console.log('no email received');
}

// clean up
inbound.close();
