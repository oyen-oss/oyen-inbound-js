/**
 * This file is auto generated by @block65/openapi-codegen
 *
 * WARN: Do not edit directly.
 *
 * Generated on 2024-05-23T03:49:41.606Z
 *
 */
import {
  RestServiceClient,
  createIsomorphicNativeFetcher,
  type RestServiceClientConfig,
} from '@block65/rest-client';
import type {
  CreateTeamCommandInput,
  ListTeamsCommandInput,
  GetTeamCommandInput,
  UpdateTeamCommandInput,
  ListTeamMembersCommandInput,
  ListInboxesCommandInput,
  CreateInboxCommandInput,
  GetInboxCommandInput,
  UpdateInboxCommandInput,
  ListKeysCommandInput,
  CreateKeyCommandInput,
  GetKeyCommandInput,
  UpdateKeyCommandInput,
  CreateEventSourceCommandInput,
  ListEventSourcesCommandInput,
  GetEventSourceCommandInput,
  UpdateEventSourceCommandInput,
  DeleteEventSourceCommandInput,
  ListQuotasCommandInput,
  UseQuotaCommandInput,
  GetPaymentDetailsCommandInput,
  GetUserSettingsCommandInput,
  ListDomainInboxesCommandInput,
  GetDomainInboxCommandInput,
  GetNumberInboxCommandInput,
  GetInboxEventSourceCommandInput,
  Team,
  Teams,
  TeamMembers,
  InboxList,
  InboxKind,
  Keys,
  Key,
  EventSource,
  EventSources,
  Quotas,
  Quota,
  PaymentDetails,
  UserSettings,
  EmailInboxList,
  EmailInbox,
  SmsInbox,
  InboxEventSource,
} from './types.js';

type AllInputs =
  | CreateTeamCommandInput
  | ListTeamsCommandInput
  | GetTeamCommandInput
  | UpdateTeamCommandInput
  | ListTeamMembersCommandInput
  | ListInboxesCommandInput
  | CreateInboxCommandInput
  | GetInboxCommandInput
  | UpdateInboxCommandInput
  | ListKeysCommandInput
  | CreateKeyCommandInput
  | GetKeyCommandInput
  | UpdateKeyCommandInput
  | CreateEventSourceCommandInput
  | ListEventSourcesCommandInput
  | GetEventSourceCommandInput
  | UpdateEventSourceCommandInput
  | DeleteEventSourceCommandInput
  | ListQuotasCommandInput
  | UseQuotaCommandInput
  | GetPaymentDetailsCommandInput
  | GetUserSettingsCommandInput
  | ListDomainInboxesCommandInput
  | GetDomainInboxCommandInput
  | GetNumberInboxCommandInput
  | GetInboxEventSourceCommandInput;
type AllOutputs =
  | Team
  | Teams
  | TeamMembers
  | InboxList
  | InboxKind
  | Keys
  | Key
  | EventSource
  | EventSources
  | Quotas
  | Quota
  | PaymentDetails
  | UserSettings
  | EmailInboxList
  | EmailInbox
  | SmsInbox
  | InboxEventSource;

export class OyenRestApiRestClient extends RestServiceClient<
  AllInputs,
  AllOutputs
> {
  constructor(
    baseUrl = new URL('https://api.example.com/'),
    fetcher = createIsomorphicNativeFetcher(),
    config?: RestServiceClientConfig,
  ) {
    super(baseUrl, fetcher, config);
  }
}
