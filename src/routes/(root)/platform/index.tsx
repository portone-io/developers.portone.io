import Metadata from "~/components/Metadata";
import * as prose from "~/components/prose";

export default function PlatformIndex() {
  return (
    <article class="m-4 w-full flex flex-col text-slate-700">
      <Metadata title="파트너정산 가이드" />
      <prose.h1>파트너 정산 자동화</prose.h1>
      <p class="my-4 text-xl text-gray">
        파트너 정산 자동화 서비스에 대한 가이드 입니다.
      </p>
    </article>
  );
}
