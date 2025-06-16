import {PretrainedModelOptions} from "@huggingface/transformers";
import {usePipeline} from "./usePipeline";

export function useImageSegmentation(model: string, modelOptions?: PretrainedModelOptions) {
  return usePipeline("image-segmentation", model, modelOptions);
}
