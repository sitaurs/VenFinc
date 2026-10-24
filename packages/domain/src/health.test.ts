import { expect, it } from 'vitest';
import { assessHeartbeat } from './index';
const sample = { schemaVersion: 1, service: 'finance-worker', instanceId: 'd63cc8c7-5c5c-4d31-9cc1-239150ecce9a', checkedAt: '2026-10-24T04:00:00Z', state: 'available' };
const at = Date.parse(sample.checkedAt);
it.each([0, 1000])('accepts fresh heartbeat at age %i within an explicit policy', age => {
  expect(assessHeartbeat(sample, at + age, 1000).state).toBe('available');
});
it.each([1001, -1])('never shows stale or future-dated data as confirmed at age %i', age => {
  expect(assessHeartbeat(sample, at + age, 1000).state).toBe('unknown');
});
it('keeps missing, malformed or unavailable service states honest', () => {
  expect(assessHeartbeat(null, at, 1000).state).toBe('unknown');
  expect(assessHeartbeat({ ...sample, checkedAt: 'bad-date' }, at, 1000).state).toBe('unknown');
  expect(assessHeartbeat({ ...sample, state: 'unavailable' }, at, 1000).state).toBe('unavailable');
});
it('rejects absent or nonsensical freshness policy', () => {
  expect(() => assessHeartbeat(sample, at, 0)).toThrow();
  expect(() => assessHeartbeat(sample, Number.NaN, 1000)).toThrow();
});
