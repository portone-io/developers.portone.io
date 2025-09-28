import * as PortOneAIChatbotLoader from "@portone/ai-chatbot-loader";
import { onCleanup, onMount } from "solid-js";

function Chatbot() {
  onMount(() => {
    PortOneAIChatbotLoader.load({
      baseUrl: "https://ai-chatbot-kappa-blue-portone.vercel.app",
      channelIO: {
        pluginKey: "1c56a28b-bb3a-4b8b-afd0-f2fc3da403b5",
      },
    });
  });

  onCleanup(() => {
    PortOneAIChatbotLoader.unload();
  });

  return <></>;
}

export default Chatbot;
