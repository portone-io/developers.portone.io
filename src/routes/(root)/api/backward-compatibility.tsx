import { Show } from "solid-js";

import { prose } from "~/components/prose";
import type { SystemVersion } from "~/type";

export default function BackwardCompatibilityContent(props: {
  version: SystemVersion;
}) {
  return (
    <>
      <prose.h3 id="backward-compatibility">하위호환성</prose.h3>
      <prose.p>
        포트원이 제공하는 모든 Stable API에 대해 아래와 같은 하위호환성이
        보장됩니다.
      </prose.p>
      <ol>
        <li>
          <prose.p>
            현재 사용 가능한 입력 형식은 앞으로도 사용할 수 있습니다.
          </prose.p>
          <ul>
            <li> 입력 형식 내 필드 정의가 삭제되지 않습니다. </li>
            <li>
              <prose.p>
                필수 입력 정보가 추가되거나, 선택 입력 정보가 필수로 변경되지
                않습니다.
              </prose.p>
              <ul>
                <li> 오로지 선택 입력 정보만 추가될 수 있습니다. </li>
              </ul>
            </li>
            <li>하위 필드의 형식(타입) 또한 위 규칙을 지키며 변경됩니다.</li>
            <li> enum 타입의 값이 삭제되지 않습니다. </li>
          </ul>
        </li>
        <li>
          <prose.p>출력 형식이 확장될 수 있지만, 축소되지 않습니다.</prose.p>
          <ul>
            <li> 출력 형식 내 필드 정의가 삭제되지 않습니다. </li>
            <li>
              <prose.p>
                사용 중인 필수 출력 정보가 선택사항으로 변경되거나 출력 시
                누락되지 않습니다.
              </prose.p>
              <ul>
                <li>
                  이미 존재하는 용례 내에서는 필수 출력 정보가 언제나
                  유지됩니다.
                </li>
                <li>
                  단,{" "}
                  <strong>
                    기능이 추가 및 확장되는 등 새로운 용례로 사용될 때의 출력
                    정보에 한하여 선택사항으로 변경될 수 있습니다.
                  </strong>
                </li>
              </ul>
            </li>
            <li>하위 필드의 형식(타입) 또한 위 규칙을 지키며 변경됩니다.</li>
            <li>
              <prose.p>
                단,{" "}
                <strong>
                  새로운 필드 또는 enum 값, oneOf 케이스가 추가될 수 있습니다.
                </strong>
              </prose.p>
              <ul>
                <li>
                  알지 못하는 필드 및 값이 주어지더라도 crash가 발생하지 않도록
                  유의하여 개발해주세요.
                </li>
                <Show when={props.version == "v1"}>
                  <li>
                    새로운 필드 및 값이 추가되는 경우 사전 공지를 통해
                    안내드립니다.
                  </li>
                </Show>
              </ul>
            </li>
          </ul>
        </li>
      </ol>
      <prose.p>
        <code>UNSTABLE</code>이 표기된 일부 API의 경우, 위 하위호환성 정책과
        무관하게 변경 및 지원 종료될 수 있으니 이용에 유의하세요.
      </prose.p>
    </>
  );
}
