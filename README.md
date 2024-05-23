# @oyen-oss/inbound

Client library for the inbound message service from Oyen.

## Install

```bash
npm install @oyen-oss/inbound
```

## Usage

#### Email

```typescript
import { Inbound } from '@oyen-oss/inbound';

const email = await Inbound.from(
  {
    teamId: '<your oyen team id>',
    accessToken: 'eyj...',
    handle: 'test',
    domain: 'oyenbound.com'
  },
);

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
import { Inbound } from '@oyen-oss/inbound';

const sms = await Inbound.from(
  {
    teamId: '<your oyen team id>',
    accessToken: 'eyj...',
    number,
  },
);

const message = await sms.once('message');

console.log(message);
// {
//   from: '2348123456789',
//   to: '2348123456789',
//   raw: 'Hello, World!',
// }

```
