export interface MethodBadgeProps {
  method: "get" | "post" | "put" | "delete";
}
export function MethodBadge({ method }: MethodBadgeProps) {
  return {
    get: (
      <span class="bg-indigo-6 rounded-full px-2 py-1 text-xs font-bold tracking-widest text-white">
        GET
      </span>
    ),
    post: (
      <span class="bg-green-6 rounded-full px-2 py-1 text-xs font-bold tracking-widest text-white">
        POST
      </span>
    ),
    put: (
      <span class="bg-orange-7 rounded-full px-2 py-1 text-xs font-bold tracking-widest text-white">
        PUT
      </span>
    ),
    delete: (
      <span class="bg-red-6 rounded-full px-2 py-1 text-xs font-bold tracking-widest text-white">
        DELETE
      </span>
    ),
  }[method];
}
