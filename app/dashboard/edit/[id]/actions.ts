"use server";

import { createClient } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

interface UpdateDealData {
  title: string;
  description: string;
  price: number;
  image_urls?: string[];
  imagesToDelete?: string[];
}

export async function updateDealAction(id: string, formData: UpdateDealData) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) throw new Error("Unauthorized");

  const { error: dbError } = await supabase
    .from("deals")
    .update({
      title: formData.title,
      description: formData.description,
      price: formData.price,
      image_urls: formData.image_urls,
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (dbError) throw new Error(dbError.message);

  if (formData.imagesToDelete && formData.imagesToDelete.length > 0) {
    const filePaths = formData.imagesToDelete
      .map((url) => {
        const bucketString = "/deals/";
        const index = url.indexOf(bucketString);
        if (index !== -1) {
          return url.substring(index + bucketString.length);
        }
        return "";
      })
      .filter((path) => path !== "");

    if (filePaths.length > 0) {
      const { error: storageError } = await supabase.storage
        .from("deals")
        .remove(filePaths);

      if (storageError) {
        console.error("Storage cleanup warning:", storageError.message);
      }
    }
  }

  revalidatePath("/dashboard");
}

export async function deleteDealAction(id: string) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) throw new Error("Unauthorized");

  const { error: dbError } = await supabase
    .from("deals")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (dbError) throw new Error(dbError.message);

  revalidatePath("/dashboard");
}
