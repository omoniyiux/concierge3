/** Server-safe class joiner. Lives outside the client bundle so server
 *  components can use it too. */
export function cx(...parts: (string | false | null | undefined)[]) {
  return parts.filter(Boolean).join(" ");
}
