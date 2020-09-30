#include "xsAll.h"
#include "xs.h"

// #include "xsmc.h"

void createVatFromSource1(xsMachine *the) {
    fprintf(stderr, "entering createVatFromSource1\n");
    char *source = xsToString(xsArg(0));

    struct xsMachine *newMachine;
    // todo: get these values from JS arguments
    xsCreation _creation = {
        16 * 1024 * 1024, 	/* initialChunkSize */
        16 * 1024 * 1024, 	/* incrementalChunkSize */
        1 * 1024 * 1024, 	/* initialHeapCount */
        1 * 1024 * 1024, 	/* incrementalHeapCount */
        4096, 				/* stackCount */
        4096*3, 			/* keyCount */
        1993, 				/* nameModulo */
        127, 				/* symbolModulo */
        64 * 1024,			/* parserBufferSize */
        1993,				/* parserTableModulo */
    };
    xsCreation* creation = &_creation;
    xsMachine* machine;
    void *context = NULL;
    fprintf(stderr, "about to xsCreateMachine\n");
    newMachine = xsCreateMachine(creation, "vat", context);
    fprintf(stderr, "did xsCreateMachine %p\n", newMachine);
    if (!newMachine) {
        fprintf(stderr, "cannot allocate new machine\n"); // TODO remove before production
        xsUnknownError("cannot allocate new machine");
    }
    xsResult = xsUndefined;
}

