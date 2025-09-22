import * as PortOneAIChatbotLoader from "@portone/ai-chatbot-loader";
import { onMount } from "solid-js";

function Chatbot() {
  onMount(() => {
    PortOneAIChatbotLoader.load({
      baseUrl: "https://ai-chatbot-kappa-blue-portone.vercel.app",
    });
  });

  return <></>;
}

export default Chatbot;
