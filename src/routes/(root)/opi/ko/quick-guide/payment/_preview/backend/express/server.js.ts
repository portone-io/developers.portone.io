import { code } from "~/components/interactive-docs/index.jsx";

import type { Params, Sections } from "../../type";

export default code<{
  params: Params;
  sections: Sections;
}>`
const express = require("express")
const bodyParser = require("body-parser")
${({ section }) => section("server:import-portone-sdk")`
const PortOne = require("@portone/server-sdk")
`}

${({ section }) => section("server:portone-api-secret")`
const portone = PortOne.PortOneClient(process.env.V2_API_SECRET)
`}

${({ section }) => section("server:complete-payment:verify-payment")`
function verifyPayment(payment) {
  if (payment.customData == null) return false
  const customData = JSON.parse(payment.customData)
  const item = items.get(customData.item)
  if (item == null) return false
  return (
    payment.orderName === item.name &&
    payment.amount.total === item.price &&
    payment.currency === item.currency
  )
}
`}

const paymentStore = new Map()
async function syncPayment(paymentId) {
  if (!paymentStore.has(paymentId)) {
    paymentStore.set(paymentId, {
      status: "PENDING",
    })
  }
  const payment = paymentStore.get(paymentId)
  ${({ section }) => section("server:complete-payment:get-payment")`
  let actualPayment
  try {
    actualPayment = await portone.payment.getPayment(paymentId)
  } catch (e) {
    if (e instanceof PortOne.Errors.PortOneError) return false
    throw e
  }
  if (actualPayment == null) return false
  `}
  switch (actualPayment.status) {
    case "PAID":
      if (!verifyPayment(actualPayment)) return false
      if (payment.status === "PAID") return payment
      payment.status = "PAID"
      console.info("결제 성공", actualPayment)
      break
    ${({ when }) => when(({ pg }) => pg.payMethods === "virtualAccount")`
    case "VIRTUAL_ACCOUNT_ISSUED":
      payment.status = "VIRTUAL_ACCOUNT_ISSUED"
      break
    `}
    default:
      return false
  }
  return payment
}

const app = express()

${({ section }) => section("server:webhook:raw-body")`
app.use(
  "/api/payment/webhook",
  bodyParser.text({
    type: "application/json",
  }),
)
`}
app.use(bodyParser.json())

const items = new Map([
  [
    "shoes",
    {
      name: "나이키 멘즈 조이라이드 플라이니트",
      price: 1000,
      currency: "KRW",
    },
  ],
])

app.get("/api/item", (req, res) => {
  const id = "shoes"
  res.json({
    id,
    ...items.get(id),
  })
})

${({ section }) => section("server:complete-payment")`
app.post("/api/payment/complete", async (req, res, next) => {
  try {
    const { paymentId } = req.body
    if (typeof paymentId !== "string")
      return res.status(400).send("올바르지 않은 요청입니다.").end()
    const payment = await syncPayment(paymentId)
    if (!payment) return res.status(400).send("결제 동기화에 실패했습니다.")
    res.status(200).json({
      status: payment.status,
    })
  } catch (e) {
    next(e)
  }
})
`}

${({ section }) => section("server:webhook")`
app.post("/api/payment/webhook", async (req, res, next) => {
  try {
    ${({ section }) => section("server:webhook:verify")`
    let webhook
    try {
      webhook = await PortOne.Webhook.verify(
        process.env.V2_WEBHOOK_SECRET,
        req.body,
        req.headers,
      )
    } catch (e) {
      if (e instanceof PortOne.Webhook.WebhookVerificationError)
        return res.status(400).end()
      throw e
    }
    `}
    ${({ section }) => section("server:webhook:complete-payment")`
    if ('data' in webhook && 'paymentId' in webhook.data)
      await syncPayment(webhook.data.paymentId)
    `}
    res.status(200).end()
  } catch (e) {
    next(e)
  }
})
`}

const server = app.listen(8080, "localhost", () => {
  console.log("server is running on", server.address())
})
`;
