import { useCallback } from "react";

export function useImageCompression() {
  return useCallback(async (file: File): Promise<string> => {
    const imageUrl = URL.createObjectURL(file);

    try {
      const image = await new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error("No se pudo leer la imagen"));
        img.src = imageUrl;
      });

      const maxSize = 512;
      const scale = Math.min(maxSize / image.width, maxSize / image.height, 1);
      const width = Math.max(1, Math.round(image.width * scale));
      const height = Math.max(1, Math.round(image.height * scale));

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const context = canvas.getContext("2d");

      if (!context) {
        throw new Error("No se pudo preparar la imagen");
      }

      context.drawImage(image, 0, 0, width, height);

      return canvas.toDataURL("image/jpeg", 0.8);
    } finally {
      URL.revokeObjectURL(imageUrl);
    }
  }, []);
}
