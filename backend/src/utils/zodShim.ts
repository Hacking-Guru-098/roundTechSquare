/**
 * Tiny schema shim to avoid adding extra deps beyond the requested list.
 * It's intentionally minimal: just enough for runtime env parsing.
 */
type Parser<T> = { parse(input: unknown): T };

class ZString implements Parser<string> {
  private _min = 0;
  private _default?: string;
  private _optional = false;
  private _coerceNumber = false;

  min(n: number) {
    this._min = n;
    return this;
  }

  optional() {
    this._optional = true;
    return this;
  }

  default(v: string) {
    this._default = v;
    return this;
  }

  parse(input: unknown): string {
    if (input === undefined || input === null || input === "") {
      if (this._default !== undefined) return this._default;
      if (this._optional) return "";
      throw new Error("Required string env var is missing");
    }
    const s = String(input);
    if (s.length < this._min) throw new Error("String env var too short");
    return s;
  }
}

class ZNumber implements Parser<number> {
  private _default?: number;

  int() {
    return this;
  }

  positive() {
    return this;
  }

  default(v: number) {
    this._default = v;
    return this;
  }

  parse(input: unknown): number {
    if (input === undefined || input === null || input === "") {
      if (this._default !== undefined) return this._default;
      throw new Error("Required number env var is missing");
    }
    const n = Number(input);
    if (!Number.isFinite(n)) throw new Error("Invalid number env var");
    return n;
  }
}

class ZObject<T extends Record<string, Parser<any>>> implements Parser<{ [K in keyof T]: ReturnType<T[K]["parse"]> }> {
  constructor(private shape: T) {}

  parse(input: unknown) {
    const obj = input as Record<string, unknown>;
    const out: Record<string, unknown> = {};
    for (const key of Object.keys(this.shape)) {
      out[key] = this.shape[key]!.parse(obj?.[key]);
    }
    return out as { [K in keyof T]: ReturnType<T[K]["parse"]> };
  }
}

export const z = {
  string: () => new ZString(),
  coerce: {
    number: () => new ZNumber()
  },
  object: <T extends Record<string, Parser<any>>>(shape: T) => new ZObject(shape)
};

