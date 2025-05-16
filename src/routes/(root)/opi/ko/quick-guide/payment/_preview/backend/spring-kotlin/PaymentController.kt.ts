import { code } from "~/components/interactive-docs/index.jsx";

import type { Params, Sections } from "../../type";

export default code<{
  params: Params;
  sections: Sections;
}>`
${({ section }) => section("server:import-portone-sdk")`
import io.portone.sdk.server.common.Currency
import io.portone.sdk.server.common.SelectedChannelType
import io.portone.sdk.server.payment.PaidPayment
import io.portone.sdk.server.payment.PaymentClient
import io.portone.sdk.server.payment.VirtualAccountIssuedPayment
import io.portone.sdk.server.webhook.WebhookTransaction
import io.portone.sdk.server.webhook.WebhookVerifier
`}
import kotlinx.serialization.json.Json
import kotlinx.serialization.Serializable
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestHeader
import org.springframework.web.bind.annotation.RestController

@RestController
class PaymentController(secret: PortOneSecretProperties) {
  data class Item(
    val id: String,
    val name: String,
    val price: Int,
    val currency: String,
  )

  data class ExamplePayment(
    val status: String,
  )

  @Serializable
  data class CustomData(val item: String)

  class CompletePaymentRequest {
    var paymentId: String = ""
  }

  companion object {
    private val items: Map<String, Item> =
      mapOf(
        "shoes" to
          Item(
            id = "shoes",
            name = "신발",
            price = 1000,
            currency = Currency.Krw.value,
          ),
      )

    private val paymentStore: MutableMap<String, ExamplePayment> = mutableMapOf()
    private val json: Json = Json { ignoreUnknownKeys = true }
    private val logger: Logger = LoggerFactory.getLogger(PaymentController::class.java)
  }

  ${({ section }) => section("server:portone-api-secret")`
  private val portone = PaymentClient(apiSecret = secret.api)
  `}
  private val portoneWebhook = WebhookVerifier(secret.webhook)

  @GetMapping("/api/item")
  fun getItem(): Item {
    return items["shoes"]!!
  }

  ${({ section }) => section("server:complete-payment")`
  @PostMapping("/api/payment/complete")
  suspend fun completePayment(
    @RequestBody completeRequest: CompletePaymentRequest,
  ): Payment = syncPayment(completeRequest.paymentId)
  `}

  suspend fun syncPayment(paymentId: String): ExamplePayment {
    val payment =
      paymentStore.getOrPut(paymentId) {
        ExamplePayment("PENDING")
      }
    ${({ section }) => section("server:complete-payment:get-payment")`
    val actualPayment =
      try {
        portone.getPayment(paymentId = paymentId)
      } catch (_: Exception) {
        throw SyncPaymentException()
      }
    `}
    ${({ when }) => when(({ pg }) => pg.payMethods !== "virtualAccount")`
    return if (actualPayment is PaidPayment) {
      if (!verifyPayment(actualPayment)) throw SyncPaymentException()
      logger.info("결제 성공 {}", actualPayment)
      if (payment.status == "PAID") {
        payment
      } else {
        payment.copy(status = "PAID").also {
          paymentStore[paymentId] = it
        }
      }
    `}
    ${({ when }) => when(({ pg }) => pg.payMethods === "virtualAccount")`
    return if (actualPayment is VirtualAccountIssuedPayment) {
      payment.copy(status = "VIRTUAL_ACCOUNT_ISSUED").also {
        paymentStore[paymentId] = it
      }
    `}
    } else {
      throw SyncPaymentException()
    }
  }

  ${({ section }) => section("server:complete-payment:verify-payment")`
  fun verifyPayment(payment: PaidPayment): Boolean {
    if (payment.channel.type !== SelectedChannelType.Live) return false
    return payment.customData?.let { customData ->
      items[json.decodeFromString<CustomData>(customData).item]?.let {
        payment.orderName == it.name &&
          payment.amount.total == it.price.toLong() &&
          payment.currency.value == it.currency
      }
    } == true
  }
  `}

  ${({ section }) => section("server:webhook")`
  @PostMapping("/api/payment/webhook")
  suspend fun handleWebhook(
    ${({ section }) => section("server:webhook:raw-body")`
    @RequestBody body: String,
    `}
    @RequestHeader("webhook-id") webhookId: String,
    @RequestHeader("webhook-timestamp") webhookTimestamp: String,
    @RequestHeader("webhook-signature") webhookSignature: String,
  ) {
    ${({ section }) => section("server:webhook:verify")`
    val webhook =
      try {
        portoneWebhook.verify(body, webhookId, webhookTimestamp, webhookSignature)
      } catch (_: Exception) {
        throw SyncPaymentException()
      }
    `}
    ${({ section }) => section("server:webhook:complete-payment")`
    if (webhook is WebhookTransaction) {
      syncPayment(webhook.data.paymentId)
    }
    `}
  }
  `}
}

`;
