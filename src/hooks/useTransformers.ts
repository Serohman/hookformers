import {PipelineType, PretrainedModelOptions, pipeline} from "@huggingface/transformers";
import {useCallback} from "react";

// const foo = await pipeline("text-classification", "bla");
// const bar = await foo("sdsd");

export function useTransformer<TPipelineOptions, TPipelineInput, TPipelineOutput>(
  task: PipelineType,
  model: string,
  modelOptions?: PretrainedModelOptions
) {
  const predict = useCallback(
    async (input: TPipelineInput, options?: TPipelineOptions): Promise<TPipelineOutput> => {
      const pipelineInstance: any = await pipeline(task, model, modelOptions);
      return pipelineInstance(input, options) as TPipelineOutput;
    },
    [model, task]
  );

  return {predict};
}
