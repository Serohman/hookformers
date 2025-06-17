import {
  ImageSegmentationPipeline,
  PretrainedModelOptions,
  ProgressInfo,
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

type ErrorInfo = {
  message: string;
  cause?: unknown;
  phase: "loading" | "processing";
};

type LoadingInfo = ProgressInfo;

// Extract the return type from the pipeline's predict method
type PipelineResult<T extends PipelineTask> = Awaited<ReturnType<TaskToPipelineMap[T]>>;

type UsePipelineState<T extends PipelineTask> = {
  pipeline: TaskToPipelineMap[T] | null;
  status: UsePipelineStatus;
  result: PipelineResult<T> | null;
  errorInfo: ErrorInfo | null;
  loadingInfo: LoadingInfo | null;
};

// Extract the function signature from the pipeline type
type PipelinePredict<T extends PipelineTask> = TaskToPipelineMap[T] extends (...args: infer P) => infer R
  ? (...args: P) => Promise<R>
  : never;

// Updated discriminated union return type with result
type UsePipelineOutput<T extends PipelineTask> =
  | {status: "idle"; predict: PipelinePredict<T>; result: null; reset: () => void; errorInfo: null; loadingInfo: null}
  | {
      status: "success";
      predict: PipelinePredict<T>;
      result: PipelineResult<T>;
      reset: () => void;
      errorInfo: null;
      loadingInfo: null;
    }
  | {
      status: "loading";
      predict: null;
      result: PipelineResult<T> | null;
      reset: () => void;
      errorInfo: ErrorInfo | null;
      loadingInfo: LoadingInfo | null;
    }
  | {
      status: "processing";
      predict: null;
      result: PipelineResult<T> | null;
      reset: () => void;
      errorInfo: null;
      loadingInfo: null;
    }
  | {
      status: "error";
      predict: null;
      result: PipelineResult<T> | null;
      reset: () => void;
      errorInfo: ErrorInfo;
      loadingInfo: null;
    };

export function usePipeline<T extends PipelineTask>(
  task: T,
  model: string,
  modelOptions?: PretrainedModelOptions
): UsePipelineOutput<T> {
  const [state, setState] = useState<UsePipelineState<T>>({
    pipeline: null,
    status: "loading",
    result: null,
    errorInfo: null,
    loadingInfo: null,
  });

  useEffect(() => {
    let cancelled = false;

    const loadPipeline = async () => {
      setState((prev) => ({...prev, status: "loading", result: null, errorInfo: null, loadingInfo: null})); // Clear all state on model change

      try {
        const progressCallback = (progress: ProgressInfo) => {
          if (!cancelled) {
            setState((prev) => ({...prev, loadingInfo: progress}));
          }
        };

        const pipelineInstance = await pipeline(task, model, {
          ...modelOptions,
          progress_callback: progressCallback,
        });

        if (!cancelled) {
          setState({
            pipeline: pipelineInstance as TaskToPipelineMap[T],
            status: "idle",
            result: null, // Fresh start with new model
            errorInfo: null,
            loadingInfo: null, // Clear loading info when complete
          });
        }
      } catch (error) {
        if (!cancelled) {
          setState({
            pipeline: null,
            status: "error",
            result: null, // Clear result on model loading error
            errorInfo: {
              message: error instanceof Error ? error.message : "Failed to load model",
              cause: error,
              phase: "loading",
            },
            loadingInfo: null, // Clear loading info on error
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

      setState((prev) => ({...prev, status: "processing", errorInfo: null})); // Clear previous errors when starting new prediction

      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result = await (state.pipeline as any)(...args);
        setState((prev) => ({
          ...prev,
          status: "success",
          result: result as PipelineResult<T>, // Update result on successful prediction
          errorInfo: null, // Clear any previous errors
        }));
        return result;
      } catch (error) {
        setState((prev) => ({
          ...prev,
          status: "error",
          result: null, // Clear result on prediction error
          errorInfo: {
            message: error instanceof Error ? error.message : "Prediction failed",
            cause: error,
            phase: "processing",
          },
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
      errorInfo: null,
      loadingInfo: null,
    }));
  }, []);

  if (state.status === "idle" && state.pipeline) {
    return {status: "idle", predict, result: null, reset, errorInfo: null, loadingInfo: null};
  } else if (state.status === "success" && state.pipeline && state.result) {
    return {status: "success", predict, result: state.result, reset, errorInfo: null, loadingInfo: null};
  } else if (state.status === "loading") {
    return {
      status: "loading",
      predict: null,
      result: state.result,
      reset,
      errorInfo: state.errorInfo,
      loadingInfo: state.loadingInfo,
    };
  } else if (state.status === "processing") {
    return {
      status: "processing",
      predict: null,
      result: state.result,
      reset,
      errorInfo: null,
      loadingInfo: null,
    };
  } else if (state.status === "error" && state.errorInfo) {
    return {
      status: "error",
      predict: null,
      result: state.result,
      reset,
      errorInfo: state.errorInfo,
      loadingInfo: null,
    };
  } else {
    // Fallback case - handles any unexpected state combinations
    return {
      status: "error" as const,
      predict: null,
      result: null,
      reset,
      errorInfo: {
        message: "Hook is in an invalid state",
        phase: "loading" as const,
      },
      loadingInfo: null,
    };
  }
}
