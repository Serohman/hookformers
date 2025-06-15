import {PipelineType, pipeline} from "@huggingface/transformers";
import {useCallback} from "react";

// const foo = await pipeline("text-classification", "bla");
// const bar = await tt("sdsd");

export function useTransformer<TPipelineOptions, TPipelineInput, TPipelineOutput>(task: PipelineType, model: string) {
  const predict = useCallback(
    async (input: TPipelineInput, options?: TPipelineOptions): Promise<TPipelineOutput> => {
      const pipelineInstance: any = await pipeline(task, model);
      return pipelineInstance(input, options) as TPipelineOutput;
    },
    [model, task]
  );

  return {predict};
}
