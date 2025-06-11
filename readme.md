> [!CAUTION]
> Package under active development. Do not use on production.

The power of Transformers.js with the simplicity of React Hooks.

Hookformers makes integrating powerful AI models into your React app as easy as fetching data. Stop freezing your UI and writing messy, repetitive boilerplate code.

Why Hookformers?

- 🚀 **Effortless Performance**: We automatically run models in a separate thread (Web Worker) so your app stays fast and responsive. You get all the power of on-device AI without the performance hit.
- 📦 **Zero Boilerplate**: Get the full state (status, progress, error, output) out-of-the-box for every hook. Stop managing loading flags and focus on your UI.
- ✨ **Simple & Predictable**: A clean hook for dozens of AI tasks, like useTextClassification, useImageToText, and useObjectDetection.
- 🧠 **Intelligent Caching**: Models are downloaded and initialized only once, then efficiently reused across your entire application.

Think of it like SWR or react-query, but for AI models. We handle the caching, background processing, and state management so you can focus on building your product.

# Getting Started

```bash
npm install hookformers @huggingface/transformers
```

```js
import {useTextClassification} from "hookformers";

function MySentimentAnalyzer() {
  const {predict, output, status} = useTextClassification("Xenova/distilbert-base-uncased-finetuned-sst-2-english");

  if (status === "loading") return <p>Loading model...</p>;

  return (
    <div>
      <button onClick={() => predict("Hookformers is awesome!")}>Analyze</button>
      {output && <p>Result: {output[0].label}</p>}
    </div>
  );
}
```
