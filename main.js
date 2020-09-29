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
  let sync = makePromiseKit();
  let post;
  function connectToWorker(vatWorker) {
    vatWorker.onmessage = function (message) {
      trace("from vatHost: ");
      traceln(message);
      sync.resolve();
      sync = makePromiseKit();
    };
    const post = (msg) => vatWorker.postMessage(msg);
    return { post };
  }

  let vatWorker1 = new Worker("vatHost", {
    allocation: 6 * 1024,
    stackCount: 64,
    slotCount: 32,
  });
  post = connectToWorker(vatWorker1);


  const aliceVatSrc = bundleSource("./alice-vat.js");
  traceln("setBundle...");
  post(["setBundle", aliceVatSrc]);
  await sync.promise;

  // snapshot the vatWorker
  const snapshot1 = MAKE_SNAPSHOT(vatWorker1);
  // stop using vatWorker1


  // now pretend that the process has just relaunched, and that we'd saved
  // snapshot1 in a way that we can reload. Make a new Worker from that
  // snapshot.
  const vatWorker2 = LOAD_SNAPSHOT(snapshot1);
  post = connectToWorker(vatWorker2);
  traceln("deliver...");
  post(["deliver", "message", "slot1", { method: "incr", args: [] }]);
  await sync.promise;
  post(["deliver", "message", "slot1", { method: "incr", args: [] }]);
  await sync.promise;
  // snapshot the vatWorker
  const snapshot2 = MAKE_SNAPSHOT(vatWorker2);


  // pretend we're relaunching the process again
  const vatWorker3 = LOAD_SNAPSHOT(snapshot2);
  post = connectToWorker(vatWorker3);
  post(["deliver", "message", "slot1", { method: "decr", args: [] }]);
  await sync.promise;
  post(["deliver", "message", "slot1", { method: "incr", args: [] }]);
  await sync.promise;

  traceln("demo concludes.");
}

main().catch((err) => traceln(err));
