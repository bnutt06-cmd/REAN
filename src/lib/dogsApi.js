import { supabase } from "./supabaseClient";

const BUCKET = "dog-photos";

/**
 * Upload a single image file to Supabase Storage and return its public URL.
 */
export async function uploadDogPhoto(file) {
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

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(filePath);
  if (!data?.publicUrl) {
    throw new Error(`Uploaded "${file.name}" but could not get its public URL.`);
  }

  return data.publicUrl;
}

/**
 * Upload multiple images sequentially
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
 * Fetch all dog listings, sorted newest first
 */
export async function getDogListings() {
  const { data, error } = await supabase
    .from("dogs")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Could not fetch dogs: ${error.message}`);
  }
  return data;
}

/**
 * Create a new dog listing
 */
export async function createDogListing(dog, photoFiles, onUploadProgress) {
  let photoUrls = [];
  if (photoFiles && photoFiles.length > 0) {
    photoUrls = await uploadDogPhotos(photoFiles, onUploadProgress);
  }

  const row = {
    name: dog.name.trim(),
    status: dog.status,
    age: dog.age.trim(),
    size: dog.size,
    gender: dog.gender,
    bio: dog.bio.trim(),
    good_with_dogs: !!dog.goodWithDogs,
    good_with_cats: !!dog.goodWithCats,
    good_with_kids: !!dog.goodWithKids,
    neutered: !!dog.neutered,
    vaccinated: !!dog.vaccinated,
    photo_urls: photoUrls,
  };

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

/**
 * Update an existing dog listing
 */
export async function updateDogListing(id, dog, newPhotoFiles, existingUrls = [], onUploadProgress) {
  let finalUrls = [...existingUrls];
  
  if (newPhotoFiles && newPhotoFiles.length > 0) {
    const freshUrls = await uploadDogPhotos(newPhotoFiles, onUploadProgress);
    finalUrls = [...finalUrls, ...freshUrls];
  }

  const row = {
    name: dog.name.trim(),
    status: dog.status,
    age: dog.age.trim(),
    size: dog.size,
    gender: dog.gender,
    bio: dog.bio.trim(),
    good_with_dogs: !!dog.goodWithDogs,
    good_with_cats: !!dog.goodWithCats,
    good_with_kids: !!dog.goodWithKids,
    neutered: !!dog.neutered,
    vaccinated: !!dog.vaccinated,
    photo_urls: finalUrls,
  };

  const { data, error } = await supabase
    .from("dogs")
    .update(row)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(`Could not update the listing: ${error.message}`);
  }
  return data;
}

/**
 * Delete a dog listing
 */
export async function deleteDogListing(id) {
  const { error } = await supabase
    .from("dogs")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(`Could not delete the listing: ${error.message}`);
  }
  return true;
}