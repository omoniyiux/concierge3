import { redirect } from "next/navigation";

/** `/legal` on its own has no document to show; Terms is the one people mean. */
export default function LegalIndex() {
  redirect("/legal/terms");
}
