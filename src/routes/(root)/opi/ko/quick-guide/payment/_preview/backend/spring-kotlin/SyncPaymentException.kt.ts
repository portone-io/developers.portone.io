import { code } from "~/components/interactive-docs/index.jsx";

import type { Params, Sections } from "../../type";

export default code<{
  params: Params;
  sections: Sections;
}>`
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.ControllerAdvice
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.ResponseStatus

class SyncPaymentException : Exception() {
  @ControllerAdvice
  class Handler {
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    @ExceptionHandler(SyncPaymentException::class)
    fun handleSyncFailure() = Unit
  }
}

`;
