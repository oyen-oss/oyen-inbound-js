/* eslint-disable max-classes-per-file */
import { CustomError, Status } from '@block65/custom-error';

export class InboundSetupError extends CustomError {
  public override code = Status.FAILED_PRECONDITION;
}

export class InboundEventSourceError extends CustomError {
  constructor(
    statusCode: Status,
    message: string | undefined = Status[statusCode],
    cause?: unknown,
  ) {
    super(message, cause);
    this.code = statusCode;
  }
}
