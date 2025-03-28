import { code } from "~/components/interactive-docs/index.jsx";

import { createPaymentRequest } from "../../request";
import type { Params, Sections } from "../../type";

export default code<{
  params: Params;
  sections: Sections;
}>`
<!doctype html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/png" href="/favicon.png" />
    <link rel="stylesheet" type="text/css" href="/index.css" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>포트원 결제연동 샘플</title>
    ${({ section }) => section("client:import-portone-sdk")`
    <script src="https://cdn.portone.io/v2/browser-sdk.js" async defer></script>
    `}
  </head>
  <body>
    <div id="root">
      <dialog id="loadingDialog" open>
        <article aria-busy="true">결제 정보를 불러오는 중입니다.</article>
      </dialog>
      <main id="checkoutDialog" style="display: none">
        <form id="checkoutForm">
          <article>
            <div class="item">
              <div class="item-image">
                <img id="itemImage" />
              </div>
              <div class="item-text">
                <h5 id="itemName"></h5>
                <p class="price-value"></p>
              </div>
            </div>
            <div class="price">
              <label>총 구입 가격</label>
              <span class="price-value" />
            </div>
          </article>
          <button id="checkoutButton" type="submit">결제</button>
        </form>
      </main>
      <dialog id="failDialog">
        <header>
          <h1>결제 실패</h1>
        </header>
        <p />
        <button type="button" class="closeDialog">닫기</button>
      </dialog>
      ${({ when }) => when(({ pg }) => pg.payMethods !== "virtualAccount")`
      <dialog id="successDialog">
        <header>
          <h1>결제 성공</h1>
        </header>
        <p>결제에 성공했습니다.</p>
        <button type="button" class="closeDialog">닫기</button>
      </dialog>
      `}
      ${({ when }) => when(({ pg }) => pg.payMethods === "virtualAccount")`
      <dialog id="virtualAccountDialog">
        <header>
          <h1>가상계좌 발급 완료</h1>
        </header>
        <p>가상계좌가 발급되었습니다.</p>
        <button type="button" class="closeDialog">닫기</button>
      </dialog>
      `}
    </div>
    <script>
      const checkout = new Checkout()
      checkout.load()

      function Checkout() {
        let item = null
        this.load = async () => {
          const waitPortOne = new Promise((resolve) => {
            const polling = setInterval(() => {
              if (window.PortOne != null) {
                clearInterval(polling)
                resolve()
              }
            }, 50)
          })
          ${({ section }) => section("client:fetch-item")`
          const waitItem = await fetch("/api/item").then(
            async (response) => (item = await response.json()),
          )
         `}
          await Promise.all([waitPortOne, waitItem])
          window.loadingDialog.open = false
          window.checkoutDialog.open = true
          await this.showCheckout()
        }
        this.showCheckout = async () => {
          window.itemName.replaceChildren(item.name)
          window.itemImage.src = \`/\${item.id}.png\`
          for (const priceElement of document.querySelectorAll(
            ".price-value",
          )) {
            priceElement.replaceChildren(\`\${item.price.toLocaleString()}원\`)
          }
          window.checkoutDialog.onsubmit = async (e) => {
            e.preventDefault()
            this.setWaitingPayment(true)

            function randomId() {
              return [...crypto.getRandomValues(new Uint32Array(2))]
                .map((word) => word.toString(16).padStart(8, "0"))
                .join("")
            }

            ${({ section }) => section("client:request-payment")`
            const paymentId = randomId()
            const payment = await PortOne.requestPayment(${({ params }) => {
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
              } = createPaymentRequest(params, "");
              return code`{
              storeId: "${storeId}",
              channelKey: "${channelKey}",
              paymentId,
              orderName: item.name,
              totalAmount: item.price,
              currency: item.currency,
              ${({ when }) => when(() => productType !== undefined)`
              productType: "${productType}",
              `}
              payMethod: "${payMethod}",
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
            )`}
            ${({ section }) => section("client:handle-payment-error")`
            if (payment.code !== undefined) {
              this.setWaitingPayment(false)
              console.log(payment)
              this.openFailDialog(payment.message)
            }
            `}
            ${({ section }) => section(
              "client:request-server-side-verification",
            )`
            const completeResponse = await fetch("/api/payment/complete", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                paymentId: payment.paymentId,
              }),
            })
            `}
            this.setWaitingPayment(false)
            if (completeResponse.ok) {
              const paymentComplete = await completeResponse.json()
              ${({ when }) => when(
                ({ pg }) => pg.payMethods !== "virtualAccount",
              )`
                ${({ section }) => section("client:handle-payment-status:paid")`
              if (paymentComplete.status === "PAID") {
                this.openSuccessDialog()
              }
                `}
              `}
              ${({ when }) => when(
                ({ pg }) => pg.payMethods === "virtualAccount",
              )`
                ${({ section }) => section(
                  "client:handle-payment-status:virtual-account-issued",
                )`
              if (paymentComplete.status === "VIRTUAL_ACCOUNT_ISSUED") {
                this.openSuccessDialog()
              }
                `}
              `}
            } else {
              ${({ section }) => section("client:handle-payment-status:failed")`
              this.openFailDialog(await completeResponse.text())
              `}
            }
          }
          for (const dialogButton of document.getElementsByClassName(
            "closeDialog",
          )) {
            dialogButton.onclick = () => {
              dialogButton.parentElement.parentElement.open = false
            }
          }
          window.checkoutDialog.style = ""
        }
        this.setWaitingPayment = (isWaiting) => {
          window.checkoutButton.setAttribute("aria-busy", isWaiting.toString())
          window.checkoutButton.disabled = isWaiting
        }
        this.openFailDialog = (message) => {
          window.failMessage.replaceChildren(message)
          window.failDialog.open = true
        }
        ${({ when }) => when(({ pg }) => pg.payMethods !== "virtualAccount")`
        this.openSuccessDialog = () => {
          window.successDialog.open = true
        }
        `}
        ${({ when }) => when(({ pg }) => pg.payMethods === "virtualAccount")`
        this.openVirtualAccountDialog = () => {
          window.virtualAccountDialog.open = true
        }
        `}
      }
    </script>
  </body>
</html>

`;
