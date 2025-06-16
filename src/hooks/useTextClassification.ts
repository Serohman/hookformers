import {PretrainedModelOptions} from "@huggingface/transformers";
import {usePipeline} from "./usePipeline";

export function useTextClassification(model: string, modelOptions?: PretrainedModelOptions) {
  return usePipeline("text-classification", model, modelOptions);
}
