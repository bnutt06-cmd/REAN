import { supabase } from "./supabaseClient";

/**
 * Submit an adoption enquiry from the public site.
 * No login required. The honeypot field catches basic bots: if it's filled,
 * we silently pretend success without writing anything.
 *
 * @param {object} enquiry
 * @param {string} enquiry.dogId   - the dog being enquired about
 * @param {string} enquiry.dogName - stored alongside so admins see it even if the dog is later removed
 * @param {string} enquiry.name
 * @param {string} enquiry.email
 * @param {string} enquiry.phone
 * @param {string} enquiry.message
 * @param {string} [enquiry.honeypot] - hidden field; humans leave it empty
 */
export async function submitEnquiry(enquiry) {
  // Bot trap: a real person never fills the hidden field.
  if (enquiry.honeypot) {
    return { ok: true }; // pretend success, write nothing
  }

  if (!enquiry.name?.trim() || !enquiry.email?.trim()) {
    throw new Error("Please enter your name and email.");
  }

  const row = {
    dog_id: enquiry.dogId || null,
    dog_name: enquiry.dogName || null,
    name: enquiry.name.trim(),
    email: enquiry.email.trim(),
    phone: enquiry.phone?.trim() || null,
    message: enquiry.message?.trim() || null,
    status: "new", // 'new' | 'handled'
  };

  const { error } = await supabase.from("enquiries").insert(row);
  if (error) {
    throw new Error(`Could not send your enquiry: ${error.message}`);
  }
  return { ok: true };
}

/**
 * Fetch all enquiries, newest first. Admin only (RLS enforces this).
 */
export async function getEnquiries() {
  const { data, error } = await supabase
    .from("enquiries")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Could not load enquiries: ${error.message}`);
  }
  return data;
}

/**
 * Mark an enquiry as handled (or back to new).
 */
export async function setEnquiryStatus(id, status) {
  const { error } = await supabase
    .from("enquiries")
    .update({ status })
    .eq("id", id);

  if (error) {
    throw new Error(`Could not update the enquiry: ${error.message}`);
  }
  return true;
}

/**
 * Delete an enquiry.
 */
export async function deleteEnquiry(id) {
  const { error } = await supabase.from("enquiries").delete().eq("id", id);
  if (error) {
    throw new Error(`Could not delete the enquiry: ${error.message}`);
  }
  return true;
}
