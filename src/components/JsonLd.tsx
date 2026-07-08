import type { Organization, Thing, WithContext } from "schema-dts";

export default function JsonLd<T extends Thing>(props: {
  data: WithContext<T>;
}) {
  return (
    <script type="application/ld+json" innerHTML={JSON.stringify(props.data)} />
  );
}

export const organizationJsonLd: Organization = {
  "@type": "Organization",
  name: "코리아포트원",
  url: "https://developers.portone.io",
  logo: {
    "@type": "ImageObject",
    url: "https://developers.portone.io/opengraph.png",
  },
  description:
    "코리아포트원은 결제와 재무 운영을 자동화하는 AI 인프라 솔루션입니다. ",
  founder: {
    "@type": "Person",
    name: "정영주",
  },
  telephone: "+82-2-1670-5176",
  email: "contact@portone.io",
  areaServed: "South Korea",
  address: {
    "@type": "PostalAddress",
    postalCode: "04783",
    addressCountry: "KR",
    addressRegion: "서울특별시",
    addressLocality: "성동구",
    streetAddress: "성수이로 20길 16",
  },
  knowsAbout: ["결제 인프라 구축", "플랫폼 정산 자동화", "매출 마감 자동화"],
  sameAs: [
    "https://youtube.com/@PortOne_Academy",
    "https://linkedin.com/company/portonekorea",
  ],
};
