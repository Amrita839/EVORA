import "server-only";
import { createSupabaseServiceClient } from "@/lib/auth/supabase-server";

const BUCKET = "product-images";

/**
 * Uploads a file to Supabase Storage (public bucket) and returns its public
 * URL. Requires SUPABASE_SERVICE_ROLE_KEY — the bucket itself should be
 * created once in the Supabase dashboard (Storage → New bucket → "public").
 */
export async function uploadImage(file: File, pathPrefix = "products"): Promise<string> {
  const supabase = createSupabaseServiceClient();
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${pathPrefix}/${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    contentType: file.type,
    upsert: false,
  });

  if (error) {
    throw new Error(`Image upload failed: ${error.message}`);
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
