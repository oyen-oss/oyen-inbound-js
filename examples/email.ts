/* eslint-disable no-console */
/* eslint-disable no-restricted-syntax */
import { Inbound } from '@oyenjs/inbound';

const inbound = new Inbound({
  teamId: 'example',
  accessToken: 'e30.e30....',
  emailAddress: 'test@example.oyenmail.com',
  es: 'test',
});

console.log('Waiting to receive some emails...');

try {
  for await (const email of inbound.stream()) {
    if (email !== null) {
      console.log('received msg %s', email.headers.get('message-id'));
    }

    const links = email.html?.document.selectAll('a') || [];

    // "click" all of the links
    for await (const link of links) {
      if (link.properties.href) {
        console.log('"clicking" link %s', link.properties.href);
        await fetch(link.properties.href.toString(), {
          method: 'GET',
          headers: {
            'User-Agent': 'Oyen',
          },
        });
      }
    }
  }

  console.log('iteration done');
} catch (err) {
  console.error(err);
}

// clean up like a good citizen
inbound.close();
