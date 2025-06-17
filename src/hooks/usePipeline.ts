import {
  ImageSegmentationPipeline,
  PretrainedModelOptions,
  TextClassificationPipeline,
  pipeline,
} from "@huggingface/transformers";
import {useCallback, useEffect, useState} from "react";

type TaskToPipelineMap = {
  "text-classification": TextClassificationPipeline;
  "image-segmentation": ImageSegmentationPipeline;
};

type PipelineTask = keyof TaskToPipelineMap;

type UsePipelineStatus = "loading" | "idle" | "processing" | "success" | "error";

// Extract the return type from the pipeline's predict method
type PipelineResult<T extends PipelineTask> = Awaited<ReturnType<TaskToPipelineMap[T]>>;

type UsePipelineState<T extends PipelineTask> = {
  pipeline: TaskToPipelineMap[T] | null;
  status: UsePipelineStatus;
  result: PipelineResult<T> | null;
};

// Extract the function signature from the pipeline type
type PipelinePredict<T extends PipelineTask> = TaskToPipelineMap[T] extends (...args: infer P) => infer R
  ? (...args: P) => Promise<R>
  : never;

// Updated discriminated union return type with result
type UsePipelineOutput<T extends PipelineTask> =
  | {status: "idle"; predict: PipelinePredict<T>; result: null; reset: () => void}
  | {status: "success"; predict: PipelinePredict<T>; result: PipelineResult<T>; reset: () => void}
  | {status: "loading" | "processing" | "error"; predict: null; result: PipelineResult<T> | null; reset: () => void};

export function usePipeline<T extends PipelineTask>(
  task: T,
  model: string,
  modelOptions?: PretrainedModelOptions
): UsePipelineOutput<T> {
  const [state, setState] = useState<UsePipelineState<T>>({
    pipeline: null,
    status: "loading",
    result: null,
  });

  useEffect(() => {
    let cancelled = false;

    const loadPipeline = async () => {
      setState((prev) => ({...prev, status: "loading", result: null})); // Clear result on model change

      try {
        const pipelineInstance = await pipeline(task, model, modelOptions);

        if (!cancelled) {
          setState({
            pipeline: pipelineInstance as TaskToPipelineMap[T],
            status: "idle",
            result: null, // Fresh start with new model
          });
        }
      } catch (error) {
        if (!cancelled) {
          setState({
            pipeline: null,
            status: "error",
            result: null, // Clear result on model loading error
          });
        }
      }
    };

    loadPipeline();

    return () => {
      cancelled = true;
    };
  }, [task, model, JSON.stringify(modelOptions)]);

  const predict = useCallback(
    // Disabling `no-explicit-any` for the 2 lines below does not harm the public API typings in any way, its effect is limited to this function.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (async (...args: any[]) => {
      if (!state.pipeline) return null;

      setState((prev) => ({...prev, status: "processing"})); // Keep previous result during processing

      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result = await (state.pipeline as any)(...args);
        setState((prev) => ({
          ...prev,
          status: "success",
          result: result as PipelineResult<T>, // Update result on successful prediction
        }));
        return result;
      } catch (error) {
        setState((prev) => ({
          ...prev,
          status: "error",
          result: null, // Clear result on prediction error
        }));
        throw error;
      }
    }) as PipelinePredict<T>,
    [state.pipeline]
  );

  const reset = useCallback(() => {
    setState((prev) => ({
      ...prev,
      status: "idle",
      result: null,
    }));
  }, []);

  if (state.status === "idle" && state.pipeline) {
    return {status: "idle", predict, result: null, reset};
  } else if (state.status === "success" && state.pipeline && state.result) {
    return {status: "success", predict, result: state.result, reset};
  } else {
    return {
      status: state.status as "loading" | "processing" | "error",
      predict: null,
      result: state.result,
      reset,
    };
  }
}
