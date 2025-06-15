import {
  ImagePipelineInputs,
  ImageSegmentationPipelineOptions,
  ImageSegmentationPipelineOutput,
} from "@huggingface/transformers";
import {useTransformer} from "./useTransformers";

export function useImageSegmentation(model: string) {
  return useTransformer<ImageSegmentationPipelineOptions, ImagePipelineInputs, ImageSegmentationPipelineOutput>(
    "image-segmentation",
    model
  );
}
