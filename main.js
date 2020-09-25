/*
 * based on Moddable worker example
 */

import Worker from "worker";
import { File } from "file";

function traceln(txt) {
  trace(txt);
  trace("\n");
}

function bundleSource(vatSrc) {
  traceln("bundleSource reading...", vatSrc);
  return new File(vatSrc).read(String);
}

function makePromiseKit() {
  let resolve, reject;
  const promise = new Promise((win, lose) => {
    resolve = win;
    reject = lose;
  });
  return { promise, resolve, reject };
}

export async function main() {
  let vatWorker = new Worker("vatHost", {
    allocation: 6 * 1024,
    stackCount: 64,
    slotCount: 32,
  });

  let sync = makePromiseKit();
  vatWorker.onmessage = function (message) {
    trace("from vatHost: ");
    traceln(message);
    sync.resolve();
    sync = makePromiseKit();
  };
  const post = (msg) => vatWorker.postMessage(msg);

  const aliceVatSrc = bundleSource("./alice-vat.js");

  traceln("setBundle...");
  post(["setBundle", aliceVatSrc]);
  await sync.promise;
  // snapshot the vatWorker?

  traceln("deliver...");
  post(["deliver", "message", "slot1", { method: "incr", args: [] }]);
  await sync.promise;
  post(["deliver", "message", "slot1", { method: "incr", args: [] }]);
  await sync.promise;
  // snapshot the vatWorker?
  post(["deliver", "message", "slot1", { method: "decr", args: [] }]);
  await sync.promise;
  post(["deliver", "message", "slot1", { method: "incr", args: [] }]);
  await sync.promise;

  traceln("demo concludes.");
}

main().catch((err) => traceln(err));
