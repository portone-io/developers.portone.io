import { code } from "~/components/code-preview";

import type { Params, Sections } from "./index.js";

export default code<{
  params: Params;
  sections: Sections;
}>`
const express = require("express")
const bodyParser = require("body-parser")
${({ section }) => section("server:import-portone-sdk")`
const PortOne = require("@portone/server-sdk")
`}

const portOne = PortOne.PortOneClient(process.env.V2_API_SECRET)

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

const paymentStore = new Map()
async function syncPayment(paymentId) {
  if (!paymentStore.has(paymentId)) {
    paymentStore.set(paymentId, {
      status: "PENDING",
    })
  }
  const payment = paymentStore.get(paymentId)
  let actualPayment
  try {
    actualPayment = await portOne.payment.getPayment(paymentId)
  } catch (e) {
    if (e instanceof PortOne.Errors.PortOneError) return false
    throw e
  }
  if (actualPayment == null) return false
  switch (actualPayment.status) {
    case "PAID":
      if (!verifyPayment(actualPayment)) return false
      if (payment.status === "PAID") return payment
      payment.status = "PAID"
      console.info("결제 성공", actualPayment)
      break
    case "VIRTUAL_ACCOUNT_ISSUED":
      payment.status = "VIRTUAL_ACCOUNT_ISSUED"
      break
    default:
      return false
  }
  return payment
}

const app = express()

app.use(
  "/api/payment/webhook",
  bodyParser.text({
    type: "application/json",
  }),
)
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

app.post("/api/payment/webhook", async (req, res, next) => {
  try {
    try {
      await PortOne.Webhook.verify(
        process.env.V2_WEBHOOK_SECRET,
        req.body,
        req.headers,
      )
    } catch (e) {
      if (e instanceof PortOne.Webhook.WebhookVerificationError)
        return res.status(400).end()
      throw e
    }
    const {
      type,
      data: { paymentId },
    } = JSON.parse(req.body)
    if (type.startsWith("Transaction.")) await syncPayment(paymentId)
    res.status(200).end()
  } catch (e) {
    next(e)
  }
})

const server = app.listen(8080, "localhost", () => {
  console.log("server is running on", server.address())
})
`;
