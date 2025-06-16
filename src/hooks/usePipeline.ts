import {
  ImageSegmentationPipeline,
  PretrainedModelOptions,
  TextClassificationPipeline,
  pipeline,
} from "@huggingface/transformers";
import {useEffect, useState} from "react";

type TaskToPipelineMap = {
  "text-classification": TextClassificationPipeline;
  "image-segmentation": ImageSegmentationPipeline;
};

type PipelineTask = keyof TaskToPipelineMap;

type UsePipelineStatus = "loading" | "idle" | "processing" | "error";

type UsePipelineState<T extends PipelineTask> = {
  predict: TaskToPipelineMap[T] | null;
  status: UsePipelineStatus;
};

export function usePipeline<T extends PipelineTask>(
  task: T,
  model: string,
  modelOptions?: PretrainedModelOptions
): UsePipelineState<T> {
  const [state, setState] = useState<UsePipelineState<T>>({
    predict: null,
    status: "loading",
  });

  useEffect(() => {
    let cancelled = false;

    const loadPipeline = async () => {
      setState((prev) => ({...prev, loading: true, error: null}));

      try {
        const pipelineInstance = await pipeline(task, model, modelOptions);

        if (!cancelled) {
          setState({
            predict: pipelineInstance,
            status: "idle",
          });
        }
      } catch (error) {
        if (!cancelled) {
          setState({
            predict: null,
            status: "error",
          });
        }
      }
    };

    loadPipeline();

    return () => {
      cancelled = true;
    };
  }, [task, model, JSON.stringify(modelOptions)]);

  return state;
}
