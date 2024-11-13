import dummyImg from "~/assets/dummy/5653e4f30f22b1afcadaa75ca5873e2f.png";
import Picture from "~/components/Picture";

export function Preview() {
  return (
    <div class="flex overflow-hidden rounded-lg bg-slate-1 p-10">
      <div class="flex flex-1 flex-col justify-between rounded-xl bg-white p-6">
        <div class="flex items-center gap-6 rounded-lg bg-slate-50 p-3">
          <div class="flex rounded-md p-3">
            <Picture picture={dummyImg} alt="상품 이미지" class="w-16" />
          </div>
          <div class="flex flex-col gap-2">
            <span class="text-[17px] text-slate-6 font-medium leading-[30.6px]">
              나이키 멘즈 조이라이드 플라이니트
            </span>
            <span class="text-[18px] text-slate-6 font-medium leading-[27px]">
              1,000원
            </span>
          </div>
        </div>
        <button type="button" class="rounded-md bg-portone px-4 py-3">
          <span class="text-[18px] text-white font-semibold leading-[27px]">
            결제
          </span>
        </button>
      </div>
    </div>
  );
}
