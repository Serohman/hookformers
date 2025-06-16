import {
  PretrainedModelOptions,
  TextClassificationOutput,
  TextClassificationPipelineOptions,
} from "@huggingface/transformers";
import {useTransformer} from "./useTransformers";

export function useTextClassification(model: string, options?: PretrainedModelOptions) {
  return useTransformer<
    TextClassificationPipelineOptions,
    string | string[],
    TextClassificationOutput | TextClassificationOutput[]
  >("text-classification", model, options);
}
