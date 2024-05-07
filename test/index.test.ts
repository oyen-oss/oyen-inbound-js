import type { EventMessage } from '@oyen-oss/eventsource';
import { MockAgent, fetch, setGlobalDispatcher } from 'undici';
import { afterEach, beforeAll, expect, test } from 'vitest';
import type { InboundMessageData } from '../lib/inbound.js';
import type { EmailInbox, InboxEventSource } from '../lib/rest-client/main.js';
import { Inbound } from '../src/main.js';
import { MockEventSource } from './mock-eventsource.js';

const mockAgent = new MockAgent();

beforeAll(() => {
  mockAgent.activate();
  setGlobalDispatcher(mockAgent);
  mockAgent.disableNetConnect();
});

afterEach(() => {
  mockAgent.assertNoPendingInterceptors();
});

// fake for testing only
const privateKey =
  'eyJhbGciOiJSUzI1NiIsImt0eSI6IlJTQSIsImUiOiJBUUFCIiwiZCI6IlRqQXlFN3MxRVZWb0NRLUt5dnJQcVgwRUp3amVsUEtpdEFlcDRac0kwNHVaUkNuNVM4WmYteVBWWmFuc1BhOThRaHhCNFAxem9rMnVQdm11aExFd2FqWFg3Ni1SVk9UNldmVlBZNmttM0Zxd3Z1SGszeGJubE9Vdko0ZmJTUTRwbXdncDE0RVhKOEEtbjh6V3lNdXl2UDdTU1JiZG1ncU9oa3BZNU1lY1dRQmdVNXI0TEFzel9ld2dhV2pDby1STjJST0haNWt4MjJBMUpiQmJqMS1RWFAxME5XVTUyR25UdG5tdTBvRGlpYWEwZlpnT3VPTThUYUNJTlpLU3M2aENfTEdLejd3NVJPRWFsbVhCcWtWcWYyaFZiUVV4SzlQTW1pOGJzS2pmNjNfTDBnR25JaTRTWkFzampZVlV2SDhjRHE4cURTVWlham1oZW10dm5QU2dYUSIsIm4iOiJzNFJkQUpBbDdHaC1xQndmcm1iR2R6QVhFVHVyREpiVURBNlFZR2F4VWdyd21EU3RCR01aWmhjNVlWQ29MRVFOVjJnY05ULW93TENseDEwVEZXLThBNFNZYkhFc1RjYjJmUWF5dElOTmhmcnN2SVhLQnhlUHlQREpGRUZla1NyYVN6djVzMy1kRVV5YmZ0VGZHSkItMnlQanlOR0c5ZjlDdk1SUDVxMTREWUJ0eGFRVWxVeDJmNmZDb2xkLUU4aC1RbXZhLUFOZlU2TzdUd0lvWWo5UzdxS2I2eVEwZnNKS3pyemVCbV9haFVkdXg2VThkRzNxWlJGRnc4YnJXMENya3RwenZrMThtR2NBeHo3aVBua0JDZlFXd0VfcFAzakF2ck9TREpvMDhpTzE3ZWsySXprazRzX1NTYnEwTkFkRU9XYUROdVF5NzUyOFVULUZHVjFGM3ciLCJwIjoiX0Z2aEV3ZURjSUZVTU5tWUt6X2FNQjB0S2NXeXdmamY1blRwRmotVC1acXFKQll3WXgtZUktTTE2Z0hnSnFwRUNCYWh0cU56UTAzeVFCZkRQbndYZWxRV2xRb3Y2aXd1cFhZNERtU2wxZkw1ckh0ckNjVXhkd1hxYXFwZEVsQ2NNcUNsdWZpTlVZU3B4ZjhiX1FHeFJ1TlRiaVhiT19PU1hKWDdCS1c3QU5zIiwicSI6InRodHU0QUMwSVk2UGZtRnZDSFNoOGhsTjg4RTR5U191V2NZNVN0R0dzVmdMUEw2YWhwbTBJN0JNNlVOU0dqVXBlSkFhaFB5N2FoZTF5SWRRRzBEZEVrSnpiV2NTVzF3b3BoVC1SV1ZPVnJFRWNYNllrNTBEZUJ0WHVmbWw3QVh3TGt2TlQ1cWI3YTRmNFo5bE1fNkRXTmtCNmlDVzBYbXFSbkhMVjVlblRFMCIsImRwIjoiSFVtMGgzYlp4RmJlSklVOGFkaVJSQUEtMjVnOE5OTGplV1djSDU3bFY1U2hwbXFFMXh3MlNFZjRXOTQzMjRUclBGMFVDNVJRcmtEX21ueW5oanIwcHBmWHZ4aGRrem5wZF82T1p1MDdhZWMzSHROOENyZy1FMmcyV29iSEluY0VpY09uT0R3bWVvMkFfcC1xNmVRbVpPbkJKd2x4dGpXQWlRcEhCYlVPVFAwIiwiZHEiOiJxN2UybDFkU2hBb1AyUlk3UXZmbjlZaFM3elVXUFBBTGkyX1ZlbTJVMndtd252a0VjVVBpajN5aEtad25nVHI3X2dtMFdBNlJFdnVFbUxDdm91TkpFdnpDSnpsNEg5b0pJb0xOT2RiTFJnZnByck8zWUFwQXlUTFBTRGpXY25jdkFoak1ZdkhoY3dBc1ktNlAyYlYzV1lKWHdkUTFJeFhjc0V5QmRfa3k4a2siLCJxaSI6Im92c2VhbnVVZFhwa19ZS1RLM2JRWDZDQjQ3ZUNxSkoyTVp5UFpJVXpkVkFhVnYtaWk3QllETFFFYlI2V1c3b0hjX3EyQUhNckVGSDFqcENZb2lfLURsTXhRR0t2NXpmTFBmLU9Kb0ZtaURGLWRFZ0tWbzZHbVgyQjdRNDR0ckFyNng0MHhsVXEzRmQ3SGx5NTZzVllNQnNnVl9Yd0JCTjRsX05JLW5KWkVwSSIsImtpZCI6IkNZUm03ak1WV05rd3QyV2dmV21EdFQzZCJ9';
