import * as PortOneAIChatbotLoader from "@portone/ai-chatbot-loader";
import { onCleanup, onMount } from "solid-js";

function Chatbot() {
  onMount(() => {
    PortOneAIChatbotLoader.load({
      baseUrl: "https://ai-chatbot-kappa-blue-portone.vercel.app",
    });
  });

  onCleanup(() => {
    PortOneAIChatbotLoader.unload();
  });

  return <></>;
}

export default Chatbot;
