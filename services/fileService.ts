import { supabase } from '../lib/supabase';
import { StoredFile } from '../types';

const BUCKET_NAME = 'sainath-uploads';

export const fileService = {
  // Get all files
  async getAllFiles(): Promise<StoredFile[]> {
    const { data, error } = await supabase
      .from('stored_files')
      .select('*')
      .order('upload_date', { ascending: false });

    if (error) throw error;

    return data.map(file => ({
      id: file.id,
      uploadedById: file.uploaded_by_id,
      name: file.name,
      filePath: file.file_path,
      uploadDate: file.upload_date,
    }));
  },

  // Upload file to Supabase Storage
  async uploadFile(uploadedById: string, file: File): Promise<StoredFile> {
    // Generate unique file path
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${uploadedById}/${fileName}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    // Save file metadata to database
    const { data, error } = await supabase
      .from('stored_files')
      .insert({
        uploaded_by_id: uploadedById,
        name: file.name,
        file_path: filePath,
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      uploadedById: data.uploaded_by_id,
      name: data.name,
      filePath: data.file_path,
      uploadDate: data.upload_date,
    };
  },

  // Get file public URL
  getFileUrl(filePath: string): string {
    const { data: { publicUrl } } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);
    
    return publicUrl;
  },

  // Delete file
  async deleteFile(fileId: string, filePath: string) {
    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([filePath]);

    if (storageError) throw storageError;

    // Delete from database
    const { error } = await supabase
      .from('stored_files')
      .delete()
      .eq('id', fileId);

    if (error) throw error;
  },
};
