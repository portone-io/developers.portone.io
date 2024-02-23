function mapNullable<T, U>(v: T | null, mapper: (v: T) => U): U | null;
function mapNullable<T, U>(
  v: T | undefined,
  mapper: (v: T) => U,
): U | undefined;
function mapNullable<T, U>(
  v: T | null | undefined,
  mapper: (v: T) => U,
): U | null | undefined;
function mapNullable<T, U>(
  v: T | null | undefined,
  mapper: (v: T) => U,
): U | null | undefined {
  return v == null ? (v as null | undefined) : mapper(v);
}

export default mapNullable;
