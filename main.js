import { createVatFromSource } from "glue";
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

// our global scope has the following C functions defined:
// createVatFromSource(source, syscall) -> { sendToVat, createSnapshot, deleteVat }
// createVatFromSnapshot(snapshot, syscall) -> { sendToVat, createSnapshot, deleteVat }

const vats = new Map();
const snapshots = new Map();

async function createVat(index, vatBundle) {
  traceln("in createVat");
  const syscall = {
    send(...args) { return 'results'; },
  };
  const vatHost = bundleSource('./vatHost.js');
  traceln(`vatHost has ${vatHost.length} bytes`);
  const tools = createVatFromSource(vatHost, syscall);
  //await tools.sendToVat(['loadBundle', vatBundle]);
  //vats.set(index, tools);
}

export default async function main() {
  const aliceVatSrc = bundleSource("./alice-vat.js");
  traceln("setBundle...");
  await createVat('alice', aliceVatSrc);
  traceln("back from createVat");

  //await suspendVat('alice');

  //await reloadVat('alice');
  //await sendToVat('index', 'incr');
  //await suspendVat('alice');

  //await reloadVat('alice');
  //await sendToVat('index', 'incr');
  //await suspendVat('alice');

  //await reloadVat('alice');
  //await sendToVat('index', 'decr');
  //await suspendVat('alice');

  traceln("demo concludes.");
}

//main().catch((err) => traceln(err));


/*
async function suspendVat(index) {
  const { createSnapshot, deleteVat } = vats.get(index);
  snapshots.set(index, createSnapshot());
  deleteVat();
  vats.delete(index);
}


async function reloadVat(index) {
  const snapshot = snapshots.get(index);
  snapshots.delete(index);
  const syscall = {
    send(...args) { return 'results'; },
  };
  vats.set(index, createVatFromSnapshot(snapshot, syscall));
}

async function sendToVat(index, method, ...args) {
  const { sendToVat } = vats.get(index);
  sendToVat(['deliver', 'message', 'slot1', { method, args }]);
}
*/
