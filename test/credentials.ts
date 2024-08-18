import { signToken } from '@oyenjs/keys';

const keys = await crypto.subtle
  .generateKey(
    {
      name: 'ECDSA',
      namedCurve: 'P-256',
    },
    true,
    ['sign', 'verify'],
  )
  .then(async ({ privateKey, publicKey }) => ({
    id: crypto.randomUUID(),
    private: await crypto.subtle.exportKey('jwk', privateKey),
    public: await crypto.subtle.exportKey('jwk', publicKey),
  }));

export const fakeInboundApiToken = await signToken(keys.private, {
  kid: keys.id,
  claims: {},
  ttlSecs: 60,
});
