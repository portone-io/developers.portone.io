import { code } from "~/components/interactive-docs/index.jsx";

import type { Params, Sections } from "../../type";

export default code<{
  params: Params;
  sections: Sections;
}>`
import org.springframework.boot.context.properties.ConfigurationProperties

@ConfigurationProperties("portone.secret")
data class PortOneSecretProperties(val api: String, val webhook: String)

`;
