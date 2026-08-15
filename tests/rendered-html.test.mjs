import assert from "node:assert/strict";
import test from "node:test";

const developmentPreviewMeta =
  /<meta(?=[^>]*\bname=["']codex-preview["'])(?=[^>]*\bcontent=["']development["'])[^>]*>/i;

test("renders development preview metadata", async () => {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  const response = await worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );

  assert.equal(response.status, 200);
  assert.match(
    response.headers.get("content-type") ?? "",
    /^text\/html\b/i,
  );
  assert.match(await response.text(), developmentPreviewMeta);
});

test("renders every public route and preserves a real 404 boundary", async () => {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("routes", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  const context = {
    waitUntil() {},
    passThroughOnException() {},
  };
  const env = {
    ASSETS: {
      fetch: async () => new Response("Not found", { status: 404 }),
    },
  };

  for (const route of ["/", "/explore", "/exercises"]) {
    const response = await worker.fetch(new Request("http://localhost" + route, { headers: { accept: "text/html" } }), env, context);
    assert.equal(response.status, 200, route);
    assert.match(await response.text(), /<h1\b/i, route);
  }

  const removedMethod = await worker.fetch(new Request("http://localhost/method", { headers: { accept: "text/html" } }), env, context);
  assert.equal(removedMethod.status, 404);

  const missing = await worker.fetch(new Request("http://localhost/does-not-exist", { headers: { accept: "text/html" } }), env, context);
  assert.equal(missing.status, 404);
});
