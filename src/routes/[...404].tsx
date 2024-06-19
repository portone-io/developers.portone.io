import { NotFoundError } from "~/components/404";

export default function NotFound() {
  throw new NotFoundError();
}
