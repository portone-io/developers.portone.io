export interface MethodBadgeProps {
  method: "get" | "post" | "put" | "delete";
}
export const MethodBadge: React.FC<MethodBadgeProps> = ({ method }) => {
  return {
    get: (
      <span class="px-2 py-1 text-xs font-bold tracking-widest rounded-full text-white bg-indigo-6">
        GET
      </span>
    ),
    post: (
      <span class="px-2 py-1 text-xs font-bold tracking-widest rounded-full text-white bg-green-6">
        POST
      </span>
    ),
    put: (
      <span class="px-2 py-1 text-xs font-bold tracking-widest rounded-full text-white bg-orange-7">
        PUT
      </span>
    ),
    delete: (
      <span class="px-2 py-1 text-xs font-bold tracking-widest rounded-full text-white bg-red-6">
        DELETE
      </span>
    ),
  }[method];
};
