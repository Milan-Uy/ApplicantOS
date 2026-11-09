import "server-only"
import { createClient } from "@supabase/supabase-js"
import { BUCKET } from "@/lib/storage-keys"

/** Service-role handle on the documents bucket. It bypasses Storage RLS: check `isOwnedKey` before every call. */
export function storageAdmin() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false },
  }).storage.from(BUCKET)
}
