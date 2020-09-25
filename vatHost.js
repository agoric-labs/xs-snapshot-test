const { freeze } = Object; // cf. harden

function testLog(...args) {
  trace(`TEST: ${JSON.stringify(args)}\n`);
}

function main(port) {
  const clist = {};
  let nextSlot = 1;

  const vatCmp = new Compartment();
  const handle = freeze(async ([type, ...margs]) => {
    trace(`vatHost handling: ${JSON.stringify([type, ...margs])}\n`);

    switch (type) {
      case "setBundle":
        {
          const [bundle] = margs;
          const buildRoot = vatCmp.evaluate(bundle);
          clist[`slot${nextSlot++}`] = buildRoot({ testLog });
          port.postMessage("ok");
        }
        break;
      case "deliver":
        {
          const [dtype, targetRef, { method, args }] = margs;
          const target = clist[targetRef];
          const result = target[method](...args);
          port.postMessage(result);
        }
        break;
      default:
        throw new Error(type);
    }
  });

  port.onmessage = handle;
}

main(self);
