export interface MethodBadgeProps {
  method: "get" | "post" | "put" | "delete";
}
export function MethodBadge({ method }: MethodBadgeProps) {
  return {
    get: (
      <span class="rounded-full bg-indigo-6 px-2 py-1 text-xs text-white font-bold tracking-widest">
        GET
      </span>
    ),
    post: (
      <span class="rounded-full bg-green-6 px-2 py-1 text-xs text-white font-bold tracking-widest">
        POST
      </span>
    ),
    put: (
      <span class="rounded-full bg-orange-7 px-2 py-1 text-xs text-white font-bold tracking-widest">
        PUT
      </span>
    ),
    delete: (
      <span class="rounded-full bg-red-6 px-2 py-1 text-xs text-white font-bold tracking-widest">
        DELETE
      </span>
    ),
  }[method];
}
