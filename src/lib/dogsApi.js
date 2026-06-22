import { supabase } from "./supabaseClient";

const BUCKET = "dog-photos";

/**
 * Upload a single image file to Supabase Storage and return its public URL.
 *
 * @param {File} file - the image file from a file input
 * @returns {Promise<string>} the public URL of the uploaded image
 */
export async function uploadDogPhoto(file) {
  // Build a unique, collision-safe path. Keep the original extension so the
  // browser serves the right content type.
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const fileName = `${crypto.randomUUID()}.${ext}`;
  const filePath = `dogs/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type || undefined,
    });

  if (uploadError) {
    throw new Error(`Could not upload "${file.name}": ${uploadError.message}`);
  }

  // Retrieve the public URL for the stored object.
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(filePath);

  if (!data?.publicUrl) {
    throw new Error(`Uploaded "${file.name}" but could not get its public URL.`);
  }

  return data.publicUrl;
}

/**
 * Upload several images, one after another, returning all their public URLs.
 * Sequential (not parallel) so a slow connection can't fire dozens of
 * simultaneous uploads, and so progress can be reported per-file.
 *
 * @param {File[]} files
 * @param {(done: number, total: number) => void} [onProgress]
 * @returns {Promise<string[]>}
 */
export async function uploadDogPhotos(files, onProgress) {
  const urls = [];
  for (let i = 0; i < files.length; i++) {
    const url = await uploadDogPhoto(files[i]);
    urls.push(url);
    if (onProgress) onProgress(i + 1, files.length);
  }
  return urls;
}

/**
 * Create a dog listing: upload its photos, then insert the row.
 *
 * @param {object} dog - the form values
 * @param {File[]} photoFiles - selected image files
 * @param {(done: number, total: number) => void} [onUploadProgress]
 * @returns {Promise<object>} the inserted row
 */
export async function createDogListing(dog, photoFiles, onUploadProgress) {
  // 1. Upload any photos first and collect their public URLs.
  let photoUrls = [];
  if (photoFiles && photoFiles.length > 0) {
    photoUrls = await uploadDogPhotos(photoFiles, onUploadProgress);
  }

  // 2. Shape the row to match the `dogs` table columns.
  const row = {
    name: dog.name.trim(),
    status: dog.status, // 'romania' | 'uk_foster' | 'uk_kennels' | 'adopted'
    age: dog.age.trim(),
    size: dog.size, // 'small' | 'medium' | 'large'
    gender: dog.gender, // 'male' | 'female'
    bio: dog.bio.trim(),
    good_with_dogs: !!dog.goodWithDogs,
    good_with_cats: !!dog.goodWithCats,
    good_with_kids: !!dog.goodWithKids,
    neutered: !!dog.neutered,
    vaccinated: !!dog.vaccinated,
    photo_urls: photoUrls, // stored as a text[] / jsonb column
  };

  // 3. Insert and return the created record.
  const { data, error } = await supabase
    .from("dogs")
    .insert(row)
    .select()
    .single();

  if (error) {
    throw new Error(`Could not save the listing: ${error.message}`);
  }

  return data;
}
