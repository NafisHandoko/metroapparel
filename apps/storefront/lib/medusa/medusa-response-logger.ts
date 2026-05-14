const MAX_BODY_CHARS = 24_000;

function shouldLogMedusaResponses(): boolean {
  return process.env.MEDUSA_LOG_RESPONSES === "true";
}

function formatInput(input: string | URL): string {
  if (typeof input === "string") return input;
  try {
    return input.toString();
  } catch {
    return "[url]";
  }
}

function safeStringify(data: unknown): string {
  if (data instanceof Response) {
    return "[Response body not consumed — use client.fetch return value]";
  }
  try {
    const s = JSON.stringify(
      data,
      (_, v) => (typeof v === "bigint" ? v.toString() : v),
      2,
    );
    if (s.length > MAX_BODY_CHARS) {
      return `${s.slice(0, MAX_BODY_CHARS)}\n… (truncated, ${s.length} chars total)`;
    }
    return s;
  } catch {
    return "[could not stringify response]";
  }
}

type MedusaLike = {
  client: {
    fetch: (input: string | URL, init?: object) => Promise<unknown>;
  };
};

/**
 * Wraps `sdk.client.fetch` so successful JSON responses are logged to stdout.
 * Enable with `MEDUSA_LOG_RESPONSES=true` (server / Docker storefront only).
 */
export function attachMedusaResponseLogger(sdk: MedusaLike) {
  if (!shouldLogMedusaResponses()) return;

  const client = sdk.client;
  const original = client.fetch.bind(client);

  client.fetch = async (input, init) => {
    const path = formatInput(input);
    const started = Date.now();
    try {
      const data = await original(input, init);
      const ms = Date.now() - started;
      console.info(`[Medusa response] ${ms}ms ${path}\n${safeStringify(data)}`);
      return data;
    } catch (err) {
      const ms = Date.now() - started;
      console.error(`[Medusa response error] ${ms}ms ${path}`, err);
      throw err;
    }
  };
}
