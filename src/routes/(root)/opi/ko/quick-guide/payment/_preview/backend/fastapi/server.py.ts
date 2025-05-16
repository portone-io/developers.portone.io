import { code } from "~/components/interactive-docs/index.jsx";

import type { Params, Sections } from "../../type";

export default code<{
  params: Params;
  sections: Sections;
}>`
import json
import os
from dataclasses import dataclass
from typing import Annotated

${({ section }) => section("server:import-portone-sdk")`
import portone_server_sdk as portone
`}
from fastapi import Body, Depends, FastAPI, Request


@dataclass
class Item:
  id: str
  name: str
  price: int
  currency: portone.common.Currency


@dataclass
class Payment:
  status: str


app = FastAPI()

items = {item.id: item for item in [Item("shoes", "신발", 1000, "KRW")]}
${({ section }) => section("server:portone-api-secret")`
portone_client = portone.PaymentClient(secret=os.environ["V2_API_SECRET"])
`}

${({ section }) => section("server:complete-payment")`
@app.post("/api/payment/complete")
def complete_payment(payment_id: Annotated[str, Body(embed=True, alias="paymentId")]):
  payment = sync_payment(payment_id)
  if payment is None:
    return "결제 동기화에 실패했습니다.", 400
  return payment
`}

payment_store = {}


def sync_payment(payment_id):
  if payment_id not in payment_store:
    payment_store[payment_id] = Payment("PENDING")
  payment = payment_store[payment_id]
  ${({ section }) => section("server:complete-payment:get-payment")`
  try:
    actual_payment = portone_client.get_payment(payment_id=payment_id)
  except portone.payment.GetPaymentError:
    return None
  `}
  ${({ when }) => when(({ pg }) => pg.payMethods !== "virtualAccount")`
  if isinstance(actual_payment, portone.payment.PaidPayment):
    if not verify_payment(actual_payment):
      return None
    if payment.status == "PAID":
      return payment
    payment.status = "PAID"
    print("결제 성공", actual_payment)
  `}
  ${({ when }) => when(({ pg }) => pg.payMethods === "virtualAccount")`
  if isinstance(actual_payment, portone.payment.VirtualAccountIssuedPayment):
    payment.status = "VIRTUAL_ACCOUNT_ISSUED"
  `}
  else:
    return None
  return payment

  
${({ section }) => section("server:complete-payment:verify-payment")`
def verify_payment(payment):
  if payment.channel.type !== "LIVE":
    return False
  if payment.custom_data is None:
    return False
  custom_data = json.loads(payment.custom_data)
  if "item" not in custom_data or custom_data["item"] not in items:
    return False
  item = items[custom_data["item"]]
  return (
    payment.order_name == item.name
    and payment.amount.total == item.price
    and payment.currency == item.currency
  )
`}


@app.get("/api/item")
def get_item():
  return items["shoes"]


${({ section }) => section("server:webhook:raw-body")`
async def get_raw_body(request: Request):
  return await request.body()
`}


${({ section }) => section("server:webhook")`
@app.post("/api/payment/webhook")
def receive_webhook(request: Request, body=Depends(get_raw_body)):
  ${({ section }) => section("server:webhook:verify")`
  try:
    webhook = portone.webhook.verify(
      os.environ["V2_WEBHOOK_SECRET"],
      body.decode("utf-8"),
      request.headers,
    )
  except portone.webhook.WebhookVerificationError:
    return "Bad Request", 400
  `}
  ${({ section }) => section("server:webhook:complete-payment")`
  if not isinstance(webhook, dict) and isinstance(
    webhook.data, portone.webhook.WebhookTransactionData
  ):
    sync_payment(webhook.data.payment_id)
  `}
  return "OK", 200
`}

`;
