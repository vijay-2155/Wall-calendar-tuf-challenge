/**
 * Samples the dominant color from an image URL using an off-screen canvas.
 * Used to dynamically shift the accent color to match each month's photo.
 * Returns an rgb() string, e.g. "rgb(29, 161, 224)".
 */
export async function extractDominantColor(src: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width  = 10;
      canvas.height = 10;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, 10, 10);

      const { data } = ctx.getImageData(0, 0, 10, 10);
      let r = 0, g = 0, b = 0;

      for (let i = 0; i < data.length; i += 4) {
        r += data[i];
        g += data[i + 1];
        b += data[i + 2];
      }

      const pixelCount = data.length / 4;
      resolve(
        `rgb(${Math.round(r / pixelCount)},${Math.round(g / pixelCount)},${Math.round(b / pixelCount)})`
      );
    };
    img.onerror = () => resolve("rgb(29,161,224)"); // fallback to brand blue
    img.src = src;
  });
}
