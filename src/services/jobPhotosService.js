/**
 * Job Photos Service — Upload photos, metadata, compression
 */
import { supabase } from '../lib/supabase';
class JobPhotosService {
    /**
     * Compress image client-side
     * Returns base64 or File object
     */
    async compressImage(file, maxWidth = 1024, maxHeight = 1024, quality = 0.8) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;
                    if (width > height) {
                        if (width > maxWidth) {
                            height = Math.round((height * maxWidth) / width);
                            width = maxWidth;
                        }
                    }
                    else {
                        if (height > maxHeight) {
                            width = Math.round((width * maxHeight) / height);
                            height = maxHeight;
                        }
                    }
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx?.drawImage(img, 0, 0, width, height);
                    canvas.toBlob((blob) => {
                        resolve(blob || new Blob());
                    }, 'image/jpeg', quality);
                };
                img.src = e.target?.result;
            };
            reader.readAsDataURL(file);
        });
    }
    /**
     * Upload photo to job instance
     * TODO: Edge Function should handle Supabase Storage upload
     */
    async uploadPhoto(jobInstanceId, companyId, userId, file, metadata) {
        try {
            // Compress image
            const compressed = await this.compressImage(file);
            const fileName = `${jobInstanceId}-${Date.now()}.jpg`;
            const storagePath = `photos/${companyId}/${jobInstanceId}/${fileName}`;
            // Upload to Supabase Storage
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('job-photos')
                .upload(storagePath, compressed, {
                cacheControl: '3600',
                upsert: false
            });
            if (uploadError) {
                return {
                    success: false,
                    error: uploadError.message,
                    code: 'UPLOAD_ERROR'
                };
            }
            // Create job_photos record
            const { data, error } = await supabase
                .from('job_photos')
                .insert({
                job_instance_id: jobInstanceId,
                company_id: companyId,
                uploader_id: userId,
                storage_path: uploadData.path,
                metadata: metadata || {}
            })
                .select()
                .single();
            if (error) {
                return {
                    success: false,
                    error: error.message,
                    code: 'DB_ERROR'
                };
            }
            return { success: true, data };
        }
        catch (err) {
            return {
                success: false,
                error: err instanceof Error ? err.message : 'Unknown error',
                code: 'UNKNOWN'
            };
        }
    }
    /**
     * Get photos for job instance
     */
    async getJobPhotos(jobInstanceId) {
        try {
            const { data, error } = await supabase
                .from('job_photos')
                .select('*')
                .eq('job_instance_id', jobInstanceId)
                .order('created_at', { ascending: false });
            if (error) {
                return {
                    success: false,
                    error: error.message,
                    code: 'FETCH_ERROR'
                };
            }
            return { success: true, data: data || [] };
        }
        catch (err) {
            return {
                success: false,
                error: err instanceof Error ? err.message : 'Unknown error',
                code: 'UNKNOWN'
            };
        }
    }
    /**
     * Get signed URL for photo (if needed for download/display)
     */
    async getPhotoUrl(storagePath, expiresIn = 3600) {
        try {
            const { data, error } = await supabase.storage
                .from('job-photos')
                .createSignedUrl(storagePath, expiresIn);
            if (error) {
                return {
                    success: false,
                    error: error.message,
                    code: 'SIGNED_URL_ERROR'
                };
            }
            return { success: true, data: data.signedUrl };
        }
        catch (err) {
            return {
                success: false,
                error: err instanceof Error ? err.message : 'Unknown error',
                code: 'UNKNOWN'
            };
        }
    }
    /**
     * Delete photo
     */
    async deletePhoto(photoId, storagePath) {
        try {
            // Delete from storage
            const { error: storageError } = await supabase.storage
                .from('job-photos')
                .remove([storagePath]);
            if (storageError) {
                console.error('Storage delete error:', storageError);
                // Continue to delete DB record anyway
            }
            // Delete DB record
            const { error: dbError } = await supabase
                .from('job_photos')
                .delete()
                .eq('id', photoId);
            if (dbError) {
                return {
                    success: false,
                    error: dbError.message,
                    code: 'DELETE_ERROR'
                };
            }
            return { success: true, data: null };
        }
        catch (err) {
            return {
                success: false,
                error: err instanceof Error ? err.message : 'Unknown error',
                code: 'UNKNOWN'
            };
        }
    }
}
export const jobPhotosService = new JobPhotosService();
