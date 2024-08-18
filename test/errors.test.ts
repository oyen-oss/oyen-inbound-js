import { createIsomorphicNativeFetcher } from '@block65/rest-client';
import { MockAgent, setGlobalDispatcher } from 'undici';
import { afterEach, beforeAll, describe, expect, test } from 'vitest';
import { Inbound, type InboundOptions } from '../src/main.js';
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

describe('Errors', () => {
  const opts = {
    restClientConfig: {
      fetcher: createIsomorphicNativeFetcher({
        timeout: 0,
        retry: 0,
      }),
    },
    teamId: 'aaaaaaaa',
    accessToken: fakeInboundApiToken,
    sms: '1234567890',
    // eslint-disable-next-line no-console
    logger: console.log,
  } satisfies InboundOptions;

  test('ready throws if timedout', async () => {
    const inbound = new Inbound(opts);
    await expect(inbound.ready()).rejects.toMatchSnapshot();
    await inbound.close();
  });
});
