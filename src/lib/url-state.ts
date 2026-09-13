"use client";

import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

/**
 * A piece of view state that belongs in the address bar: which conversation is
 * open, which tab is showing, which lead is expanded.
 *
 * These all used to be `useState`, which meant the URL never changed as you
 * moved around a surface. Refresh lost your place, Back left the surface
 * entirely instead of closing what you had opened, and you could not send
 * anyone a link to what you were looking at — the notification bell's deep
 * link into a conversation worked exactly once, then went stale.
 *
 * Writes use `replace`, so moving around inside a surface does not stack a
 * history entry per click. Pass `push` for a change that Back should undo —
 * opening a detail pane, typically.
 *
 * @param key      The query parameter to read and write.
 * @param fallback Returned when the parameter is absent or not a valid value.
 * @param valid    Optional allow-list. A value outside it is ignored, so a
 *                 hand-edited `?tab=nonsense` falls back rather than rendering
 *                 an empty surface.
 */
export function useUrlState<T extends string>(
  key: string,
  fallback: T,
  valid?: readonly T[],
): [T, (next: T, mode?: "replace" | "push") => void] {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const raw = params.get(key);
  const value = raw !== null && (!valid || (valid as readonly string[]).includes(raw)) ? (raw as T) : fallback;

  const set = useCallback(
    (next: T, mode: "replace" | "push" = "replace") => {
      const query = new URLSearchParams(params.toString());
      // The fallback is what an absent parameter already means, so writing it
      // out would only make the URL longer and uglier for no added meaning.
      if (next === fallback) query.delete(key);
      else query.set(key, next);

      const qs = query.toString();
      const href = qs ? `${pathname}?${qs}` : pathname;
      if (mode === "push") router.push(href, { scroll: false });
      else router.replace(href, { scroll: false });
    },
    [fallback, key, params, pathname, router],
  );

  return [value, set];
}

/**
 * The same thing for a selection that can be empty — an open row, a selected
 * conversation. `null` clears the parameter.
 */
export function useUrlSelection(
  key: string,
): [string | null, (next: string | null, mode?: "replace" | "push") => void] {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const set = useCallback(
    (next: string | null, mode: "replace" | "push" = "replace") => {
      const query = new URLSearchParams(params.toString());
      if (next === null) query.delete(key);
      else query.set(key, next);

      const qs = query.toString();
      const href = qs ? `${pathname}?${qs}` : pathname;
      if (mode === "push") router.push(href, { scroll: false });
      else router.replace(href, { scroll: false });
    },
    [key, params, pathname, router],
  );

  return [params.get(key), set];
}
