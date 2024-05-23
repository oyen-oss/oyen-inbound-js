import type { FetcherParams } from '@block65/rest-client';
import type { EventMessage } from '@oyen-oss/eventsource';
import { MockAgent, setGlobalDispatcher } from 'undici';
import { afterEach, beforeAll, expect, test } from 'vitest';
import type { EmailMessageData, SmsMessageData } from '../lib/inbound.js';
import type {
  EmailInbox,
  InboxEventSource,
  SmsInbox,
} from '../lib/rest-client/main.js';
import { Inbound } from '../src/main.js';
import { fakeAccessToken } from './credentials.js';
import { FetchBasedEventSource } from './mock-eventsource.js';

const mockAgent = new MockAgent();

beforeAll(() => {
  mockAgent.activate();
  setGlobalDispatcher(mockAgent);
  mockAgent.disableNetConnect();
});

afterEach(() => {
  mockAgent.assertNoPendingInterceptors();
});

// this endpoint is the default in the rest client source
const apiEndpoint = 'https://api.example.com';
const eventSourceEndpoint = 'https://mock-eventsource';

const mockApi = mockAgent.get(apiEndpoint);

const apiOptions = {
  endpoint: new URL(apiEndpoint),
  async fetcher(params: FetcherParams) {
    const res = await fetch(new URL(params.url));
    return {
      ok: res.ok,
      status: res.status,
      statusText: res.statusText,
      url: params.url,
      body: await res.json(),
    };
  },
};

const mockEventsAccessToken = 'e30.e30.';
const mockTeamId = 'zzzzzzz';

test('Email', async () => {
  const handle = 'test';
  const domainName = 'oyenbound.com';

  const mockInboxId = 'aaaaaaa';
  const mockEventSourceId = 'bbbbbbb';
  const mockChannel = `inbox:${mockInboxId}`;

  mockApi
    .intercept({
      method: 'get',
      path: `/domains/${domainName}/inboxes/${handle}`,
    })
    .reply<EmailInbox>(200, {
      teamId: mockTeamId,
      inboxId: mockInboxId,
      kind: 'email',
      handle,
      domain: domainName,
      description: 'test only',
      createTime: new Date().toISOString(),
    } satisfies EmailInbox);

  mockApi
    .intercept({
      method: 'get',
      path: `/teams/${mockTeamId}/inboxes/${mockInboxId}/eventsource`,
    })
    .reply<InboxEventSource>(200, {
      teamId: mockTeamId,
      createTime: new Date().toISOString(),
      accessToken: mockEventsAccessToken,
      channelId: mockChannel,
      endpoint: eventSourceEndpoint,
      eventSourceId: mockEventSourceId,
    } satisfies InboxEventSource);

  const mockEvents = mockAgent.get(eventSourceEndpoint);
  mockEvents
    .intercept({
      path: `/e/${mockTeamId}/${mockEventSourceId}/event-stream?accessToken=${mockEventsAccessToken}&channels=${mockChannel}`,
    })
    .reply(
      200,
      [
        'id:0',
        `data:${JSON.stringify({
          ch: mockInboxId,
          d: JSON.stringify({
            from: 'test <test@example.com>',
            to: 'test <test@example.com>',
            raw: 'Hello this is a MIME encapsulated message',
          } satisfies EmailMessageData),
          enc: 'json',
          iat: new Date().toISOString(),
        } satisfies EventMessage<string>)}`,
        '',
      ].join('\n'),
      {
        headers: { 'content-type': 'text/event-stream' },
      },
    );

  const email = new Inbound(
    {
      teamId: mockTeamId,
      accessToken: fakeAccessToken,
      handle,
      domainName,
      apiOptions,
    },
    {
      eventSourceClass: FetchBasedEventSource,
    },
  );

  // async style
  const message = await email.once('message');
  expect(message).toMatchSnapshot();

  email.close();
});

test('SMS', async () => {
  const number = '1234567890';

  const mockInboxId = 'ccccccc';
  const mockEventSourceId = 'ddddddd';
  const mockChannel = `inbox:${mockInboxId}`;

  mockApi
    .intercept({
      method: 'get',
      path: `/numbers/${number}`,
    })
    .reply<SmsInbox>(200, {
      teamId: mockTeamId,
      inboxId: mockInboxId,
      kind: 'sms',
      handle: number,
      description: 'test only',
      createTime: new Date().toISOString(),
    } satisfies SmsInbox);

  mockApi
    .intercept({
      method: 'get',
      path: `/teams/${mockTeamId}/inboxes/${mockInboxId}/eventsource`,
    })
    .reply<InboxEventSource>(200, {
      teamId: mockTeamId,
      createTime: new Date().toISOString(),
      accessToken: mockEventsAccessToken,
      channelId: mockChannel,
      endpoint: eventSourceEndpoint,
      eventSourceId: mockEventSourceId,
    } satisfies InboxEventSource);

  const mockEvents = mockAgent.get(eventSourceEndpoint);
  mockEvents
    .intercept({
      path: `/e/${mockTeamId}/${mockEventSourceId}/event-stream?accessToken=${mockEventsAccessToken}&channels=${mockChannel}`,
    })
    .reply(
      200,
      [
        'id:0',
        `data:${JSON.stringify({
          ch: mockInboxId,
          d: JSON.stringify({
            from: number.split('').reverse().join(''),
            to: number,
            raw: 'Hello this is a SMS message',
          } satisfies SmsMessageData),
          enc: 'json',
          iat: new Date().toISOString(),
        } satisfies EventMessage<string>)}`,
        '',
      ].join('\n'),
      {
        headers: { 'content-type': 'text/event-stream' },
      },
    );

  const sms = new Inbound(
    {
      teamId: mockTeamId,
      accessToken: fakeAccessToken,
      number,
      apiOptions,
    },
    {
      eventSourceClass: FetchBasedEventSource,
    },
  );

  await new Promise<void>((resolve) => {
    expect.assertions(1);
    // callback style
    sms.on('message', (message) => {
      expect(message).toMatchSnapshot();
      sms.close();
      resolve();
    });
  });

  sms.close();
});
