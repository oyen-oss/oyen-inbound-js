/* eslint-disable max-classes-per-file */
import { CustomError, Status } from '@block65/custom-error';

export class InboundError extends CustomError {}

export class InboundInitError extends InboundError {
  public override code = Status.FAILED_PRECONDITION;
}

export class InboundEventSourceError extends InboundError {
  constructor(
    statusCode: Status,
    message: string | undefined = Status[statusCode],
    cause?: unknown,
  ) {
    super(message, cause);
    this.code = statusCode;
  }
}
