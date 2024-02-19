/* @jsxImportSource solid-js */

function ContactLink() {
  return (
    <a
      class="color-white bg-orange-6 ml-2 flex h-full items-center gap-4 px-6 font-bold"
      href="http://platform.contact.portone.io/"
      onClick={() => trackEvent("Developers_Platform_Contact_Click", {})}
    >
      사전 신청하기
    </a>
  );
}
export default ContactLink;
