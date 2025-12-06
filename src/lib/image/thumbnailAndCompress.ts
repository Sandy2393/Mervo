// Simple client-side image compression

export async function compressImage(file: File, maxWidth = 1200, quality = 0.7): Promise<{ blob: Blob; sizeEstimate: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject("Canvas context not available");
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob((blob) => {
          if (!blob) return reject("Blob creation failed");
          resolve({ blob, sizeEstimate: blob.size });
        }, "image/jpeg", quality);
      };
      img.onerror = () => reject("Image load failed");
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject("FileReader error");
    reader.readAsDataURL(file);
  });
}
