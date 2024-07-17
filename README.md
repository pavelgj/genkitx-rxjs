## genkitx-rxjs

A simple RxJS helper/adapter for Firebase Genkit.

Allows defining flows that work with Observables:

```ts
import { defineRxFlow } from 'genkitx-rxjs';

export const myRxFlow = defineRxFlow(
  { name: "myRxFlow", inputSchema: z.string(), outputSchema: z.number() },
  (input) => input.pipe(map(parseInt))
);
```

Makes it easy to use flows as an operator function:

```ts
export const parse = defineRxFlow(
  { name: "parse", inputSchema: z.string(), outputSchema: z.number() },
  (input) => input.pipe(map(parseInt))
);

const OutputSchema = z.object({
  originalNumber: z.number(),
  incrementedNumber: z.number(),
});

export const numberPlusPlus = defineFlow(
  { name: "incrementBy", inputSchema: z.number(), outputSchema: OutputSchema },
  async (num) => {
    return { originalNumber: num, incrementedNumber: num + 1 };
  }
);

export const myRxFlow = defineRxFlow(
  { name: "myRxFlow", inputSchema: z.string(), outputSchema: OutputSchema },
  (input) =>
    input.pipe(
      rxFlowRun(parse),
      rxFlowRun(numberPlusPlus)
    )
);
```

`rxFlowRun` can both RxFlows (`defineRxFlow`) and vanilla flows (`defineFlow`).