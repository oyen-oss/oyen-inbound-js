import type { EventMessage } from '@oyen-oss/eventsource';
import { MockAgent, setGlobalDispatcher } from 'undici';
import { afterEach, beforeAll, describe, expect, test } from 'vitest';
import type {
  EmailInbox,
  InboxEventSource,
  SmsInbox,
} from '../lib/rest-client/main.js';
import {
  type EmailMessageData,
  Inbound,
  type SmsMessageData,
} from '../src/main.js';
import { fakeInboundApiToken } from './credentials.js';

const fetchMock = new MockAgent();
setGlobalDispatcher(fetchMock);

beforeAll(() => {
  fetchMock.activate();
  fetchMock.disableNetConnect();
});

afterEach(() => {
  fetchMock.assertNoPendingInterceptors();
});

const apiEndpoint = 'https://api.oyen.io';
const eventSourceEndpoint = 'https://events.oyen.io';

const mockApi = fetchMock.get(apiEndpoint);
const mockEvents = fetchMock.get(eventSourceEndpoint);

describe('Inbound', () => {
  const mockEventsAccessToken = 'e30.e30.';
  const mockTeamId = 'aaaaaaaaa';

  test.only('Email', async () => {
    const handle = 'test';
    const domainName = 'oyenbound.com';

    const mockEventSourceId = 'bbbbbbb';
    const mockInboxId = 'boxboxboxbox';
    const mockChannel = `inbox:${mockInboxId}`;

    // list inboxes
    mockApi
      .intercept({
        method: 'get',
        path: `/teams/${mockTeamId}/inboxes`,
      })
      .reply<EmailInbox[]>(
        200,
        [
          {
            teamId: mockTeamId,
            inboxId: mockInboxId,
            kind: 'email',
            handle,
            domain: domainName,
            description: 'test only',
            createTime: new Date().toISOString(),
          } satisfies EmailInbox,
        ],
        {
          headers: { 'content-type': 'application/json' },
        },
      );

    const fakeEventStreamEndpointPath = `/e/${mockTeamId}/${mockEventSourceId}/event-stream?accessToken=${mockEventsAccessToken}&channels=${mockChannel}`;

    mockApi
      .intercept({
        method: 'get',
        path: `/teams/${mockTeamId}/inboxes/${mockInboxId}/eventsource`,
      })
      .reply<InboxEventSource>(
        200,
        {
          teamId: mockTeamId,
          createTime: new Date().toISOString(),
          accessToken: mockEventsAccessToken,
          channelId: mockChannel,
          endpoint: new URL(
            fakeEventStreamEndpointPath,
            eventSourceEndpoint,
          ).toString(),
          eventSourceId: mockEventSourceId,
        } satisfies InboxEventSource,
        {
          headers: { 'content-type': 'application/json' },
        },
      );

    mockEvents
      .intercept({
        path: fakeEventStreamEndpointPath,
      })
      .reply(
        200,
        [
          'id:0',
          `data:${JSON.stringify({
            ch: mockChannel,
            d: JSON.stringify({
              to: handle,
              from: 'random@example.com',
              raw: 'Hello this is an email',
            } satisfies EmailMessageData),
            enc: 'json',
            iat: new Date().toISOString(),
          } satisfies EventMessage<string>)}`,
          '',
          '',
        ].join('\n'),
        {
          headers: { 'content-type': 'text/event-stream' },
        },
      );

    const inboundEmail = new Inbound({
      teamId: mockTeamId,
      accessToken: fakeInboundApiToken,
      email: `${handle}@${domainName}`,
      // eslint-disable-next-line no-console
      logger: console.log,
    });

    const message = await inboundEmail.once('message');
    expect(message).toMatchSnapshot();

    inboundEmail.close();
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
      .reply<SmsInbox>(
        200,
        {
          teamId: mockTeamId,
          inboxId: mockInboxId,
          kind: 'sms',
          handle: number,
          description: 'test only',
          createTime: new Date().toISOString(),
        } satisfies SmsInbox,
        {
          headers: { 'content-type': 'application/json' },
        },
      );

    const fakeEventStreamEndpointPath = `/e/${mockTeamId}/${mockEventSourceId}/event-stream?accessToken=${mockEventsAccessToken}&channels=${mockChannel}`;

    mockApi
      .intercept({
        method: 'get',
        path: `/teams/${mockTeamId}/inboxes/${mockInboxId}/eventsource`,
      })
      .reply<InboxEventSource>(
        200,
        {
          teamId: mockTeamId,
          createTime: new Date().toISOString(),
          accessToken: mockEventsAccessToken,
          channelId: mockChannel,
          endpoint: new URL(
            fakeEventStreamEndpointPath,
            eventSourceEndpoint,
          ).toString(),
          eventSourceId: mockEventSourceId,
        } satisfies InboxEventSource,
        {
          headers: { 'content-type': 'application/json' },
        },
      );

    mockEvents
      .intercept({
        method: 'get',
        path: fakeEventStreamEndpointPath,
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
      )
      .delay(2000)
      .persist();

    const sms = new Inbound({
      teamId: mockTeamId,
      accessToken: fakeInboundApiToken,
      sms: number,
      // eslint-disable-next-line no-console
      logger: console.log,
    });

    await expect(sms.once('message')).resolves.toMatchSnapshot();

    sms.close();
  });
});
