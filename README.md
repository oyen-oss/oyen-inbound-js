# @oyenjs/inbound

Client library for the inbound message service from oyen.

## Install

```bash
npm install @oyenjs/inbound
```

## Usage

#### Email

```typescript
import { Inbound } from '@oyenjs/inbound';

const email = await Inbound.from({
  teamId: '<your oyen team id>',
  accessToken: 'eyj...',
  email: 'test@oyenbound.com',
});

const message = await email.once('message');

console.log(message);
// {
//   from: 'somewhere@example.com',
//   to: 'test@oyenbound.com',
//   raw: '<mime encoded email>',
// }
```

#### SMS

```typescript
import { Inbound } from '@oyenjs/inbound';

const sms = await Inbound.from({
  teamId: '<your oyen team id>',
  accessToken: 'eyj...',
  sms: '+65 8888 8888',
});

const message = await sms.once('message');

console.log(message);
// {
//   from: '+1234 456 7890',
//   to: '+65 8888 8888',
//   raw: 'Hello, World!',
// }
```
