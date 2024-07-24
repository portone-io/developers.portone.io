import Picture from "~/components/Picture";

import banner from "./_assets/banner.png";

export default function Banner() {
  return <Picture picture={banner} alt="Release Notes Banner" class="mb-6" />;
}
