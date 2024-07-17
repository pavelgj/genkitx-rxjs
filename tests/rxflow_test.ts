import { defineFlow, runFlow } from "@genkit-ai/flow";
import assert from "node:assert";
import { describe, it } from "node:test";
import { map } from "rxjs";
import { z } from "zod";
import { defineRxFlow, rxFlowRun } from "../src";

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

export const rxFlow = defineRxFlow(
  { name: "rxFlow", inputSchema: z.string(), outputSchema: OutputSchema },
  (input) =>
    input.pipe(
      map((input) => `1${input}`), // fust for fun, prepend 1
      rxFlowRun(parse),
      rxFlowRun(numberPlusPlus)
    )
);

describe("rxflow", () => {
  it("should run the flow", async () => {
    const result = await runFlow(rxFlow, "23");

    assert.deepStrictEqual(result, {
      originalNumber: 123,
      incrementedNumber: 124,
    });
  });
});
