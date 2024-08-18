/* eslint-disable no-console */
import { Inbound } from '@oyenjs/inbound';

const teamId = 'example';
const email = 'test@example.oyenmail.com';
const accessToken = 'e30.e30....';

const inbound = new Inbound({
  teamId,
  accessToken,
  email,
});

console.log('Waiting to receive....');
const first = await inbound.once();

if (first) {
  const data = await first.extract();
  console.log('received msg id %s', data.headers.get('message-id'));
}

try {
  // eslint-disable-next-line no-restricted-syntax
  for await (const message of inbound.stream()) {
    if (message) {
      const data = await message.extract();
      console.log('received msg %s', data.headers.get('message-id'));
    }
  }

  console.log('iteration done');
} catch (err) {
  console.error(err);
}

// clean up like a good citizen
inbound.close();
