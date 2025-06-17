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

        // Handle user's custom progress callback
        const userProgressCallback = modelOptions?.progress_callback;
        const finalProgressCallback = userProgressCallback
          ? (progress: ProgressInfo) => {
              userProgressCallback(progress); // Call user's callback first
              progressCallback(progress); // Then call ours for loadingInfo
            }
          : progressCallback;

        const pipelineInstance = await pipeline(task, model, {
          ...modelOptions,
          progress_callback: finalProgressCallback,
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
          handleError(error, "loading", "Failed to load model");
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

      if (state.status === "processing") {
        return null;
      } else {
        setState((prev) => ({...prev, status: "processing", errorInfo: null})); // Clear previous errors when starting new prediction
      }

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
        handleError(error, "processing", "Prediction failed");
        throw error; // Still need to re-throw for predict
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

  const handleError = useCallback((error: unknown, phase: "loading" | "processing", defaultMessage: string) => {
    const errorInfo: ErrorInfo = {
      message: error instanceof Error ? error.message : defaultMessage,
      cause: error,
      phase,
    };

    if (phase === "loading") {
      setState({
        pipeline: null,
        status: "error",
        result: null,
        errorInfo,
        loadingInfo: null,
      });
    } else {
      setState((prev) => ({
        ...prev,
        status: "error",
        result: null,
        errorInfo,
      }));
    }
  }, []);

  if (state.status === "idle" && state.pipeline) {
    return {status: "idle", predict, result: null, reset, errorInfo: null, loadingInfo: null};
  } else if (state.status === "success") {
    if (!state.pipeline || !state.result) {
      return {
        status: "error" as const,
        predict: null,
        result: null,
        reset,
        errorInfo: {
          message: "Internal hook error - please try again",
          phase: "processing" as const,
        },
        loadingInfo: null,
      };
    }
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
  } else if (state.status === "error") {
    if (!state.errorInfo) {
      return {
        status: "error" as const,
        predict: null,
        result: state.result,
        reset,
        errorInfo: {
          message: "Internal hook error occurred",
          phase: "loading" as const,
        },
        loadingInfo: null,
      };
    }
    return {
      status: "error",
      predict: null,
      result: state.result,
      reset,
      errorInfo: state.errorInfo,
      loadingInfo: null,
    };
  } else {
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
