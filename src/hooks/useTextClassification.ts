import {TextClassificationOutput, TextClassificationPipelineOptions} from "@huggingface/transformers";
import {useTransformer} from "./useTransformers";

export function useTextClassification(model: string) {
  return useTransformer<
    TextClassificationPipelineOptions,
    string | string[],
    TextClassificationOutput | TextClassificationOutput[]
  >("text-classification", model);
}
