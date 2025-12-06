export class PhotoService {
  constructor(private audit: (entry: any) => void = () => {}) {}

  async validateAndStorePhoto(fileBuffer: Buffer, meta: { company_id: string; job_instance_id: string; type: "before" | "after" }) {
    if (!fileBuffer || fileBuffer.length === 0) throw new Error("empty file");
    const path = `company/${meta.company_id}/jobs/${meta.job_instance_id}/photos/${meta.type}/${crypto.randomUUID()}.jpg`;
    // TODO: store in object storage and return signed URL
    this.audit({ action: "photo.store", path, meta });
    return { path, size: fileBuffer.length };
  }

  async resizeAndCompressPlaceholder(_fileBuffer: Buffer) {
    // TODO: implement real compression
    return _fileBuffer;
  }
}
