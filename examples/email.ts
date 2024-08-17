/* eslint-disable no-console */
import { Inbound } from '@oyenjs/inbound';

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
  console.log('received msg from %s to %s', message.to, message.from);
}

// eslint-disable-next-line no-restricted-syntax
for await (const msg of inbound.stream('message')) {
  if (msg) {
    console.log('received msg from %s to %s', msg.to, msg.from);
  }
}

// clean up like a good citizen
inbound.close();
