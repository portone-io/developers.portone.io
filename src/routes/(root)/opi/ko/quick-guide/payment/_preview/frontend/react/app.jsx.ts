import { code } from "~/components/interactive-docs/index.jsx";

import { createPaymentRequest } from "../../request";
import type { Params, Sections } from "../../type";

export default code<{
  params: Params;
  sections: Sections;
}>`
${({ section }) => section("client:import-portone-sdk")`
import PortOne from "@portone/browser-sdk/v2"
`}
import { useEffect, useState } from "react"

export function App() {
  const [item, setItem] = useState(null)
  const [paymentStatus, setPaymentStatus] = useState({
    status: "IDLE",
  })

  ${({ section }) => section("client:fetch-item")`
  useEffect(() => {
    async function loadItem() {
      const response = await fetch("/api/item")
      setItem(await response.json())
    }

    loadItem().catch((error) => console.error(error))
  }, [])
  `}

  if (item == null) {
    return (
      <dialog open>
        <article aria-busy>결제 정보를 불러오는 중입니다.</article>
      </dialog>
    )
  }

  function randomId() {
    return [...crypto.getRandomValues(new Uint32Array(2))]
      .map((word) => word.toString(16).padStart(8, "0"))
      .join("")
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setPaymentStatus({ status: "PENDING" })
    ${({ section }) => section("client:request-payment")`
    const paymentId = randomId()
    const payment = await PortOne.requestPayment(${({ params, pgName }) => {
      const paymentRequest = createPaymentRequest(pgName, params, "");
      if (paymentRequest === null) {
        return code`{`;
      }
      const {
        storeId,
        channelKey,
        payMethod,
        customer,
        // @ts-expect-error(2339)
        virtualAccount,
        // @ts-expect-error(2339)
        easyPay,
        // @ts-expect-error(2339)
        giftCertificate,
        bypass,
        productType,
      } = paymentRequest;
      return code`{
      storeId: "${storeId}",
      channelKey: "${channelKey}",
      paymentId,
      orderName: item.name,
      totalAmount: item.price,
      currency: item.currency,
      payMethod: "${payMethod}",
      ${({ when }) => when(() => productType !== undefined)`
      productType: "${productType}",
      `}
      ${({ when }) => when(() => customer !== undefined)`
      customer: ${({ indentObject }) => indentObject(customer)},
      `}
      ${({ when }) => when(() => virtualAccount !== undefined)`
      virtualAccount: ${({ indentObject }) => indentObject(virtualAccount)},
      `}
      ${({ when }) => when(() => easyPay !== undefined)`
      easyPay: ${({ indentObject }) => indentObject(easyPay)},
      `}
      ${({ when }) => when(() => giftCertificate !== undefined)`
      giftCertificate: ${({ indentObject }) => indentObject(giftCertificate)},
      `}
      ${({ when }) => when(() => bypass !== undefined)`
      bypass: ${({ indentObject }) => indentObject(bypass)},
      `}
      customData: {
        item: item.id,
      },
    `;
    }}
    })`}
    ${({ section }) => section("client:handle-payment-error")`
    if (payment.code !== undefined) {
      setPaymentStatus({
        status: "FAILED",
        message: payment.message,
      })
      return
    }
    `}
    ${({ section }) => section("client:request-server-side-verification")`
    const completeResponse = await fetch("/api/payment/complete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        paymentId: payment.paymentId,
      }),
    })
    if (completeResponse.ok) {
      ${({ when }) => when(({ payMethod }) => payMethod !== "virtualAccount")`
        ${({ section }) => section("client:handle-payment-status:paid")`
      const paymentComplete = await completeResponse.json()
      setPaymentStatus({
        status: paymentComplete.status,
      })
        `}
      `}
      ${({ when }) => when(({ payMethod }) => payMethod === "virtualAccount")`
        ${({ section }) => section(
          "client:handle-payment-status:virtual-account-issued",
        )`
      const paymentComplete = await completeResponse.json()
      setPaymentStatus({
        status: paymentComplete.status,
      })
        `}
      `}
    } else {
      ${({ section }) => section("client:handle-payment-status:failed")`
      setPaymentStatus({
        status: "FAILED",
        message: await completeResponse.text(),
      })
      `}
    }
    `}
  }

  const isWaitingPayment = paymentStatus.status !== "IDLE"

  const handleClose = () =>
    setPaymentStatus({
      status: "IDLE",
    })

  return (
    <>
      <main>
        <form onSubmit={handleSubmit}>
          <article>
            <div className="item">
              <div className="item-image">
                <img src={\`/\${item.id}.png\`} />
              </div>
              <div className="item-text">
                <h5>{item.name}</h5>
                <p>{item.price.toLocaleString()}원</p>
              </div>
            </div>
            <div className="price">
              <label>총 구입 가격</label>
              {item.price.toLocaleString()}원
            </div>
          </article>
          <button
            type="submit"
            aria-busy={isWaitingPayment}
            disabled={isWaitingPayment}
          >
            결제
          </button>
        </form>
      </main>
      {paymentStatus.status === "FAILED" && (
        <dialog open>
          <header>
            <h1>결제 실패</h1>
          </header>
          <p>{paymentStatus.message}</p>
          <button type="button" onClick={handleClose}>
            닫기
          </button>
        </dialog>
      )}
      ${({ when }) => when(({ payMethod }) => payMethod !== "virtualAccount")`
      <dialog open={paymentStatus.status === "PAID"}>
        <header>
          <h1>결제 성공</h1>
        </header>
        <p>결제에 성공했습니다.</p>
        <button type="button" onClick={handleClose}>
          닫기
        </button>
      </dialog>
      `}
      ${({ when }) => when(({ payMethod }) => payMethod === "virtualAccount")`
      <dialog open={paymentStatus.status === "VIRTUAL_ACCOUNT_ISSUED"}>
        <header>
          <h1>가상계좌 발급 완료</h1>
        </header>
        <p>가상계좌가 발급되었습니다.</p>
        <button type="button" onClick={handleClose}>
          닫기
        </button>
      </dialog> 
      `}
    </>
  )
}

`;
