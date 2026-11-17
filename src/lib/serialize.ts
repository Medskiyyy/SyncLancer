import { Decimal } from '@prisma/client/runtime/library';

/**
 * Shape of a value after crossing the Server -> Client Component boundary.
 *
 * Prisma returns `Decimal` for money columns and `bigint` for `File.fileSize`.
 * Neither is a plain object, so React refuses to serialize them and logs
 * "Only plain objects can be passed to Client Components". `Date` is supported
 * by the RSC payload and is left alone.
 */
export type Serialized<T> = T extends Decimal
  ? number
  : T extends bigint
    ? number
    : T extends Date
      ? Date
      : T extends (infer U)[]
        ? Serialized<U>[]
        : T extends object
          ? { [K in keyof T]: Serialized<T[K]> }
          : T;

/**
 * Deep-converts Prisma scalars into values a Client Component can receive.
 *
 * Use this on any Prisma result passed as a prop from a Server Component —
 * nested relations (client -> projects -> budget) are covered too, which is why
 * this exists instead of per-page field mapping.
 */
export function serialize<T>(value: T): Serialized<T> {
  if (value === null || value === undefined) {
    return value as Serialized<T>;
  }

  if (Decimal.isDecimal(value)) {
    return (value as Decimal).toNumber() as Serialized<T>;
  }

  if (typeof value === 'bigint') {
    return Number(value) as Serialized<T>;
  }

  if (value instanceof Date) {
    return value as Serialized<T>;
  }

  if (Array.isArray(value)) {
    return value.map((item) => serialize(item)) as Serialized<T>;
  }

  if (typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
      out[key] = serialize(item);
    }
    return out as Serialized<T>;
  }

  return value as Serialized<T>;
}
