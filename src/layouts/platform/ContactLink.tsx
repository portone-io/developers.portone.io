import { trackEvent } from "~/layouts/trackers/Trackers";

function ContactLink() {
  return (
    <a
      class="ml-2 h-full flex items-center gap-4 bg-orange-6 px-6 color-white font-bold"
      href="http://platform.contact.portone.io/"
      onClick={() => trackEvent("Developers_Platform_Contact_Click", {})}
    >
      사전 신청하기
    </a>
  );
}
export default ContactLink;
