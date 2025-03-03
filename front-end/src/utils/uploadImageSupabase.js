import supabase from "./supabase"; // Ensure correct relative path

const BUCKET_NAME = 'fpt-image';

export const uploadImageToSupabase = async (file) => {
  if (!file) throw new Error("No file provided");

  const fileName = `${file.name}_${Date.now()}`;
  const filePath = fileName; // storing in the root of the bucket

  console.log("Uploading file to:", filePath);

  // Upload the file to the bucket
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, file);

  if (error) {
    console.error("Upload error:", error);
    throw error;
  }

  // getPublicUrl is synchronous and returns an object like { data: { publicUrl: "..." } }
  const { data: publicData, error: urlError } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(filePath);

  if (urlError) {
    console.error("Error getting public URL:", urlError);
    throw urlError;
  }

  console.log("Public URL:", publicData.publicUrl);
  return publicData.publicUrl;
};
