import { describe, expect, test } from 'vitest';
import { LazyPromise } from '../lib/lazy-promise.js';

describe('lazy promises', () => {
  test('lazy promise rejects with error', async () => {
    const lazyPromise = new LazyPromise<string>((_, reject) => {
      reject(new Error('bzzzzzzt'));
    });

    await expect(lazyPromise).rejects.toThrowError('bzzzzzzt');
  });

  test('create lazy promise from async function', async () => {
    const lazyPromise = LazyPromise.from(async () => Promise.resolve(1));
    expect(await lazyPromise).toBe(1);
  });

  test('create lazy promise from synchronous function', async () => {
    const lazyPromise = LazyPromise.from(() => 1);
    expect(await lazyPromise).toBe(1);
  });

  test('create lazy promise from resolved value', async () => {
    const lazyPromise = LazyPromise.resolve(1);
    expect(await lazyPromise).toBe(1);
  });

  test('create lazy promise from rejected error', async () => {
    const lazyPromise = LazyPromise.reject(new Error('fixture'));
    await expect(lazyPromise).rejects.toThrowError('fixture');
  });

  test('make sure you cant provide a function with no args', async () => {
    expect(
      () => new LazyPromise((/* no args deliberately */) => Promise.resolve(1)),
    ).toThrowError('executor must be able to resolve or reject');
  });
});
