export default function EasyGuideLink() {
  return (
    <div>
      <a
        class="my-4 inline-flex items-center gap-2 rounded bg-orange-600 px-5 py-2 text-lg text-orange-1 font-bold"
        target="_blank"
        href="https://www.canva.com/design/DAFqFrw4MPs/1Oqjy8cBpKOIwS3z9leQ9w/view"
        onClick={() => trackEvent("Developers_Easy_Guide_Click", {})}
      >
        <span>포트원 서비스 간편 가이드</span>
        <i class="i-ic-baseline-launch" />
      </a>
    </div>
  );
}