// fake for testing only
const teamId = 'z7t7j3d8cTD';
const eventsEndpoint = 'https://events.example.com';
const apiEndpoint = 'https://api.example.com';

test('Email', async () => {
  const mockApi = mockAgent.get(apiEndpoint);
  mockApi
    .intercept({ method: 'get', path: '/domains/oyenbound.com/inboxes/test' })
    .reply<EmailInbox>(200, {
      teamId,
      inboxId: 'ibx_test',
      kind: 'email',
      createTime: new Date().toISOString(),
      domain: 'oyenbound.com',
      description: 'test only',
      handle: 'test',
    } satisfies EmailInbox);

  mockApi
    .intercept({
      method: 'get',
      path: /\/teams\/[^/]+\/inboxes\/[^/]+\/eventsource/,
    })
    .reply<InboxEventSource>(200, {
      teamId,
      createTime: new Date().toISOString(),
      accessToken: 'eyJunior',
      channelId: 'test',
      endpoint: eventsEndpoint,
      eventSourceId: 'es_test',
    } satisfies InboxEventSource);

  const mockEvents = mockAgent.get(eventsEndpoint);
  mockEvents
    .intercept({
      path: `/e/${teamId}/es_test/event-stream?accessToken=eyJunior&channels=test`,
    })
    .reply(
      200,
      [
        'id:0',
        `data:${JSON.stringify({
          ch: 'test',
          d: JSON.stringify({
            from: 'test <test@example.com>',
            to: 'test <test@example.com>',
            raw: 'Hello this is a MIME encapsulated message',
          } satisfies InboundMessageData),
          enc: 'json',
          iat: new Date().toISOString(),
        } satisfies EventMessage<string>)}`,
        '',
      ].join('\n'),
      {
        headers: { 'content-type': 'text/event-stream' },
      },
    );

  const inboundEmail = await Inbound.from(
    {
      teamId,
      handle: 'test',
      domainName: 'oyenbound.com',
      privateKey,
      options: {
        endpoint: new URL(apiEndpoint),
        async fetcher(params) {
          const res = await fetch(new URL(params.url));
          return {
            ok: res.ok,
            status: res.status,
            statusText: res.statusText,
            url: params.url,
            body: await res.json(),
          };
        },
      },
    },
    {
      eventSourceClass: MockEventSource,
    },
  );

  // async style
  const message = await inboundEmail.once('message');

  expect(message).toMatchSnapshot();

  inboundEmail.close();
});

test.skip('SMS', async () => {
  const inboundSms = await Inbound.from({
    teamId,
    number: '+1234567890',
    privateKey,
    options: {
      endpoint: new URL('http://localhost:3000'),
    },
  });

  expect.assertions(1);

  // callback style
  inboundSms.on('message', (message) => {
    expect(message).toMatchSnapshot();
    inboundSms.close();
  });
});
