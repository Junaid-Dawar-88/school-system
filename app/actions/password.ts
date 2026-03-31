"use server";

export async function forgotPasswordAction(_formData: FormData) {
  return { error: "Password reset is temporarily unavailable. Please contact your admin.", success: "" };
}

export async function resetPasswordAction(_formData: FormData) {
  return { error: "Password reset is temporarily unavailable. Please contact your admin.", success: "" };
}
