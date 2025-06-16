import {
  ImagePipelineInputs,
  ImageSegmentationPipelineOptions,
  ImageSegmentationPipelineOutput,
  PretrainedModelOptions,
} from "@huggingface/transformers";
import {useTransformer} from "./useTransformers";

export function useImageSegmentation(model: string, options?: PretrainedModelOptions) {
  return useTransformer<ImageSegmentationPipelineOptions, ImagePipelineInputs, ImageSegmentationPipelineOutput>(
    "image-segmentation",
    model,
    options
  );
}
