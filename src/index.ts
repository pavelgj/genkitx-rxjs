import { StreamingCallback } from '@genkit-ai/core';
import { defineFlow, Flow, FlowAuthPolicy, runFlow } from '@genkit-ai/flow';
import express from 'express';
import {
  firstValueFrom,
  mergeMap,
  Observable,
  of,
  OperatorFunction,
} from 'rxjs';
import z from 'zod';

/**
 * Defines a Genkit flow that turns inputs into an Observable.
 */
export function defineRxFlow<
  I extends z.ZodTypeAny = z.ZodTypeAny,
  O extends z.ZodTypeAny = z.ZodTypeAny,
  S extends z.ZodTypeAny = z.ZodTypeAny,
>(
  config: {
    name: string;
    inputSchema?: I;
    outputSchema?: O;
    streamSchema?: S;
    authPolicy?: FlowAuthPolicy<I>;
    middleware?: express.RequestHandler[];
  },
  rxfn: (input: Observable<z.infer<I>>, streamingCallback: StreamingCallback<z.infer<S>> | undefined) => Observable<z.infer<O>>
) {
  return defineFlow(config, (input, streamingCallback) => {
    return firstValueFrom(rxfn(of(input), streamingCallback));
  });
}

/**
 * An helper RxJS operator function for running flows againts the observable.
 * It's identical to mergeMap+runFlow.
 */
export function rxFlowRun<
  I extends z.ZodTypeAny = z.ZodTypeAny,
  O extends z.ZodTypeAny = z.ZodTypeAny,
  S extends z.ZodTypeAny = z.ZodTypeAny,
>(flow: Flow<I, O, S>): OperatorFunction<z.infer<I>, z.infer<O>> {
  return (source) =>
    source.pipe(
      mergeMap(async (input) => {
        return await runFlow(flow, input);
      })
    );
}
