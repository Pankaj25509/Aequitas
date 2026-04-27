import * as mobilenet from "@tensorflow-models/mobilenet";
import * as tf from "@tensorflow/tfjs";

let model = null;

// Load model once
export const loadModel = async () => {
  try {
    model = await mobilenet.load();
    console.log("AI model loaded");
  } catch (err) {
    console.error("Model load failed", err);
  }
};

// Main AI function
export const analyzeFoodImage = async (imageElement) => {
  try {
    if (!model) return "AI not ready ⏳";

    // -----------------------------
    // 1. Object detection (MobileNet)
    // -----------------------------
    const predictions = await model.classify(imageElement);
    const top = predictions[0];

    // -----------------------------
    // 2. Brightness detection
    // -----------------------------
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    // safety fallback size
    const width = imageElement.naturalWidth || 224;
    const height = imageElement.naturalHeight || 224;

    canvas.width = width;
    canvas.height = height;

    ctx.drawImage(imageElement, 0, 0, width, height);

    const imageData = ctx.getImageData(0, 0, width, height).data;

    let brightness = 0;

    for (let i = 0; i < imageData.length; i += 4) {
      brightness += (imageData[i] + imageData[i + 1] + imageData[i + 2]) / 3;
    }

    const avgBrightness = brightness / (imageData.length / 4);

    // -----------------------------
    // 3. Combine logic
    // -----------------------------
    let freshness;

    if (avgBrightness > 150) freshness = "Fresh ✅";
    else if (avgBrightness > 100) freshness = "Okay ⚠️";
    else freshness = "Not Fresh ❌";

    return freshness;

  } catch (err) {
    console.error("AI error:", err);
    return "AI failed ❌";
  }
};