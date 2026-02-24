import type * as types from './types';
import type { ConfigOptions, FetchResponse } from 'api/dist/core'
import Oas from 'oas';
import APICore from 'api/dist/core';
import definition from './openapi.json';

class SDK {
  spec: Oas;
  core: APICore;

  constructor() {
    this.spec = Oas.init(definition);
    this.core = new APICore(this.spec, 'bamboohr/1.0 (api/6.1.3)');
  }

  /**
   * Optionally configure various options that the SDK allows.
   *
   * @param config Object of supported SDK options and toggles.
   * @param config.timeout Override the default `fetch` request timeout of 30 seconds. This number
   * should be represented in milliseconds.
   */
  config(config: ConfigOptions) {
    this.core.setConfig(config);
  }

  /**
   * If the API you're using requires authentication you can supply the required credentials
   * through this method and the library will magically determine how they should be used
   * within your API request.
   *
   * With the exception of OpenID and MutualTLS, it supports all forms of authentication
   * supported by the OpenAPI specification.
   *
   * @example <caption>HTTP Basic auth</caption>
   * sdk.auth('username', 'password');
   *
   * @example <caption>Bearer tokens (HTTP or OAuth 2)</caption>
   * sdk.auth('myBearerToken');
   *
   * @example <caption>API Keys</caption>
   * sdk.auth('myApiKey');
   *
   * @see {@link https://spec.openapis.org/oas/v3.0.3#fixed-fields-22}
   * @see {@link https://spec.openapis.org/oas/v3.1.0#fixed-fields-22}
   * @param values Your auth credentials for the API; can specify up to two strings or numbers.
   */
  auth(...values: string[] | number[]) {
    this.core.setAuth(...values);
    return this;
  }

  /**
   * If the API you're using offers alternate server URLs, and server variables, you can tell
   * the SDK which one to use with this method. To use it you can supply either one of the
   * server URLs that are contained within the OpenAPI definition (along with any server
   * variables), or you can pass it a fully qualified URL to use (that may or may not exist
   * within the OpenAPI definition).
   *
   * @example <caption>Server URL with server variables</caption>
   * sdk.server('https://{region}.api.example.com/{basePath}', {
   *   name: 'eu',
   *   basePath: 'v14',
   * });
   *
   * @example <caption>Fully qualified server URL</caption>
   * sdk.server('https://eu.api.example.com/v14');
   *
   * @param url Server URL
   * @param variables An object of variables to replace into the server URL.
   */
  server(url: string, variables = {}) {
    this.core.setServer(url, variables);
  }

  /**
   * Create a time tracking project with optional tasks.
   *
   * @summary Create Time Tracking Project
   * @throws FetchError<400, types.CreateTimeTrackingProjectResponse400> Bad request parameters.
   * @throws FetchError<401, types.CreateTimeTrackingProjectResponse401> Unauthorized. Invalid API credentials.
   * @throws FetchError<403, types.CreateTimeTrackingProjectResponse403> Forbidden. Insufficient user permissions or API access is not turned on.
   * @throws FetchError<406, types.CreateTimeTrackingProjectResponse406> Request not acceptable.
   * @throws FetchError<409, types.CreateTimeTrackingProjectResponse409> There was a conflict with the request.
   */
  createTimeTrackingProject(body: types.CreateTimeTrackingProjectBodyParam): Promise<FetchResponse<201, types.CreateTimeTrackingProjectResponse201>> {
    return this.core.fetch('/api/v1/time_tracking/projects', 'post', body);
  }

  /**
   * Delete timesheet clock entries.
   *
   * @summary Delete Timesheet Clock Entries
   * @throws FetchError<400, types.DeleteTimesheetClockEntriesViaPostResponse400> Invalid information passed in.
   * @throws FetchError<403, types.DeleteTimesheetClockEntriesViaPostResponse403> Missing permissions or timesheet already approved.
   * @throws FetchError<404, types.DeleteTimesheetClockEntriesViaPostResponse404> Id not found.
   * @throws FetchError<409, types.DeleteTimesheetClockEntriesViaPostResponse409> If clock timesheet, may still be clocked in. Have to clock out first.
   * @throws FetchError<412, types.DeleteTimesheetClockEntriesViaPostResponse412> Invalid company configuration or timezone.
   * @throws FetchError<500, types.DeleteTimesheetClockEntriesViaPostResponse500> Server error.
   */
  deleteTimesheetClockEntriesViaPost(body: types.DeleteTimesheetClockEntriesViaPostBodyParam): Promise<FetchResponse<number, unknown>> {
    return this.core.fetch('/api/v1/time_tracking/clock_entries/delete', 'post', body);
  }

  /**
   * Delete timesheet hour entries.
   *
   * @summary Delete Timesheet Hour Entries
   * @throws FetchError<400, types.DeleteTimesheetHourEntriesViaPostResponse400> Bad request parameters.
   * @throws FetchError<401, types.DeleteTimesheetHourEntriesViaPostResponse401> Unauthorized. Invalid API credentials.
   * @throws FetchError<403, types.DeleteTimesheetHourEntriesViaPostResponse403> Forbidden. Insufficient user permissions or API access is not turned on.
   * @throws FetchError<406, types.DeleteTimesheetHourEntriesViaPostResponse406> Request not acceptable.
   * @throws FetchError<409, types.DeleteTimesheetHourEntriesViaPostResponse409> There was a conflict with the request.
   * @throws FetchError<412, types.DeleteTimesheetHourEntriesViaPostResponse412> Invalid time tracking configuration or timezone.
   * @throws FetchError<500, types.DeleteTimesheetHourEntriesViaPostResponse500> Internal server error.
   */
  deleteTimesheetHourEntriesViaPost(body: types.DeleteTimesheetHourEntriesViaPostBodyParam): Promise<FetchResponse<number, unknown>> {
    return this.core.fetch('/api/v1/time_tracking/hour_entries/delete', 'post', body);
  }

  /**
   * Get all timesheet entries for a given period of time.
   *
   * @summary Get Timesheet Entries
   * @throws FetchError<400, types.GetTimesheetEntriesResponse400> Bad request parameters.
   * @throws FetchError<401, types.GetTimesheetEntriesResponse401> Unauthorized. Invalid API credentials.
   * @throws FetchError<403, types.GetTimesheetEntriesResponse403> Insufficient user permissions or API access is not turned on.
   * @throws FetchError<500, types.GetTimesheetEntriesResponse500> Server error.
   */
  getTimesheetEntries(metadata: types.GetTimesheetEntriesMetadataParam): Promise<FetchResponse<200, types.GetTimesheetEntriesResponse200>> {
    return this.core.fetch('/api/v1/time_tracking/timesheet_entries', 'get', metadata);
  }

  /**
   * Clock in an employee.
   *
   * @summary Create Timesheet Clock-In Entry
   * @throws FetchError<400, types.AddTimesheetClockInEntryResponse400> Bad request parameters.
   * @throws FetchError<401, types.AddTimesheetClockInEntryResponse401> Unauthorized. Invalid API credentials.
   * @throws FetchError<403, types.AddTimesheetClockInEntryResponse403> Forbidden. Insufficient user permissions or API access is not turned on.
   * @throws FetchError<406, types.AddTimesheetClockInEntryResponse406> Request not acceptable.
   * @throws FetchError<409, types.AddTimesheetClockInEntryResponse409> There was a conflict with the request.
   */
  addTimesheetClockInEntry(body: types.AddTimesheetClockInEntryBodyParam, metadata: types.AddTimesheetClockInEntryMetadataParam): Promise<FetchResponse<200, types.AddTimesheetClockInEntryResponse200>>;
  addTimesheetClockInEntry(metadata: types.AddTimesheetClockInEntryMetadataParam): Promise<FetchResponse<200, types.AddTimesheetClockInEntryResponse200>>;
  addTimesheetClockInEntry(body?: types.AddTimesheetClockInEntryBodyParam | types.AddTimesheetClockInEntryMetadataParam, metadata?: types.AddTimesheetClockInEntryMetadataParam): Promise<FetchResponse<200, types.AddTimesheetClockInEntryResponse200>> {
    return this.core.fetch('/api/v1/time_tracking/employees/{employeeId}/clock_in', 'post', body, metadata);
  }

  /**
   * Clock out an employee.
   *
   * @summary Create Timesheet Clock-Out Entry
   * @throws FetchError<400, types.AddTimesheetClockOutEntryResponse400> Bad request parameters.
   * @throws FetchError<401, types.AddTimesheetClockOutEntryResponse401> Unauthorized. Invalid API credentials.
   * @throws FetchError<403, types.AddTimesheetClockOutEntryResponse403> Forbidden. Insufficient user permissions or API access is not turned on.
   * @throws FetchError<406, types.AddTimesheetClockOutEntryResponse406> Request not acceptable.
   * @throws FetchError<409, types.AddTimesheetClockOutEntryResponse409> There was a conflict with the request.
   * @throws FetchError<500, types.AddTimesheetClockOutEntryResponse500> Server error.
   */
  addTimesheetClockOutEntry(body: types.AddTimesheetClockOutEntryBodyParam, metadata: types.AddTimesheetClockOutEntryMetadataParam): Promise<FetchResponse<200, types.AddTimesheetClockOutEntryResponse200>>;
  addTimesheetClockOutEntry(metadata: types.AddTimesheetClockOutEntryMetadataParam): Promise<FetchResponse<200, types.AddTimesheetClockOutEntryResponse200>>;
  addTimesheetClockOutEntry(body?: types.AddTimesheetClockOutEntryBodyParam | types.AddTimesheetClockOutEntryMetadataParam, metadata?: types.AddTimesheetClockOutEntryMetadataParam): Promise<FetchResponse<200, types.AddTimesheetClockOutEntryResponse200>> {
    return this.core.fetch('/api/v1/time_tracking/employees/{employeeId}/clock_out', 'post', body, metadata);
  }

  /**
   * Add or edit timesheet clock entries.
   *
   * @summary Create or Update Timesheet Clock Entries
   * @throws FetchError<400, types.AddEditTimesheetClockEntriesResponse400> Bad request parameters.
   * @throws FetchError<401, types.AddEditTimesheetClockEntriesResponse401> Unauthorized. Invalid API credentials.
   * @throws FetchError<403, types.AddEditTimesheetClockEntriesResponse403> Forbidden. Insufficient user permissions or API access is not turned on.
   * @throws FetchError<406, types.AddEditTimesheetClockEntriesResponse406> Request not acceptable.
   * @throws FetchError<409, types.AddEditTimesheetClockEntriesResponse409> There was a conflict with the request.
   * @throws FetchError<500, types.AddEditTimesheetClockEntriesResponse500> Internal server error.
   */
  addEditTimesheetClockEntries(body: types.AddEditTimesheetClockEntriesBodyParam): Promise<FetchResponse<201, types.AddEditTimesheetClockEntriesResponse201>> {
    return this.core.fetch('/api/v1/time_tracking/clock_entries/store', 'post', body);
  }

  /**
   * Add or edit timesheet hour entries.
   *
   * @summary Create or Update Timesheet Hour Entries
   * @throws FetchError<400, types.AddEditTimesheetHourEntriesResponse400> Bad request parameters.
   * @throws FetchError<401, types.AddEditTimesheetHourEntriesResponse401> Unauthorized. Invalid API credentials.
   * @throws FetchError<403, types.AddEditTimesheetHourEntriesResponse403> Forbidden. Insufficient user permissions or API access is not turned on.
   * @throws FetchError<406, types.AddEditTimesheetHourEntriesResponse406> Request not acceptable.
   * @throws FetchError<409, types.AddEditTimesheetHourEntriesResponse409> There was a conflict with the request.
   * @throws FetchError<500, types.AddEditTimesheetHourEntriesResponse500> Internal server error.
   */
  addEditTimesheetHourEntries(body: types.AddEditTimesheetHourEntriesBodyParam): Promise<FetchResponse<201, types.AddEditTimesheetHourEntriesResponse201>> {
    return this.core.fetch('/api/v1/time_tracking/hour_entries/store', 'post', body);
  }

  /**
   * Gets as list of webhooks for the user API key.
   *
   * @summary Get Webhooks
   * @throws FetchError<401, types.GetWebhookListResponse401> The user API key is invalid.
   * @throws FetchError<500, types.GetWebhookListResponse500> Internal error
   */
  getWebhookList(): Promise<FetchResponse<200, types.GetWebhookListResponse200>> {
    return this.core.fetch('/api/v1/webhooks', 'get');
  }

  /**
   * Add a new Webhook. For more details or instructions you can refer to the [webhooks
   * documentation](https://documentation.bamboohr.com/docs/webhooks-2).
   *
   * @summary Create Webhook
   * @throws FetchError<400, types.PostWebhookResponse400> Provided JSON is bad, missing required fields, or mulitple access levels.
   * @throws FetchError<401, types.PostWebhookResponse401> The user API key is invalid.
   * @throws FetchError<403, types.PostWebhookResponse403> Permission violations in the fields selected.
   * @throws FetchError<500, types.PostWebhookResponse500> Internal error
   */
  postWebhook(body: types.PostWebhookBodyParam): Promise<FetchResponse<201, types.PostWebhookResponse201>> {
    return this.core.fetch('/api/v1/webhooks', 'post', body);
  }

  /**
   * Get webhook data that is tied to a specific user API Key.
   *
   * @summary Get Webhook
   * @throws FetchError<401, types.GetWebhookResponse401> The user API key is invalid.
   * @throws FetchError<403, types.GetWebhookResponse403> The API user key does not have permission to see the requested webhook.
   * @throws FetchError<404, types.GetWebhookResponse404> The webhook does not exist.
   * @throws FetchError<500, types.GetWebhookResponse500> Internal error
   */
  getWebhook(metadata: types.GetWebhookMetadataParam): Promise<FetchResponse<200, types.GetWebhookResponse200>> {
    return this.core.fetch('/api/v1/webhooks/{id}', 'get', metadata);
  }

  /**
   * Update a webhook, based on webhook ID.
   *
   * @summary Update Webhook
   * @throws FetchError<400, types.PutWebhookResponse400> Provided JSON is bad, missing required fields, or mulitple access levels.
   * @throws FetchError<401, types.PutWebhookResponse401> The user API key is invalid.
   * @throws FetchError<403, types.PutWebhookResponse403> Permission violations in the fields selected, or the user does not have access to the
   * webhook.
   * @throws FetchError<404, types.PutWebhookResponse404> The webhook to be updated doesn\'t exist.
   * @throws FetchError<500, types.PutWebhookResponse500> Internal error
   */
  putWebhook(body: types.PutWebhookBodyParam, metadata: types.PutWebhookMetadataParam): Promise<FetchResponse<200, types.PutWebhookResponse200>> {
    return this.core.fetch('/api/v1/webhooks/{id}', 'put', body, metadata);
  }

  /**
   * Delete a webhook that is tied to a specific user API Key.
   *
   * @summary Delete Webhook
   * @throws FetchError<401, types.DeleteWebhookResponse401> The user API key is invalid.
   * @throws FetchError<403, types.DeleteWebhookResponse403> The API user key does not have permission to delete the requested webhook.
   * @throws FetchError<404, types.DeleteWebhookResponse404> The webhook to be deleted doesn\'t exist.
   * @throws FetchError<500, types.DeleteWebhookResponse500> Internal error
   */
  deleteWebhook(metadata: types.DeleteWebhookMetadataParam): Promise<FetchResponse<200, types.DeleteWebhookResponse200>> {
    return this.core.fetch('/api/v1/webhooks/{id}', 'delete', metadata);
  }

  /**
   * Get webhook logs for specific webhook id that is associated with the user API Key.
   *
   * @summary Get Webhook Logs
   * @throws FetchError<403, types.GetWebhookLogsResponse403> The API user key is invalid, or does not have permission to see the requested webhook.
   * @throws FetchError<404, types.GetWebhookLogsResponse404> The webhook does not exist.
   * @throws FetchError<500, types.GetWebhookLogsResponse500> Internal error
   */
  getWebhookLogs(metadata: types.GetWebhookLogsMetadataParam): Promise<FetchResponse<200, types.GetWebhookLogsResponse200>> {
    return this.core.fetch('/api/v1/webhooks/{id}/log', 'get', metadata);
  }

  /**
   * Get a list fields webhooks can monitor
   *
   * @summary Get Monitor Fields
   * @throws FetchError<401, types.GetMonitorFieldsResponse401> The user API key is invalid.
   * @throws FetchError<500, types.GetMonitorFieldsResponse500> Internal error
   */
  getMonitorFields(): Promise<FetchResponse<200, types.GetMonitorFieldsResponse200>> {
    return this.core.fetch('/api/v1/webhooks/monitor_fields', 'get');
  }

  /**
   * Use this resource to request data from the specified dataset. You must specify a list of
   * fields to show on the report. The list of fields is available here at
   * /api/v1/datasets/{datasetName}/fields.
   *
   * ***Field Settings:***
   *
   *
   * **Show History**
   * When any of the fields included in your request are historical table fields, you may
   * include the "showHistory" setting. Example: "showHistory":["entityName"]. Entity Name
   * can be found in the get /api/v1/datasets/{datasetName}/fields endpoint.
   *
   * **Sort By:**
   * You can pass multiple fields to sort by as an array of objects {field: "fieldName",
   * sort: "asc,desc"}. The order of the fields in the array will determine the order of the
   * sort.
   *
   * **Group By:**
   * Group By is passed as an array of strings but currently grouping by more than one field
   * is not supported.
   *
   * **Aggregations:**
   * When using aggregations the following aggregates are available based on field type:
   *   - **text**
   *     - count
   *   - **date**
   *     - count
   *     - min
   *     - max
   *   - **int**
   *     - count
   *     - min
   *     - max
   *     - sum
   *     - avg
   *   - **bool**
   *     - count
   *   - **options**
   *     - count
   *   - **ssnText**
   *     - count
   *
   * **Filters:**
   * When using filters, the filtered field does not have to be in the list of fields you
   * want to show on the report.
   *
   * **Important Filter Notes:**
   *   - **List filter values** (for "options" field type using "includes" or
   * "does_not_include" operators) must be enclosed in square brackets [ ]. Example:
   * ["value1", "value2"]
   *   - **Future hires**: Future hires have a status of "Inactive" in the datasets API. To
   * include future hires in your results, you must include "Inactive" in your status filter.
   *
   * Use the `/api/v1/datasets/{datasetName}/field-options` endpoint to retrieve possible
   * filter values for fields. Use the "id" returned from the field-options endpoint.
   *
   * **Filter Operators by Field Type:**
   *   - **text**
   *     - contains
   *     - does_not_contain
   *     - equal
   *     - not_equal
   *     - empty
   *     - not_empty
   *   - **date**
   *     - lt (less than)
   *     - lte (less than or equal)
   *     - gt (greater than)
   *     - gte (greater than or equal)
   *     - last - Uses an object for the value: {"duration": "5", "unit": "years"}. Unit can
   * be "days", "weeks", "months", or "years". Duration is a number as a string.
   *     - next - Uses an object for the value: {"duration": "5", "unit": "years"}. Unit can
   * be "days", "weeks", "months", or "years". Duration is a number as a string.
   *     - range - Uses an object for the value: {"start": "2023-01-01", "end":
   * "2023-12-31"}. Dates must be in YYYY-MM-DD format.
   *     - equal
   *     - not_equal
   *     - empty
   *     - not_empty
   *   - **int**
   *     - equal
   *     - not_equal
   *     - gte
   *     - gt
   *     - lte
   *     - lt
   *     - empty
   *     - not_empty
   *   - **bool**
   *     - checked
   *     - not_checked
   *   - **options**
   *     - includes
   *     - does_not_include
   *     - empty
   *     - not_empty
   *   - **ssnText**:
   *     - empty
   *     - not_empty
   *
   * @summary Get Data from Dataset
   * @throws FetchError<400, types.GetDataFromDatasetResponse400> Invalid or missing argument(s)
   * @throws FetchError<403, types.GetDataFromDatasetResponse403> You do not have permissions to hit this endpoint
   * @throws FetchError<500, types.GetDataFromDatasetResponse500> An unexpected error occurred while getting the data
   */
  getDataFromDataset(body: types.GetDataFromDatasetBodyParam, metadata: types.GetDataFromDatasetMetadataParam): Promise<FetchResponse<200, types.GetDataFromDatasetResponse200>> {
    return this.core.fetch('/api/v1/datasets/{datasetName}', 'post', body, metadata);
  }

  /**
   * Use this resource to retrieve data for a specific report.
   *
   * @summary Get Report by ID
   * @throws FetchError<400, types.GetByReportIdResponse400> Invalid or missing argument(s)
   * @throws FetchError<403, types.GetByReportIdResponse403> Access denied
   * @throws FetchError<404, types.GetByReportIdResponse404> Report not found
   * @throws FetchError<500, types.GetByReportIdResponse500> An unexpected error occurred while getting a report
   */
  getByReportId(metadata: types.GetByReportIdMetadataParam): Promise<FetchResponse<200, types.GetByReportIdResponse200>> {
    return this.core.fetch('/api/v1/custom-reports/{reportId}', 'get', metadata);
  }

  /**
   * Use this resource to retrieve the available datasets to query data from.
   *
   * @summary Get Datasets
   * @throws FetchError<403, types.GetDatasetsResponse403> You do not have permissions to hit this endpoint
   * @throws FetchError<500, types.GetDatasetsResponse500> Internal error getting the datasets
   */
  getDatasets(): Promise<FetchResponse<200, types.GetDatasetsResponse200>> {
    return this.core.fetch('/api/v1/datasets', 'get');
  }

  /**
   * Use this resource to request the available fields on a dataset.
   *
   * @summary Get Fields from Dataset
   * @throws FetchError<400, types.GetFieldsFromDatasetResponse400> Dataset label not found for dataset
   * @throws FetchError<403, types.GetFieldsFromDatasetResponse403> You do not have permissions to hit this endpoint
   * @throws FetchError<500, types.GetFieldsFromDatasetResponse500> Something went wrong while fetching the dataset configuration
   */
  getFieldsFromDataset(metadata: types.GetFieldsFromDatasetMetadataParam): Promise<FetchResponse<200, types.GetFieldsFromDatasetResponse200>> {
    return this.core.fetch('/api/v1/datasets/{datasetName}/fields', 'get', metadata);
  }

  /**
   * Use this resource to retrieve a list of available reports.
   *
   * @summary Get Reports
   * @throws FetchError<403, types.ListReportsResponse403> Access denied
   * @throws FetchError<500, types.ListReportsResponse500> An unexpected error occurred while getting the list of reports
   */
  listReports(metadata?: types.ListReportsMetadataParam): Promise<FetchResponse<200, types.ListReportsResponse200>> {
    return this.core.fetch('/api/v1/custom-reports', 'get', metadata);
  }

  /**
   * Use this resource to retrieve a list of possible values for a field. For RFC 7807
   * compliant error responses, use the v1.2 endpoint: POST
   * /api/v1_2/datasets/{datasetName}/field-options
   *
   * @summary Get Field Options
   * @throws FetchError<400, types.GetFieldOptionsResponse400> Bad request - invalid fields, filters, or request format
   * @throws FetchError<403, types.GetFieldOptionsResponse403> Permissions error - user does not have access to this dataset
   * @throws FetchError<500, types.GetFieldOptionsResponse500> Internal server error
   */
  getFieldOptions(body: types.GetFieldOptionsBodyParam, metadata: types.GetFieldOptionsMetadataParam): Promise<FetchResponse<200, types.GetFieldOptionsResponse200>> {
    return this.core.fetch('/api/v1/datasets/{datasetName}/field-options', 'post', body, metadata);
  }

  /**
   * Use this resource to retrieve the available datasets to query data from. Each dataset
   * represents a collection of related data that can be filtered, sorted, and retrieved
   * through other dataset endpoints. Returns a list of dataset names and their
   * human-readable labels. V1.2 endpoint with RFC 7807 compliant error responses.
   *
   * @summary Get Datasets v1.2
   * @throws FetchError<403, types.GetDatasetsV12Response403> Forbidden - insufficient permissions to access datasets
   * @throws FetchError<500, types.GetDatasetsV12Response500> Internal server error while retrieving datasets
   */
  getDatasetsV12(): Promise<FetchResponse<200, types.GetDatasetsV12Response200>> {
    return this.core.fetch('/api/v1_2/datasets', 'get');
  }

  /**
   * Use this resource to request the available fields on a dataset. V1.2 endpoint with RFC
   * 7807 compliant error responses.
   *
   * @summary Get Fields from Dataset v1.2
   * @throws FetchError<403, types.GetFieldsFromDatasetV12Response403> You do not have permissions to hit this endpoint
   * @throws FetchError<422, types.GetFieldsFromDatasetV12Response422> Dataset not found
   * @throws FetchError<500, types.GetFieldsFromDatasetV12Response500> Something went wrong while fetching the dataset configuration
   */
  getFieldsFromDatasetV12(metadata: types.GetFieldsFromDatasetV12MetadataParam): Promise<FetchResponse<200, types.GetFieldsFromDatasetV12Response200>> {
    return this.core.fetch('/api/v1_2/datasets/{datasetName}/fields', 'get', metadata);
  }

  /**
   * Use this resource to retrieve a list of possible values for specified fields. V1.2
   * endpoint with RFC 7807 compliant error responses.
   *
   * @summary Get Field Options v1.2
   * @throws FetchError<400, types.GetFieldOptionsV12Response400> Bad request - invalid fields, filters, or request format
   * @throws FetchError<403, types.GetFieldOptionsV12Response403> Permissions error - user does not have access to this dataset
   * @throws FetchError<500, types.GetFieldOptionsV12Response500> Internal server error
   */
  getFieldOptionsV12(body: types.GetFieldOptionsV12BodyParam, metadata: types.GetFieldOptionsV12MetadataParam): Promise<FetchResponse<200, types.GetFieldOptionsV12Response200>> {
    return this.core.fetch('/api/v1_2/datasets/{datasetName}/field-options', 'post', body, metadata);
  }

  /**
   * Get a list of applications. The owner of the API key used must have access to ATS
   * settings. Combine as many different optional parameter filters as you like.
   *
   * @summary Get Job Applications
   * @throws FetchError<400, types.GetApplicationsResponse400> Bad request parameters.
   * @throws FetchError<401, types.GetApplicationsResponse401> Unauthorized. Invalid API credentials.
   * @throws FetchError<403, types.GetApplicationsResponse403> Insufficient user permissions or API access is not turned on.
   */
  getApplications(metadata?: types.GetApplicationsMetadataParam): Promise<FetchResponse<200, types.GetApplicationsResponse200>> {
    return this.core.fetch('/api/v1/applicant_tracking/applications', 'get', metadata);
  }

  /**
   * Get a list of statuses for a company. The owner of the API key used must have access to
   * ATS settings.
   *
   * @summary Get Applicant Statuses
   * @throws FetchError<401, types.GetStatusesResponse401> Unauthorized. Invalid API credentials.
   * @throws FetchError<403, types.GetStatusesResponse403> Insufficient user permissions or API access is not turned on.
   */
  getStatuses(): Promise<FetchResponse<200, types.GetStatusesResponse200>> {
    return this.core.fetch('/api/v1/applicant_tracking/statuses', 'get');
  }

  /**
   * Get company locations for use in creating a new job opening. The owner of the API key
   * used must have access to ATS settings.
   *
   * @summary Get Company Locations
   * @throws FetchError<401, types.GetCompanyLocationsResponse401> Unauthorized. Invalid API credentials.
   * @throws FetchError<403, types.GetCompanyLocationsResponse403> Insufficient user permissions or API access is not turned on.
   * @throws FetchError<404, types.GetCompanyLocationsResponse404> Bad request url.
   */
  getCompanyLocations(): Promise<FetchResponse<200, types.GetCompanyLocationsResponse200>> {
    return this.core.fetch('/api/v1/applicant_tracking/locations', 'get');
  }

  /**
   * Get potential hiring leads for use in creating a new job opening. The owner of the API
   * key used must have access to ATS settings.
   *
   * @summary Get Hiring Leads
   * @throws FetchError<401, types.GetHiringLeadsResponse401> Unauthorized. Invalid API credentials.
   * @throws FetchError<403, types.GetHiringLeadsResponse403> Insufficient user permissions or API access is not turned on.
   * @throws FetchError<404, types.GetHiringLeadsResponse404> Bad request url.
   */
  getHiringLeads(): Promise<FetchResponse<200, types.GetHiringLeadsResponse200>> {
    return this.core.fetch('/api/v1/applicant_tracking/hiring_leads', 'get');
  }

  /**
   * Add a new candidate application to a job opening. The owner of the API key used must
   * have access to ATS settings.
   *
   * @summary Create Candidate
   * @throws FetchError<401, types.AddNewCandidateResponse401> Unauthorized. Invalid API credentials.
   * @throws FetchError<403, types.AddNewCandidateResponse403> Insufficient user permissions or API access is not turned on.
   * @throws FetchError<404, types.AddNewCandidateResponse404> Bad request url.
   * @throws FetchError<422, types.AddNewCandidateResponse422> Unprocessable entity. One or more parameters failed validation.
   */
  addNewCandidate(body: types.AddNewCandidateBodyParam): Promise<FetchResponse<200, types.AddNewCandidateResponse200>> {
    return this.core.fetch('/api/v1/applicant_tracking/application', 'post', body);
  }

  /**
   * Add a new job opening. The owner of the API key used must have access to ATS settings.
   *
   * @summary Create Job Opening
   * @throws FetchError<401, types.AddNewJobOpeningResponse401> Unauthorized. Invalid API credentials.
   * @throws FetchError<403, types.AddNewJobOpeningResponse403> Insufficient user permissions or API access is not turned on.
   * @throws FetchError<404, types.AddNewJobOpeningResponse404> Bad request url.
   * @throws FetchError<422, types.AddNewJobOpeningResponse422> Unprocessable entity. One or more parameters failed validation.
   */
  addNewJobOpening(body: types.AddNewJobOpeningBodyParam): Promise<FetchResponse<200, types.AddNewJobOpeningResponse200>> {
    return this.core.fetch('/api/v1/applicant_tracking/job_opening', 'post', body);
  }

  /**
   * Get a list of company benefits
   *
   * @summary Get Company Benefits
   */
  getCompanyBenefits(): Promise<FetchResponse<200, types.GetCompanyBenefitsResponse200>> {
    return this.core.fetch('/api/v1/benefit/company_benefit', 'get');
  }

  /**
   * Get a list of employee benefits
   *
   * @summary Get Employee Benefits
   */
  getEmployeeBenefit(body?: types.GetEmployeeBenefitBodyParam, metadata?: types.GetEmployeeBenefitMetadataParam): Promise<FetchResponse<200, types.GetEmployeeBenefitResponse200>> {
    return this.core.fetch('/api/v1/benefit/employee_benefit', 'get', body, metadata);
  }

  /**
   * Get a list of member benefit events
   *
   * @summary Get Member Benefit Events
   */
  getMemberBenefit(): Promise<FetchResponse<200, types.GetMemberBenefitResponse200>> {
    return this.core.fetch('/api/v1/benefit/member_benefit', 'get');
  }

  /**
   * Retrieves a paginated list of member benefits for a specified calendar year. Returns
   * benefit enrollment data including member IDs, subscriber IDs, plan IDs, and date ranges
   * with enrollment status. Requires benefit admin permissions.
   *
   * @summary Get Member Benefits
   * @throws FetchError<400, types.GetMemberBenefitsResponse400> Validation error
   * @throws FetchError<403, types.GetMemberBenefitsResponse403> Permission denied
   */
  getMemberBenefits(metadata: types.GetMemberBenefitsMetadataParam): Promise<FetchResponse<200, types.GetMemberBenefitsResponse200>> {
    return this.core.fetch('/api/v1/benefits/member-benefits', 'get', metadata);
  }

  /**
   * Get benefit deduction types
   *
   * @summary Get Benefit Deduction Types
   */
  getBenefitDeductionTypes(): Promise<FetchResponse<200, types.GetBenefitDeductionTypesResponse200>> {
    return this.core.fetch('/api/v1/benefits/settings/deduction_types/all', 'get');
  }

  /**
   * Gets Company Information
   *
   * @summary Get Company Information
   */
  getCompanyInformation(): Promise<FetchResponse<200, types.GetCompanyInformationResponse200>> {
    return this.core.fetch('/api/v1/company_information', 'get');
  }

  /**
   * Retrieve a paginated list of employees with optional filtering and sorting. Returns a
   * fixed set of simple employee fields that support efficient filter and sort operations.
   * For more complex employee data, use the single-employee endpoint or the Datasets API for
   * bulk queries.
   *
   * @summary Get Employees
   * @throws FetchError<400, types.GetEmployeesListResponse400> Bad Request — invalid parameters provided.
   */
  getEmployeesList(metadata?: types.GetEmployeesListMetadataParam): Promise<FetchResponse<200, types.GetEmployeesListResponse200>> {
    return this.core.fetch('/api/v1/employees', 'get', metadata);
  }

  /**
   * Add a new employee. New employees must have at least a first name and a last name. The
   * ID of the newly created employee is included in the Location header of the response.
   * Other fields can be included. Please see the [fields](ref:metadata-get-a-list-of-fields)
   * endpoint. New Employees added to a pay schedule synced with Trax Payroll must have the
   * following required fields (listed by API field name): employeeNumber, firstName,
   * lastName, dateOfBirth, ssn or ein, gender, maritalStatus, hireDate, address1, city,
   * state, country, employmentHistoryStatus, exempt, payType, payRate, payPer, location,
   * department, and division.
   *
   * @summary Create Employee
   * @throws FetchError<400, types.AddEmployeeResponse400> If the posted XML or JSON is invalid or the minimum fields are not provided.
   * @throws FetchError<403, types.AddEmployeeResponse403> If the API user does not have permission to add an employee.
   * @throws FetchError<409, types.AddEmployeeResponse409> If an employee field was given an invalid value.
   */
  addEmployee(body: types.AddEmployeeBodyParam): Promise<FetchResponse<201, types.AddEmployeeResponse201>> {
    return this.core.fetch('/api/v1/employees', 'post', body);
  }

  /**
   * Updates a table row. If employee is currently on a pay schedule syncing with Trax
   * Payroll, or being added to one, the row cannot be added if they are missing any required
   * fields for that table. If the API user is updating a row on the compensation table, the
   * row cannot be updated if they are missing any of the required employee fields (including
   * fields not on that table).
   *
   * @summary Update Table Row
   * @throws FetchError<400, types.UpdateEmployeeTableRowResponse400> Invalid or missing required fields.
   * @throws FetchError<403, types.UpdateEmployeeTableRowResponse403> Permission denied.
   * @throws FetchError<406, types.UpdateEmployeeTableRowResponse406> An error with one or more of the fields.
   */
  updateEmployeeTableRow(body: types.UpdateEmployeeTableRowBodyParam, metadata: types.UpdateEmployeeTableRowMetadataParam): Promise<FetchResponse<200, types.UpdateEmployeeTableRowResponse200>> {
    return this.core.fetch('/api/v1/employees/{id}/tables/{table}/{rowId}', 'post', body, metadata);
  }

  /**
   * Deletes a table row
   *
   * @summary Delete Table Row
   * @throws FetchError<400, types.DeleteEmployeeTableRowV1Response400> Bad request. Invalid employee ID or table name.
   * @throws FetchError<401, types.DeleteEmployeeTableRowV1Response401> Unauthorized.
   * @throws FetchError<403, types.DeleteEmployeeTableRowV1Response403> Permission denied.
   */
  deleteEmployeeTableRowV1(metadata: types.DeleteEmployeeTableRowV1MetadataParam): Promise<FetchResponse<200, types.DeleteEmployeeTableRowV1Response200>> {
    return this.core.fetch('/api/v1/employees/{id}/tables/{table}/{rowId}', 'delete', metadata);
  }

  /**
   * Gets an company file
   *
   * @summary Get Company File
   * @throws FetchError<403, types.GetCompanyFileResponse403> if the API user does not have permission to see the company files.
   * @throws FetchError<404, types.GetCompanyFileResponse404> if the file was not found.
   */
  getCompanyFile(metadata: types.GetCompanyFileMetadataParam): Promise<FetchResponse<200, types.GetCompanyFileResponse200>> {
    return this.core.fetch('/api/v1/files/{fileId}', 'get', metadata);
  }

  /**
   * Update a company file
   *
   * @summary Update Company File
   * @throws FetchError<400, types.UpdateCompanyFileResponse400> if the posted JSON is invalid.
   * @throws FetchError<403, types.UpdateCompanyFileResponse403> if the API user does not have permission to see the company files.
   * @throws FetchError<404, types.UpdateCompanyFileResponse404> if the file or category was not found.
   */
  updateCompanyFile(body: types.UpdateCompanyFileBodyParam, metadata: types.UpdateCompanyFileMetadataParam): Promise<FetchResponse<200, types.UpdateCompanyFileResponse200>> {
    return this.core.fetch('/api/v1/files/{fileId}', 'post', body, metadata);
  }

  /**
   * Delete a company file
   *
   * @summary Delete Company File
   * @throws FetchError<403, types.DeleteCompanyFileResponse403> if the API user does not have permission to see the requested file.
   * @throws FetchError<404, types.DeleteCompanyFileResponse404> if the file was not found.
   */
  deleteCompanyFile(metadata: types.DeleteCompanyFileMetadataParam): Promise<FetchResponse<200, types.DeleteCompanyFileResponse200>> {
    return this.core.fetch('/api/v1/files/{fileId}', 'delete', metadata);
  }

  /**
   * Gets an employee file
   *
   * @summary Get Employee File
   * @throws FetchError<403, types.GetEmployeeFileResponse403> if the API user does not have permission to see the requested employee or the
   * employee\'s files.
   * @throws FetchError<404, types.GetEmployeeFileResponse404> if the employee file was not found.
   */
  getEmployeeFile(metadata: types.GetEmployeeFileMetadataParam): Promise<FetchResponse<200, types.GetEmployeeFileResponse200>> {
    return this.core.fetch('/api/v1/employees/{id}/files/{fileId}', 'get', metadata);
  }

  /**
   * Update an employee file
   *
   * @summary Update Employee File
   * @throws FetchError<400, types.UpdateEmployeeFileResponse400> Invalid JSON
   * @throws FetchError<403, types.UpdateEmployeeFileResponse403> if the API user does not have permission to see the requested employee or the
   * employee\'s files.
   * @throws FetchError<404, types.UpdateEmployeeFileResponse404> if the employee file or category was not found.
   */
  updateEmployeeFile(body: types.UpdateEmployeeFileBodyParam, metadata: types.UpdateEmployeeFileMetadataParam): Promise<FetchResponse<200, types.UpdateEmployeeFileResponse200>> {
    return this.core.fetch('/api/v1/employees/{id}/files/{fileId}', 'post', body, metadata);
  }

  /**
   * Delete an employee file
   *
   * @summary Delete Employee File
   * @throws FetchError<403, types.DeleteEmployeeFileResponse403> if the API user does not have permission to see the requested employee or the
   * employee\'s files.
   * @throws FetchError<404, types.DeleteEmployeeFileResponse404> if the employee file was not found.
   */
  deleteEmployeeFile(metadata: types.DeleteEmployeeFileMetadataParam): Promise<FetchResponse<200, types.DeleteEmployeeFileResponse200>> {
    return this.core.fetch('/api/v1/employees/{id}/files/{fileId}', 'delete', metadata);
  }

  /**
   * Get the number of goals per status for an employee.
   *
   * @summary Get Goal Filters
   */
  getGoalsFiltersV1(metadata: types.GetGoalsFiltersV1MetadataParam): Promise<FetchResponse<200, types.GetGoalsFiltersV1Response200>> {
    return this.core.fetch('/api/v1/performance/employees/{employeeId}/goals/filters', 'get', metadata);
  }

  /**
   * Get goals for an employee.
   *
   * @summary Get Goals
   */
  getGoals(metadata: types.GetGoalsMetadataParam): Promise<FetchResponse<200, types.GetGoalsResponse200>> {
    return this.core.fetch('/api/v1/performance/employees/{employeeId}/goals', 'get', metadata);
  }

  /**
   * Create a new goal for an employee.
   *
   * @summary Create Goal
   * @throws FetchError<400, types.PostGoalResponse400> If the posted XML or JSON is invalid or the minimum fields are not provided.
   * @throws FetchError<403, types.PostGoalResponse403> If the API user does not have permission to create a goal for this employee.
   * @throws FetchError<500, types.PostGoalResponse500> If there was a problem creating the goal.
   */
  postGoal(body: types.PostGoalBodyParam, metadata: types.PostGoalMetadataParam): Promise<FetchResponse<201, types.PostGoalResponse201>> {
    return this.core.fetch('/api/v1/performance/employees/{employeeId}/goals', 'post', body, metadata);
  }

  /**
   * Update a goal. This version will not update a goal to contain milestones, that
   * functionality is added in version 1.1
   *
   * @summary Update Goal
   * @throws FetchError<400, types.PutGoalV1Response400> The posted JSON is invalid.
   * @throws FetchError<403, types.PutGoalV1Response403> Goal is not editable or insufficient permissions.
   * @throws FetchError<404, types.PutGoalV1Response404> The goal specified by the given goalId was not found.
   * @throws FetchError<500, types.PutGoalV1Response500> If there was a problem updating the goal.
   */
  putGoalV1(body: types.PutGoalV1BodyParam, metadata: types.PutGoalV1MetadataParam): Promise<FetchResponse<200, types.PutGoalV1Response200>> {
    return this.core.fetch('/api/v1/performance/employees/{employeeId}/goals/{goalId}', 'put', body, metadata);
  }

  /**
   * Delete a goal.
   *
   * @summary Delete Goal
   * @throws FetchError<400, types.DeleteGoalResponse400> The posted JSON is invalid.
   * @throws FetchError<403, types.DeleteGoalResponse403> Goal is not editable or insufficient permissions.
   * @throws FetchError<404, types.DeleteGoalResponse404> The goal specified by the given goalId was not found.
   */
  deleteGoal(metadata: types.DeleteGoalMetadataParam): Promise<FetchResponse<204, types.DeleteGoalResponse204>> {
    return this.core.fetch('/api/v1/performance/employees/{employeeId}/goals/{goalId}', 'delete', metadata);
  }

  /**
   * Update the progress percentage of an individual goal.
   *
   * @summary Update Goal Progress
   * @throws FetchError<400, types.PutGoalProgressResponse400> The posted JSON is invalid.
   * @throws FetchError<403, types.PutGoalProgressResponse403> Goal is not editable or insufficient permissions.
   * @throws FetchError<404, types.PutGoalProgressResponse404> No goal found for the given goalId.
   */
  putGoalProgress(body: types.PutGoalProgressBodyParam, metadata: types.PutGoalProgressMetadataParam): Promise<FetchResponse<200, types.PutGoalProgressResponse200>> {
    return this.core.fetch('/api/v1/performance/employees/{employeeId}/goals/{goalId}/progress', 'put', body, metadata);
  }

  /**
   * Update the progress of a milestone in a goal.
   *
   * @summary Update Milestone Progress
   */
  putGoalMilestoneProgress(body: types.PutGoalMilestoneProgressBodyParam, metadata: types.PutGoalMilestoneProgressMetadataParam): Promise<FetchResponse<200, types.PutGoalMilestoneProgressResponse200>> {
    return this.core.fetch('/api/v1/performance/employees/{employeeId}/goals/{goalId}/milestones/{milestoneId}/progress', 'put', body, metadata);
  }

  /**
   * Updates which employees this goal is shared with.
   *
   * @summary Update Goal Sharing
   * @throws FetchError<400, types.PutGoalSharedWithResponse400> The posted JSON is invalid.
   * @throws FetchError<403, types.PutGoalSharedWithResponse403> Goal is not editable or insufficient permissions.
   * @throws FetchError<404, types.PutGoalSharedWithResponse404> No goal found for the given goalId.
   */
  putGoalSharedWith(body: types.PutGoalSharedWithBodyParam, metadata: types.PutGoalSharedWithMetadataParam): Promise<FetchResponse<200, types.PutGoalSharedWithResponse200>> {
    return this.core.fetch('/api/v1/performance/employees/{employeeId}/goals/{goalId}/sharedWith', 'put', body, metadata);
  }

  /**
   * Provides a list of all goals, type counts, goal comment counts, and employees shared
   * with goals for the given employee. This version of the endpoint will not return any
   * goals with milestones. Milestone functionality for this endpoint begins in version 1.2.
   *
   * @summary Get Goals Aggregate
   */
  getGoalsAggregateV1(metadata: types.GetGoalsAggregateV1MetadataParam): Promise<FetchResponse<200, types.GetGoalsAggregateV1Response200>> {
    return this.core.fetch('/api/v1/performance/employees/{employeeId}/goals/aggregate', 'get', metadata);
  }

  /**
   * Determine if the API user has permission to create a goal for this employee.
   *
   * @summary Check Goal Creation Permission
   */
  getCanCreateGoal(metadata: types.GetCanCreateGoalMetadataParam): Promise<FetchResponse<200, types.GetCanCreateGoalResponse200>> {
    return this.core.fetch('/api/v1/performance/employees/{employeeId}/goals/canCreateGoals', 'get', metadata);
  }

  /**
   * Provides a list of employees with whom the specified employee\'s goals may be shared.
   *
   * @summary Get Available Goal Sharing Options
   */
  getGoalsShareOptions(metadata: types.GetGoalsShareOptionsMetadataParam): Promise<FetchResponse<200, types.GetGoalsShareOptionsResponse200>> {
    return this.core.fetch('/api/v1/performance/employees/{employeeId}/goals/shareOptions', 'get', metadata);
  }

  /**
   * Get comments for a goal.
   *
   * @summary Get Goal Comments
   */
  getGoalComments(metadata: types.GetGoalCommentsMetadataParam): Promise<FetchResponse<200, types.GetGoalCommentsResponse200>> {
    return this.core.fetch('/api/v1/performance/employees/{employeeId}/goals/{goalId}/comments', 'get', metadata);
  }

  /**
   * Create a new goal comment.
   *
   * @summary Create Goal Comment
   * @throws FetchError<400, types.PostGoalCommentResponse400> If the posted XML or JSON is invalid or the minimum fields are not provided.
   * @throws FetchError<403, types.PostGoalCommentResponse403> If the API user does not have permission to add a comment to the specified goal.
   */
  postGoalComment(body: types.PostGoalCommentBodyParam, metadata: types.PostGoalCommentMetadataParam): Promise<FetchResponse<201, types.PostGoalCommentResponse201>> {
    return this.core.fetch('/api/v1/performance/employees/{employeeId}/goals/{goalId}/comments', 'post', body, metadata);
  }

  /**
   * Update a goal comment.
   *
   * @summary Update Goal Comment
   * @throws FetchError<400, types.PutGoalCommentResponse400> The posted JSON is invalid.
   * @throws FetchError<403, types.PutGoalCommentResponse403> Goal is not editable or insufficient permissions.
   * @throws FetchError<404, types.PutGoalCommentResponse404> The goal specified by the given goalId was not found.
   */
  putGoalComment(body: types.PutGoalCommentBodyParam, metadata: types.PutGoalCommentMetadataParam): Promise<FetchResponse<200, types.PutGoalCommentResponse200>> {
    return this.core.fetch('/api/v1/performance/employees/{employeeId}/goals/{goalId}/comments/{commentId}', 'put', body, metadata);
  }

  /**
   * Delete a goal comment.
   *
   * @summary Delete Goal Comment
   * @throws FetchError<400, types.DeleteGoalCommentResponse400> The posted JSON is invalid.
   * @throws FetchError<403, types.DeleteGoalCommentResponse403> Goal is not editable or insufficient permissions.
   * @throws FetchError<404, types.DeleteGoalCommentResponse404> The goal specified by the given goalId was not found.
   */
  deleteGoalComment(metadata: types.DeleteGoalCommentMetadataParam): Promise<FetchResponse<204, types.DeleteGoalCommentResponse204>> {
    return this.core.fetch('/api/v1/performance/employees/{employeeId}/goals/{goalId}/comments/{commentId}', 'delete', metadata);
  }

  /**
   * Provides goal information, goal comments, and employees shared with goals or who have
   * commented on the given goal.
   *
   * @summary Get Goal Aggregate
   */
  getGoalAggregate(metadata: types.GetGoalAggregateMetadataParam): Promise<FetchResponse<200, types.GetGoalAggregateResponse200>> {
    return this.core.fetch('/api/v1/performance/employees/{employeeId}/goals/{goalId}/aggregate', 'get', metadata);
  }

  /**
   * Get alignable goal options for an employee.
   *
   * @summary Get Alignable Goal Options
   */
  getGoalsAlignmentOptions(body: types.GetGoalsAlignmentOptionsBodyParam, metadata: types.GetGoalsAlignmentOptionsMetadataParam): Promise<FetchResponse<200, types.GetGoalsAlignmentOptionsResponse200>>;
  getGoalsAlignmentOptions(metadata: types.GetGoalsAlignmentOptionsMetadataParam): Promise<FetchResponse<200, types.GetGoalsAlignmentOptionsResponse200>>;
  getGoalsAlignmentOptions(body?: types.GetGoalsAlignmentOptionsBodyParam | types.GetGoalsAlignmentOptionsMetadataParam, metadata?: types.GetGoalsAlignmentOptionsMetadataParam): Promise<FetchResponse<200, types.GetGoalsAlignmentOptionsResponse200>> {
    return this.core.fetch('/api/v1/performance/employees/{employeeId}/goals/alignmentOptions', 'get', body, metadata);
  }

  /**
   * Close a goal.
   *
   * @summary Close Goal
   * @throws FetchError<400, types.PostCloseGoalResponse400> The posted JSON is invalid.
   * @throws FetchError<403, types.PostCloseGoalResponse403> Goal is not editable or insufficient permissions.
   * @throws FetchError<404, types.PostCloseGoalResponse404> The goal specified by the given goalId was not found.
   */
  postCloseGoal(body: types.PostCloseGoalBodyParam, metadata: types.PostCloseGoalMetadataParam): Promise<FetchResponse<201, types.PostCloseGoalResponse201>>;
  postCloseGoal(metadata: types.PostCloseGoalMetadataParam): Promise<FetchResponse<201, types.PostCloseGoalResponse201>>;
  postCloseGoal(body?: types.PostCloseGoalBodyParam | types.PostCloseGoalMetadataParam, metadata?: types.PostCloseGoalMetadataParam): Promise<FetchResponse<201, types.PostCloseGoalResponse201>> {
    return this.core.fetch('/api/v1/performance/employees/{employeeId}/goals/{goalId}/close', 'post', body, metadata);
  }

  /**
   * Reopen a goal.
   *
   * @summary Reopen Goal
   * @throws FetchError<400, types.PostReopenGoalResponse400> The posted JSON is invalid.
   * @throws FetchError<403, types.PostReopenGoalResponse403> Goal is not editable or insufficient permissions.
   * @throws FetchError<404, types.PostReopenGoalResponse404> The goal specified by the given goalId was not found.
   */
  postReopenGoal(metadata: types.PostReopenGoalMetadataParam): Promise<FetchResponse<201, types.PostReopenGoalResponse201>> {
    return this.core.fetch('/api/v1/performance/employees/{employeeId}/goals/{goalId}/reopen', 'post', metadata);
  }

  /**
   * Get the number of goals per status for an employee. Difference from Version 1: Includes
   * actions.
   *
   * @summary Get Goal Filters v1.1
   */
  getGoalsFiltersV11(metadata: types.GetGoalsFiltersV11MetadataParam): Promise<FetchResponse<200, types.GetGoalsFiltersV11Response200>> {
    return this.core.fetch('/api/v1_1/performance/employees/{employeeId}/goals/filters', 'get', metadata);
  }

  /**
   * Provides a list of all goals, type counts, filter actions, goal comment counts, and
   * employees shared with goals for the given employee. Difference from Version 1: Returns
   * goals in the closed filter and provides filter actions for each filter. This version of
   * the endpoint will not return any goals with milestones. Milestone functionality for this
   * endpoint begins in version 1.2.
   *
   * @summary Get Goals Aggregate v1.1
   */
  getGoalsAggregateV11(metadata: types.GetGoalsAggregateV11MetadataParam): Promise<FetchResponse<200, types.GetGoalsAggregateV11Response200>> {
    return this.core.fetch('/api/v1_1/performance/employees/{employeeId}/goals/aggregate', 'get', metadata);
  }

  /**
   * Update a goal. Version 1.1 allows the updating of the milestones contained within the
   * goal, unlike Version 1.
   *
   * @summary Update Goal v1.1
   * @throws FetchError<400, types.PutGoalV11Response400> The posted JSON is invalid.
   * @throws FetchError<403, types.PutGoalV11Response403> Goal is not editable or insufficient permissions.
   * @throws FetchError<404, types.PutGoalV11Response404> The goal specified by the given goalId was not found.
   * @throws FetchError<500, types.PutGoalV11Response500> Something went wrong editing your goal.
   */
  putGoalV11(body: types.PutGoalV11BodyParam, metadata: types.PutGoalV11MetadataParam): Promise<FetchResponse<200, types.PutGoalV11Response200>> {
    return this.core.fetch('/api/v1_1/performance/employees/{employeeId}/goals/{goalId}', 'put', body, metadata);
  }

  /**
   * Get the number of goals per status for an employee. Difference from Version 1_1: Returns
   * goals with milestones.
   *
   * @summary Get Goal Status Counts v1.2
   */
  getGoalsFiltersV12(metadata: types.GetGoalsFiltersV12MetadataParam): Promise<FetchResponse<200, types.GetGoalsFiltersV12Response200>> {
    return this.core.fetch('/api/v1_2/performance/employees/{employeeId}/goals/filters', 'get', metadata);
  }

  /**
   * Provides a list of all goals, type counts, filter actions, goal comment counts, and
   * employees shared with goals for the given employee. Difference from Version 1.1: Returns
   * all goals, including goals that contain milestones.
   *
   * @summary Get Goals Aggregate v1.2
   */
  getGoalsAggregateV12(metadata: types.GetGoalsAggregateV12MetadataParam): Promise<FetchResponse<200, types.GetGoalsAggregateV12Response200>> {
    return this.core.fetch('/api/v1_2/performance/employees/{employeeId}/goals/aggregate', 'get', metadata);
  }

  /**
   * Get an hour record
   *
   * @summary Get Hour Record
   * @throws FetchError<400, types.GetTimeTrackingRecordResponse400> Invalid or missing argument.
   */
  getTimeTrackingRecord(metadata: types.GetTimeTrackingRecordMetadataParam): Promise<FetchResponse<200, types.GetTimeTrackingRecordResponse200>> {
    return this.core.fetch('/api/v1/timetracking/record/{id}', 'get', metadata);
  }

  /**
   * Add an hour record
   *
   * @summary Create Hour Record
   * @throws FetchError<400, types.AddTimeTrackingHourRecordResponse400> If any required field is missing, any of the IDs are invalid, or the posted JSON is not
   * valid.
   */
  addTimeTrackingHourRecord(body: types.AddTimeTrackingHourRecordBodyParam): Promise<FetchResponse<201, types.AddTimeTrackingHourRecordResponse201>> {
    return this.core.fetch('/api/v1/timetracking/add', 'post', body);
  }

  /**
   * Bulk add/edit hour records
   *
   * @summary Create or Update Hour Records
   */
  addTimeTrackingBulk(body: types.AddTimeTrackingBulkBodyParam): Promise<FetchResponse<201, types.AddTimeTrackingBulkResponse201>> {
    return this.core.fetch('/api/v1/timetracking/record', 'post', body);
  }

  /**
   * Edit an hour record
   *
   * @summary Update Hour Record
   * @throws FetchError<400, types.EditTimeTrackingRecordResponse400> if any required field is missing, any of the IDs are invalid, or the posted JSON is not
   * valid
   */
  editTimeTrackingRecord(body: types.EditTimeTrackingRecordBodyParam): Promise<FetchResponse<201, types.EditTimeTrackingRecordResponse201>> {
    return this.core.fetch('/api/v1/timetracking/adjust', 'put', body);
  }

  /**
   * Delete an hour record
   *
   * @summary Delete Hour Record
   * @throws FetchError<400, types.DeleteTimeTrackingByIdResponse400> If the time tracking ID cannot be found.
   */
  deleteTimeTrackingById(metadata: types.DeleteTimeTrackingByIdMetadataParam): Promise<FetchResponse<201, types.DeleteTimeTrackingByIdResponse201>> {
    return this.core.fetch('/api/v1/timetracking/delete/{id}', 'delete', metadata);
  }

  /**
   * Get states/provinces for a specific country. Returns a list of state/province options
   * with ID, label, ISO code, and name.
   *
   * @summary Get States by Country ID
   */
  getStatesByCountryId(metadata: types.GetStatesByCountryIdMetadataParam): Promise<FetchResponse<200, types.GetStatesByCountryIdResponse200>> {
    return this.core.fetch('/api/v1/meta/provinces/{countryId}', 'get', metadata);
  }

  /**
   * Get all available countries as options. Returns a list of countries with ID and name for
   * use in forms and dropdowns.
   *
   * @summary Get Countries
   */
  getCountriesOptions(): Promise<FetchResponse<200, types.GetCountriesOptionsResponse200>> {
    return this.core.fetch('/api/v1/meta/countries/options', 'get');
  }

  /**
   * This endpoint can help with discovery of fields that are available in an account.
   *
   * @summary Get Fields
   */
  metadataGetAListOfFields(metadata?: types.MetadataGetAListOfFieldsMetadataParam): Promise<FetchResponse<200, types.MetadataGetAListOfFieldsResponse200>> {
    return this.core.fetch('/api/v1/meta/fields', 'get', metadata);
  }

  /**
   * Retrieves a list of all active users in the system with their basic information. This
   * includes user IDs, names, and email addresses. The list can be used to map user IDs to
   * user information throughout the API.
   *
   * @summary Get Users
   */
  getListOfUsers(): Promise<FetchResponse<200, types.GetListOfUsersResponse200>> {
    return this.core.fetch('/api/v1/meta/users', 'get');
  }

  /**
   * Get employee data by specifying a set of fields. This is suitable for getting basic
   * employee information, including current values for fields that are part of a historical
   * table, like job title, or compensation information. See the
   * [fields](ref:metadata-get-a-list-of-fields) endpoint for a list of possible fields.
   *
   * @summary Get Employee
   * @throws FetchError<403, types.GetEmployeeResponse403> if the API user does not have permission to see the requested employee.
   * @throws FetchError<404, types.GetEmployeeResponse404> if the employee does not exist.
   */
  getEmployee(metadata: types.GetEmployeeMetadataParam): Promise<FetchResponse<200, types.GetEmployeeResponse200>> {
    return this.core.fetch('/api/v1/employees/{id}', 'get', metadata);
  }

  /**
   * Update an employee, based on employee ID. If employee is currently on a pay schedule
   * syncing with Trax Payroll, or being added to one, the API user will need to update the
   * employee with all of the following required fields for the update to be successful
   * (listed by API field name): employeeNumber, firstName, lastName, dateOfBirth, ssn or
   * ein, gender, maritalStatus, hireDate, address1, city, state, country,
   * employmentHistoryStatus, exempt, payType, payRate, payPer, location, department, and
   * division.
   *
   * @summary Update Employee
   * @throws FetchError<400, types.UpdateEmployeeResponse400> Provided JSON is bad or user is missing required fields.
   * @throws FetchError<403, types.UpdateEmployeeResponse403> If the user doesn\'t have perms to see the employee or the user doesn\'t have perms to
   * update ANY of the requested fields.
   * @throws FetchError<404, types.UpdateEmployeeResponse404> If the employee to be updated doesn\'t exist.
   * @throws FetchError<409, types.UpdateEmployeeResponse409> If an employee field was given an invalid value
   */
  updateEmployee(body: types.UpdateEmployeeBodyParam, metadata: types.UpdateEmployeeMetadataParam): Promise<FetchResponse<200, types.UpdateEmployeeResponse200>> {
    return this.core.fetch('/api/v1/employees/{id}', 'post', body, metadata);
  }

  /**
   * This API is merely an optimization to avoid downloading all table data for all
   * employees. When you use this API you will provide a timestamp and the results will be
   * limited to just the employees that have changed since the time you provided. This API
   * operates on an employee-last-changed-timestamp, which means that a change in ANY field
   * in the employee record will cause ALL of that employees table rows to show up via this
   * API.
   *
   * @summary Get Changed Employee Table Data
   */
  getChangedEmployeeTableData(metadata: types.GetChangedEmployeeTableDataMetadataParam): Promise<FetchResponse<200, types.GetChangedEmployeeTableDataResponse200>> {
    return this.core.fetch('/api/v1/employees/changed/tables/{table}', 'get', metadata);
  }

  /**
   * Returns a data structure representing all the table rows for a given employee and table
   * combination. The result is not sorted in any particular order.
   *
   * @summary Get Employee Table Rows
   */
  getEmployeeTableRow(metadata: types.GetEmployeeTableRowMetadataParam): Promise<FetchResponse<200, types.GetEmployeeTableRowResponse200>> {
    return this.core.fetch('/api/v1/employees/{id}/tables/{table}', 'get', metadata);
  }

  /**
   * Adds a table row. If employee is currently on a pay schedule syncing with Trax Payroll,
   * or being added to one, the row cannot be added if they are missing any required fields
   * for that table. If the API user is adding a row on the compensation table, the row
   * cannot be added if they are missing any of the required employee fields (including
   * fields not on that table).
   *
   * @summary Create Table Row
   * @throws FetchError<400, types.AddEmployeeTableRowResponse400> Invalid or missing required fields.
   * @throws FetchError<403, types.AddEmployeeTableRowResponse403> Permission denied.
   * @throws FetchError<406, types.AddEmployeeTableRowResponse406> An error with one or more of the fields.
   */
  addEmployeeTableRow(body: types.AddEmployeeTableRowBodyParam, metadata: types.AddEmployeeTableRowMetadataParam): Promise<FetchResponse<200, types.AddEmployeeTableRowResponse200>> {
    return this.core.fetch('/api/v1/employees/{id}/tables/{table}', 'post', body, metadata);
  }

  /**
   * Updates a table row. Fundamentally the same as version 1 so choose a version and stay
   * with it unless other changes occur. Changes from version 1 are now minor with a few
   * variations limited to ACA, payroll, terminated rehire, gusto, benetrac, and final pay
   * date.
   *
   * @summary Update Table Row v1.1
   * @throws FetchError<400, types.UpdateEmployeeTableRowVResponse400> Invalid or missing required fields.
   * @throws FetchError<403, types.UpdateEmployeeTableRowVResponse403> Permission denied.
   * @throws FetchError<406, types.UpdateEmployeeTableRowVResponse406> An error with one or more of the fields.
   */
  updateEmployeeTableRowV(body: types.UpdateEmployeeTableRowVBodyParam, metadata: types.UpdateEmployeeTableRowVMetadataParam): Promise<FetchResponse<200, types.UpdateEmployeeTableRowVResponse200>> {
    return this.core.fetch('/api/v1_1/employees/{id}/tables/{table}/{rowId}', 'post', body, metadata);
  }

  /**
   * Adds a table row. Fundamentally the same as version 1 so choose a version and stay with
   * it unless other changes occur. Changes from version 1 are now minor with a few
   * variations limited to ACA, payroll, terminated rehire, gusto, benetrac, and final pay
   * date.
   *
   * @summary Create Table Row v1.1
   */
  addEmployeeTableRowV1(body: types.AddEmployeeTableRowV1BodyParam, metadata: types.AddEmployeeTableRowV1MetadataParam): Promise<FetchResponse<200, types.AddEmployeeTableRowV1Response200>> {
    return this.core.fetch('/api/v1_1/employees/{id}/tables/{table}', 'post', body, metadata);
  }

  /**
   * This API allows for efficient syncing of employee data. When you use this API you will
   * provide a timestamp and the results will be limited to just the employees that have
   * changed since the time you provided. This API operates on an
   * employee-last-changed-timestamp, which means that a change in ANY individual field in
   * the employee record, as well as any change to the employment status, job info, or
   * compensation tables, will cause that employee to be returned via this API.
   *
   * @summary Get Updated Employee IDs
   */
  getChangedEmployeeIds(metadata: types.GetChangedEmployeeIdsMetadataParam): Promise<FetchResponse<200, types.GetChangedEmployeeIdsResponse200>> {
    return this.core.fetch('/api/v1/employees/changed', 'get', metadata);
  }

  /**
   * Get an employee photo
   *
   * @summary Get Employee Photo
   */
  getEmployeePhoto(metadata: types.GetEmployeePhotoMetadataParam): Promise<FetchResponse<200, types.GetEmployeePhotoResponse200>> {
    return this.core.fetch('/api/v1/employees/{employeeId}/photo/{size}', 'get', metadata);
  }

  /**
   * **Warning: This endpoint will soon be deprecated and replaced with Datasets - Get Data
   * from Dataset.** 
   *
   * Use this resource to request BambooHR generate a report. You must specify a type of
   * either "PDF", "XLS", "CSV", "JSON", or "XML". You must specify a list of fields to show
   * on the report. The list of fields is available here. The custom report will return
   * employees regardless of their status, "Active" or "Inactive". This differs from the UI,
   * which by default applies a quick filter to display only "Active" employees.
   *
   * @summary Request Custom Report
   */
  requestCustomReport(body: types.RequestCustomReportBodyParam, metadata: types.RequestCustomReportMetadataParam): Promise<FetchResponse<200, types.RequestCustomReportResponse200>> {
    return this.core.fetch('/api/v1/reports/custom', 'post', body, metadata);
  }

  /**
   * Add an employee file category.
   *
   * @summary Create Employee File Category
   * @throws FetchError<400, types.AddEmployeeFileCategoryResponse400> if the posted XML is invalid or there was no category name given.
   * @throws FetchError<403, types.AddEmployeeFileCategoryResponse403> if the API user does not have permission to create employee categories.
   * @throws FetchError<500, types.AddEmployeeFileCategoryResponse500> there was an unknown server error.
   */
  addEmployeeFileCategory(body: types.AddEmployeeFileCategoryBodyParam): Promise<FetchResponse<201, types.AddEmployeeFileCategoryResponse201>> {
    return this.core.fetch('/api/v1/employees/files/categories', 'post', body);
  }

  /**
   * Add a company file category.
   *
   * @summary Create Company File Category
   * @throws FetchError<400, types.AddCompanyFileCategoryResponse400> if the posted JSON is invalid or there was no category name given.
   * @throws FetchError<403, types.AddCompanyFileCategoryResponse403> if the API user does not have permission to see the company files.
   * @throws FetchError<500, types.AddCompanyFileCategoryResponse500> there was an unknown server error.
   */
  addCompanyFileCategory(body: types.AddCompanyFileCategoryBodyParam): Promise<FetchResponse<201, types.AddCompanyFileCategoryResponse201>> {
    return this.core.fetch('/api/v1/files/categories', 'post', body);
  }

  /**
   * Upload an employee file
   *
   * @summary Upload Employee File
   * @throws FetchError<403, types.UploadEmployeeFileResponse403> if the API user does not have permission to see the requested employee or the
   * employee\'s files.
   * @throws FetchError<404, types.UploadEmployeeFileResponse404> if the category ID was not found.
   * @throws FetchError<413, types.UploadEmployeeFileResponse413> if the file size exceeds 20MB or the storage limit for the company.
   */
  uploadEmployeeFile(metadata: types.UploadEmployeeFileMetadataParam): Promise<FetchResponse<201, types.UploadEmployeeFileResponse201>> {
    return this.core.fetch('/api/v1/employees/{id}/files', 'post', metadata);
  }

  /**
   * Upload a company file
   *
   * @summary Upload Company File
   * @throws FetchError<403, types.UploadCompanyFileResponse403> if the API user does not have permission to see the company files.
   * @throws FetchError<404, types.UploadCompanyFileResponse404> if the category ID was not found.
   * @throws FetchError<413, types.UploadCompanyFileResponse413> if the file size exceeds 20MB or the storage limit for the company.
   */
  uploadCompanyFile(): Promise<FetchResponse<201, types.UploadCompanyFileResponse201>> {
    return this.core.fetch('/api/v1/files', 'post');
  }

  /**
   * Retrieves a list of time off policies assigned to a specific employee. This includes
   * policy details such as name, type, and current balance. The response helps in displaying
   * available time off options and balances to employees.
   *
   * @summary Get Time Off Policies for Employee
   */
  timeOffListTimeOffPoliciesForEmployee(metadata: types.TimeOffListTimeOffPoliciesForEmployeeMetadataParam): Promise<FetchResponse<200, types.TimeOffListTimeOffPoliciesForEmployeeResponse200>> {
    return this.core.fetch('/api/v1/employees/{employeeId}/time_off/policies', 'get', metadata);
  }

  /**
   * To use this API make an HTTP PUT where the body of the request is the JSON documented
   * below. A time off policy will be assigned to the employee with accruals starting on the
   * date specified. A null start date will remove the assignment. On success, a 200 Success
   * code is returned and the content of the response will be the same as the List Time off
   * Policies API.
   *
   * @summary Assign Time Off Policies
   */
  timeOffAssignTimeOffPoliciesForAnEmployee(body: types.TimeOffAssignTimeOffPoliciesForAnEmployeeBodyParam, metadata: types.TimeOffAssignTimeOffPoliciesForAnEmployeeMetadataParam): Promise<FetchResponse<200, types.TimeOffAssignTimeOffPoliciesForAnEmployeeResponse200>> {
    return this.core.fetch('/api/v1/employees/{employeeId}/time_off/policies', 'put', body, metadata);
  }

  /**
   * Version 1.1 of the endpoint that retrieves time off policies for a specific employee.
   * This version includes additional policy details and enhanced filtering capabilities
   * compared to v1. It provides comprehensive information about each policy including
   * accrual rates, carryover rules, and policy-specific settings.
   *
   * @summary Get Time Off Policies for Employee v1.1
   */
  timeOffListTimeOffPoliciesForEmployeeV11(metadata: types.TimeOffListTimeOffPoliciesForEmployeeV11MetadataParam): Promise<FetchResponse<200, types.TimeOffListTimeOffPoliciesForEmployeeV11Response200>> {
    return this.core.fetch('/api/v1_1/employees/{employeeId}/time_off/policies', 'get', metadata);
  }

  /**
   * To use this API make an HTTP PUT where the body of the request is the JSON documented
   * below. A time off policy will be assigned to the employee with accruals starting on the
   * date specified. On success, a 200 Success code is returned and the content of the
   * response will be the same as the List Time off Policies API.
   *
   * @summary Assign Time Off Policies v1.1
   */
  timeOffAssignTimeOffPoliciesForAnEmployeeV11(body: types.TimeOffAssignTimeOffPoliciesForAnEmployeeV11BodyParam, metadata: types.TimeOffAssignTimeOffPoliciesForAnEmployeeV11MetadataParam): Promise<FetchResponse<200, types.TimeOffAssignTimeOffPoliciesForAnEmployeeV11Response200>> {
    return this.core.fetch('/api/v1_1/employees/{employeeId}/time_off/policies', 'put', body, metadata);
  }

  /**
   * Get the details of an application. The owner of the API key used must have access to ATS
   * settings.
   *
   * @summary Get Job Application Details
   */
  getApplicationDetails(metadata: types.GetApplicationDetailsMetadataParam): Promise<FetchResponse<200, types.GetApplicationDetailsResponse200>> {
    return this.core.fetch('/api/v1/applicant_tracking/applications/{applicationId}', 'get', metadata);
  }

  /**
   * Add a comment to an application. The owner of the API key used must have access to ATS
   * settings.
   *
   * @summary Create Job Application Comment
   * @throws FetchError<400, types.PostApplicationCommentResponse400> Bad request parameters.
   * @throws FetchError<401, types.PostApplicationCommentResponse401> Unauthorized. Invalid API credentials.
   * @throws FetchError<403, types.PostApplicationCommentResponse403> Insufficient user permissions or API access is not turned on.
   * @throws FetchError<404, types.PostApplicationCommentResponse404> Bad request url.
   */
  postApplicationComment(body: types.PostApplicationCommentBodyParam, metadata: types.PostApplicationCommentMetadataParam): Promise<FetchResponse<200, types.PostApplicationCommentResponse200>> {
    return this.core.fetch('/api/v1/applicant_tracking/applications/{applicationId}/comments', 'post', body, metadata);
  }

  /**
   * Get a list of job summaries. The owner of the API key used must have access to ATS
   * settings. Combine as many different optional parameter filters as you like.
   *
   * @summary Get Job Summaries
   * @throws FetchError<400, types.GetJobSummariesResponse400> Bad request parameters.
   * @throws FetchError<401, types.GetJobSummariesResponse401> Unauthorized. Invalid API credentials.
   * @throws FetchError<403, types.GetJobSummariesResponse403> Insufficient user permissions or API access is not turned on.
   */
  getJobSummaries(metadata?: types.GetJobSummariesMetadataParam): Promise<FetchResponse<200, types.GetJobSummariesResponse200>> {
    return this.core.fetch('/api/v1/applicant_tracking/jobs', 'get', metadata);
  }

  /**
   * Change applicant\'s status. The owner of the API key used must have access to ATS
   * settings.
   *
   * @summary Update Applicant Status
   * @throws FetchError<400, types.PostApplicantStatusResponse400> Bad request parameters.
   * @throws FetchError<401, types.PostApplicantStatusResponse401> Unauthorized. Invalid API credentials.
   * @throws FetchError<403, types.PostApplicantStatusResponse403> Insufficient user permissions or API access is not turned on.
   * @throws FetchError<404, types.PostApplicantStatusResponse404> Bad request url.
   */
  postApplicantStatus(body: types.PostApplicantStatusBodyParam, metadata: types.PostApplicantStatusMetadataParam): Promise<FetchResponse<200, types.PostApplicantStatusResponse200>> {
    return this.core.fetch('/api/v1/applicant_tracking/applications/{applicationId}/status', 'post', body, metadata);
  }

  /**
   * Get benefit coverages
   *
   * @summary Get Benefit Coverages
   */
  getBenefitCoverages(metadata?: types.GetBenefitCoveragesMetadataParam): Promise<FetchResponse<200, types.GetBenefitCoveragesResponse200>> {
    return this.core.fetch('/api/v1/benefitcoverages', 'get', metadata);
  }

  /**
   * Get employee dependent
   *
   * @summary Get Employee Dependent
   */
  getEmployeeDependent(metadata: types.GetEmployeeDependentMetadataParam): Promise<FetchResponse<200, types.GetEmployeeDependentResponse200>> {
    return this.core.fetch('/api/v1/employeedependents/{id}', 'get', metadata);
  }

  /**
   * This API allows you to change the information for a given dependent ID.
   *
   * @summary Update Employee Dependent
   * @throws FetchError<400, types.UpdateEmployeeDependentResponse400> if the posted JSON is invalid
   * @throws FetchError<403, types.UpdateEmployeeDependentResponse403> if the current user doesn\'t have access to change the dependent in this way.
   * @throws FetchError<500, types.UpdateEmployeeDependentResponse500> Server error.
   */
  updateEmployeeDependent(body: types.UpdateEmployeeDependentBodyParam, metadata: types.UpdateEmployeeDependentMetadataParam): Promise<FetchResponse<201, types.UpdateEmployeeDependentResponse201>> {
    return this.core.fetch('/api/v1/employeedependents/{id}', 'put', body, metadata);
  }

  /**
   * Get all employee dependents
   *
   * @summary Get Employee Dependents
   */
  getEmployeeDependents(metadata: types.GetEmployeeDependentsMetadataParam): Promise<FetchResponse<200, types.GetEmployeeDependentsResponse200>> {
    return this.core.fetch('/api/v1/employeedependents', 'get', metadata);
  }

  /**
   * Adds an employee dependent
   *
   * @summary Create Employee Dependent
   * @throws FetchError<400, types.AddEmployeeDependentResponse400> if the posted JSON is invalid
   * @throws FetchError<403, types.AddEmployeeDependentResponse403> if the current user doesn\'t have access to add the dependent.
   * @throws FetchError<500, types.AddEmployeeDependentResponse500> Server error.
   */
  addEmployeeDependent(body: types.AddEmployeeDependentBodyParam): Promise<FetchResponse<200, types.AddEmployeeDependentResponse200>> {
    return this.core.fetch('/api/v1/employeedependents', 'post', body);
  }

  /**
   * Gets employee directory.
   *
   * @summary Get Employee Directory
   * @throws FetchError<403, types.GetEmployeesDirectoryResponse403> if the directory has not been shared company-wide.
   */
  getEmployeesDirectory(metadata?: types.GetEmployeesDirectoryMetadataParam): Promise<FetchResponse<200, types.GetEmployeesDirectoryResponse200>> {
    return this.core.fetch('/api/v1/employees/directory', 'get', metadata);
  }

  /**
   * Lists company files and categories
   *
   * @summary Get Company Files and Categories
   * @throws FetchError<403, types.ListCompanyFilesResponse403> if the API user does not have permission to see the company files.
   * @throws FetchError<404, types.ListCompanyFilesResponse404> if no files or categories are found.
   */
  listCompanyFiles(): Promise<FetchResponse<200, types.ListCompanyFilesResponse200>> {
    return this.core.fetch('/api/v1/files/view', 'get');
  }

  /**
   * Lists employee files and categories
   *
   * @summary Get Employee Files and Categories
   * @throws FetchError<403, types.ListEmployeeFilesResponse403> if the API user does not have permission to see the requested employee or the
   * employee\'s files.
   * @throws FetchError<404, types.ListEmployeeFilesResponse404> if no files or employees are found for this employee.
   */
  listEmployeeFiles(metadata: types.ListEmployeeFilesMetadataParam): Promise<FetchResponse<200, types.ListEmployeeFilesResponse200>> {
    return this.core.fetch('/api/v1/employees/{id}/files/view', 'get', metadata);
  }

  /**
   * User Login
   *
   * @summary User Login
   */
  login(body: types.LoginFormDataParam, metadata?: types.LoginMetadataParam): Promise<FetchResponse<200, types.LoginResponse200>> {
    return this.core.fetch('/api/v1/login', 'post', body, metadata);
  }

  /**
   * This endpoint will return details for all list fields. Lists that can be edited will
   * have the "manageable" attribute set to yes. Lists with the "multiple" attribute set to
   * yes are fields that can have multiple values. Options with the "archived" attribute set
   * to yes should not appear as current options, but are included so that historical data
   * can reference the value.
   *
   * @summary Get List Field Details
   */
  metadataGetDetailsForListFields(metadata?: types.MetadataGetDetailsForListFieldsMetadataParam): Promise<FetchResponse<200, types.MetadataGetDetailsForListFieldsResponse200>> {
    return this.core.fetch('/api/v1/meta/lists', 'get', metadata);
  }

  /**
   * This resource accepts one or more options. To update an option, specify an ID. You may
   * also remove an option from the list of current values by archiving the value. To create
   * a new option, do not specify an "id" attribute.
   *
   * @summary Create or Update List Field Values
   * @throws FetchError<400, types.MetadataAddOrUpdateValuesForListFieldsResponse400> The posted JSON is invalid.
   * @throws FetchError<403, types.MetadataAddOrUpdateValuesForListFieldsResponse403> List is not editable or insufficient permissions.
   * @throws FetchError<404, types.MetadataAddOrUpdateValuesForListFieldsResponse404> A non-existant list value or option ID is specified.
   * @throws FetchError<409, types.MetadataAddOrUpdateValuesForListFieldsResponse409> A duplicate list value conflicted with the value specified.
   */
  metadataAddOrUpdateValuesForListFields(body: types.MetadataAddOrUpdateValuesForListFieldsBodyParam, metadata: types.MetadataAddOrUpdateValuesForListFieldsMetadataParam): Promise<FetchResponse<200, types.MetadataAddOrUpdateValuesForListFieldsResponse200>> {
    return this.core.fetch('/api/v1/meta/lists/{listFieldId}', 'put', body, metadata);
  }

  /**
   * This endpoint can help discover table fields available in your BambooHR account.
   *
   * @summary Get Tabular Fields
   */
  metadataGetAListOfTabularFields(metadata?: types.MetadataGetAListOfTabularFieldsMetadataParam): Promise<FetchResponse<200, types.MetadataGetAListOfTabularFieldsResponse200>> {
    return this.core.fetch('/api/v1/meta/tables', 'get', metadata);
  }

  /**
   * **Warning: This endpoint will soon be deprecated and replaced with Custom Reports - Get
   * Report by ID.** 
   *
   * Use this resource to request one of your existing custom company reports from the My
   * Reports or Manage Reports sections in the Reports tab. You can get the report number by
   * hovering over the report name and noting the ID from the URL. At present, only reports
   * from the My Reports or Manage Reports sections are supported. In the future we may
   * implement reports from the Standard Reports section if there is enough demand for it.
   * The report numbers used in this request are different in each company.
   *
   * @summary Get Company Report
   * @throws FetchError<404, types.GetCompanyReportResponse404> if you request a nonexistent report number.
   */
  getCompanyReport(metadata: types.GetCompanyReportMetadataParam): Promise<FetchResponse<200, types.GetCompanyReportResponse200>> {
    return this.core.fetch('/api/v1/reports/{id}', 'get', metadata);
  }

  /**
   * This endpoint will sum future time off accruals, scheduled time off, and carry-over
   * events to produce estimates for the anticipated time off balance on a given date in the
   * future.
   *
   * @summary Estimate Future Time Off Balances
   */
  timeOffEstimateFutureTimeOffBalances(metadata: types.TimeOffEstimateFutureTimeOffBalancesMetadataParam): Promise<FetchResponse<200, types.TimeOffEstimateFutureTimeOffBalancesResponse200>> {
    return this.core.fetch('/api/v1/employees/{employeeId}/time_off/calculator', 'get', metadata);
  }

  /**
   * To use this API make an HTTP PUT where the body of the request is the JSON documented
   * below. A new time off history item will be inserted into the database. On success, a 201
   * Created code is returned and the "Location" header of the response will contain a URL
   * that identifies the new history item.
   *
   * @summary Create Time Off Request History Item
   * @throws FetchError<400, types.TimeOffAddATimeOffHistoryItemForTimeOffRequestResponse400> For empty or malformed JSON, an invalid date format, or an invalid time off request.
   * @throws FetchError<403, types.TimeOffAddATimeOffHistoryItemForTimeOffRequestResponse403> Invalid permissions to perform this action.
   * @throws FetchError<409, types.TimeOffAddATimeOffHistoryItemForTimeOffRequestResponse409> If the time off request already has a history item.
   */
  timeOffAddATimeOffHistoryItemForTimeOffRequest(body: types.TimeOffAddATimeOffHistoryItemForTimeOffRequestBodyParam, metadata: types.TimeOffAddATimeOffHistoryItemForTimeOffRequestMetadataParam): Promise<FetchResponse<201, types.TimeOffAddATimeOffHistoryItemForTimeOffRequestResponse201>> {
    return this.core.fetch('/api/v1/employees/{employeeId}/time_off/history', 'put', body, metadata);
  }

  /**
   * To use this API make an HTTP PUT where the body of the request is the JSON documented
   * below. A time off balance adjustment will be inserted into the database. On success, a
   * 201 Created code is returned and the "Location" header of the response will contain a
   * URL that identifies the new history item.
   *
   * @summary Update Time Off Balance
   * @throws FetchError<400, types.TimeOffAdjustTimeOffBalanceResponse400> For empty or malformed JSON, an invalid date format, or an invalid time off type.
   * @throws FetchError<403, types.TimeOffAdjustTimeOffBalanceResponse403> Invalid permissions to perform this action.
   */
  timeOffAdjustTimeOffBalance(body: types.TimeOffAdjustTimeOffBalanceBodyParam, metadata: types.TimeOffAdjustTimeOffBalanceMetadataParam): Promise<FetchResponse<201, types.TimeOffAdjustTimeOffBalanceResponse201>> {
    return this.core.fetch('/api/v1/employees/{employeeId}/time_off/balance_adjustment', 'put', body, metadata);
  }

  /**
   * This endpoint gets a list of time off policies.
   *
   * @summary Get Time Off Policies
   */
  getTimeOffPolicies(metadata?: types.GetTimeOffPoliciesMetadataParam): Promise<FetchResponse<200, types.GetTimeOffPoliciesResponse200>> {
    return this.core.fetch('/api/v1/meta/time_off/policies', 'get', metadata);
  }

  /**
   * A time off request is an entity that describes the decision making process for approving
   * time off. Once a request has been created, a history entry can be created documenting
   * the actual use of time off.
   *
   * @summary Create Time Off Request
   * @throws FetchError<400, types.TimeOffAddATimeOffRequestResponse400> Malformed request.
   * @throws FetchError<403, types.TimeOffAddATimeOffRequestResponse403> Forbidden. Cannot change past approved requests.
   * @throws FetchError<404, types.TimeOffAddATimeOffRequestResponse404> Employee not found
   */
  timeOffAddATimeOffRequest(body: types.TimeOffAddATimeOffRequestBodyParam, metadata: types.TimeOffAddATimeOffRequestMetadataParam): Promise<FetchResponse<201, types.TimeOffAddATimeOffRequestResponse201>> {
    return this.core.fetch('/api/v1/employees/{employeeId}/time_off/request', 'put', body, metadata);
  }

  /**
   * This endpoint allows you to change the status of a request in the system. You can use
   * this to approve, deny, or cancel a time off request.
   *
   * @summary Update Time Off Request Status
   * @throws FetchError<400, types.TimeOffChangeARequestStatusResponse400> If the posted XML is invalid or the status is not "approved", "denied", "canceled", or
   * "declined".
   * @throws FetchError<403, types.TimeOffChangeARequestStatusResponse403> If the current user doesn\'t have access to change the status in this way.
   * @throws FetchError<404, types.TimeOffChangeARequestStatusResponse404> If the time off request ID doesn\'t exist.
   */
  timeOffChangeARequestStatus(body: types.TimeOffChangeARequestStatusBodyParam, metadata: types.TimeOffChangeARequestStatusMetadataParam): Promise<FetchResponse<200, types.TimeOffChangeARequestStatusResponse200>> {
    return this.core.fetch('/api/v1/time_off/requests/{requestId}/status', 'put', body, metadata);
  }

  /**
   * Retrieves a list of time off requests based on specified filters. This endpoint allows
   * filtering by date range, status, employee, and time off type. It's useful for generating
   * time off reports or displaying a calendar of time off events.
   *
   * @summary Get Time Off Requests
   * @throws FetchError<400, types.TimeOffGetTimeOffRequestsResponse400> Malformed request
   */
  timeOffGetTimeOffRequests(metadata: types.TimeOffGetTimeOffRequestsMetadataParam): Promise<FetchResponse<200, types.TimeOffGetTimeOffRequestsResponse200>> {
    return this.core.fetch('/api/v1/time_off/requests', 'get', metadata);
  }

  /**
   * This endpoint gets a list of time off types.
   *
   * @summary Get Time Off Types
   */
  getTimeOffTypes(metadata?: types.GetTimeOffTypesMetadataParam): Promise<FetchResponse<200, types.GetTimeOffTypesResponse200>> {
    return this.core.fetch('/api/v1/meta/time_off/types', 'get', metadata);
  }

  /**
   * Get a list of training types. The owner of the API key used must have access to training
   * settings.
   *
   * @summary Get Training Types
   * @throws FetchError<400, types.ListTrainingTypesResponse400> Bad request parameters.
   * @throws FetchError<401, types.ListTrainingTypesResponse401> Unauthorized. Invalid API credentials.
   * @throws FetchError<403, types.ListTrainingTypesResponse403> Insufficient user permissions or API access is not turned on.
   * @throws FetchError<404, types.ListTrainingTypesResponse404> Bad request url.
   */
  listTrainingTypes(): Promise<FetchResponse<200, types.ListTrainingTypesResponse200>> {
    return this.core.fetch('/api/v1/training/type', 'get');
  }

  /**
   * Add a training type. The owner of the API key used must have access to training
   * settings.
   *
   * @summary Create Training Type
   * @throws FetchError<400, types.AddTrainingTypeResponse400> Bad request parameters.
   * @throws FetchError<401, types.AddTrainingTypeResponse401> Unauthorized. Invalid API credentials.
   * @throws FetchError<403, types.AddTrainingTypeResponse403> Insufficient user permissions or API access is not turned on.
   * @throws FetchError<404, types.AddTrainingTypeResponse404> Bad request url.
   */
  addTrainingType(body: types.AddTrainingTypeBodyParam): Promise<FetchResponse<201, types.AddTrainingTypeResponse201>> {
    return this.core.fetch('/api/v1/training/type', 'post', body);
  }

  /**
   * Update an existing training type. The owner of the API key used must have access to
   * training settings.
   *
   * @summary Update Training Type
   * @throws FetchError<400, types.UpdateTrainingTypeResponse400> Bad request parameters.
   * @throws FetchError<401, types.UpdateTrainingTypeResponse401> Unauthorized. Invalid API credentials.
   * @throws FetchError<403, types.UpdateTrainingTypeResponse403> Insufficient user permissions or API access is not turned on.
   * @throws FetchError<404, types.UpdateTrainingTypeResponse404> Bad request url.
   */
  updateTrainingType(body: types.UpdateTrainingTypeBodyParam, metadata: types.UpdateTrainingTypeMetadataParam): Promise<FetchResponse<200, types.UpdateTrainingTypeResponse200>> {
    return this.core.fetch('/api/v1/training/type/{trainingTypeId}', 'put', body, metadata);
  }

  /**
   * Delete an existing training type. The owner of the API key used must have access to
   * training settings. Deleting a training type will only be successful if all employee
   * trainings for this type have been removed prior to this request.
   *
   * @summary Delete Training Type
   * @throws FetchError<400, types.DeleteTrainingTypeResponse400> Bad request parameters.
   * @throws FetchError<401, types.DeleteTrainingTypeResponse401> Unauthorized. Invalid API credentials.
   * @throws FetchError<403, types.DeleteTrainingTypeResponse403> Insufficient user permissions or API access is not turned on.
   * @throws FetchError<404, types.DeleteTrainingTypeResponse404> Bad request url or training type does not exist.
   * @throws FetchError<405, types.DeleteTrainingTypeResponse405> Training type was unable to be deleted.
   */
  deleteTrainingType(metadata: types.DeleteTrainingTypeMetadataParam): Promise<FetchResponse<200, types.DeleteTrainingTypeResponse200>> {
    return this.core.fetch('/api/v1/training/type/{trainingTypeId}', 'delete', metadata);
  }

  /**
   * Get a list of training categories. The owner of the API key used must have access to
   * training settings.
   *
   * @summary Get Training Categories
   * @throws FetchError<400, types.ListTrainingCategoriesResponse400> Bad request parameters.
   * @throws FetchError<401, types.ListTrainingCategoriesResponse401> Unauthorized. Invalid API credentials.
   * @throws FetchError<403, types.ListTrainingCategoriesResponse403> Insufficient user permissions or API access is not turned on.
   * @throws FetchError<404, types.ListTrainingCategoriesResponse404> Bad request url.
   */
  listTrainingCategories(): Promise<FetchResponse<200, types.ListTrainingCategoriesResponse200>> {
    return this.core.fetch('/api/v1/training/category', 'get');
  }

  /**
   * Add a training category. The owner of the API key used must have access to training
   * settings.
   *
   * @summary Create Training Category
   * @throws FetchError<400, types.AddTrainingCategoryResponse400> Bad request parameters.
   * @throws FetchError<401, types.AddTrainingCategoryResponse401> Unauthorized. Invalid API credentials.
   * @throws FetchError<403, types.AddTrainingCategoryResponse403> Insufficient user permissions or API access is not turned on.
   * @throws FetchError<404, types.AddTrainingCategoryResponse404> Bad request url.
   */
  addTrainingCategory(body: types.AddTrainingCategoryBodyParam): Promise<FetchResponse<201, types.AddTrainingCategoryResponse201>> {
    return this.core.fetch('/api/v1/training/category', 'post', body);
  }

  /**
   * Update an existing training category. The owner of the API key used must have access to
   * training settings.
   *
   * @summary Update Training Category
   * @throws FetchError<400, types.UpdateTrainingCategoryResponse400> Bad request parameters.
   * @throws FetchError<401, types.UpdateTrainingCategoryResponse401> Unauthorized. Invalid API credentials.
   * @throws FetchError<403, types.UpdateTrainingCategoryResponse403> Insufficient user permissions or API access is not turned on.
   * @throws FetchError<404, types.UpdateTrainingCategoryResponse404> Bad request url.
   */
  updateTrainingCategory(body: types.UpdateTrainingCategoryBodyParam, metadata: types.UpdateTrainingCategoryMetadataParam): Promise<FetchResponse<200, types.UpdateTrainingCategoryResponse200>> {
    return this.core.fetch('/api/v1/training/category/{trainingCategoryId}', 'put', body, metadata);
  }

  /**
   * Delete an existing training category. The owner of the API key used must have access to
   * training settings.
   *
   * @summary Delete Training Category
   * @throws FetchError<401, types.DeleteTrainingCategoryResponse401> Unauthorized. Invalid API credentials.
   * @throws FetchError<403, types.DeleteTrainingCategoryResponse403> Insufficient user permissions or API access is not turned on.
   * @throws FetchError<404, types.DeleteTrainingCategoryResponse404> Bad request url or training category does not exist.
   * @throws FetchError<500, types.DeleteTrainingCategoryResponse500> Internal server error
   */
  deleteTrainingCategory(metadata: types.DeleteTrainingCategoryMetadataParam): Promise<FetchResponse<200, types.DeleteTrainingCategoryResponse200>> {
    return this.core.fetch('/api/v1/training/category/{trainingCategoryId}', 'delete', metadata);
  }

  /**
   * Get all employee training records. The owner of the API key used must have access to
   * view the employee. The API will only return trainings for the employee that the owner of
   * the API key has permission to see. Included with each employee training is the training
   * information that has been selected for tracking in settings.
   *
   * @summary Get Employee Trainings
   * @throws FetchError<400, types.ListEmployeeTrainingsResponse400> Bad request parameters.
   * @throws FetchError<401, types.ListEmployeeTrainingsResponse401> Unauthorized. Invalid API credentials.
   * @throws FetchError<403, types.ListEmployeeTrainingsResponse403> Insufficient user permissions or API access is not turned on.
   * @throws FetchError<404, types.ListEmployeeTrainingsResponse404> Bad request url.
   */
  listEmployeeTrainings(metadata: types.ListEmployeeTrainingsMetadataParam): Promise<FetchResponse<200, types.ListEmployeeTrainingsResponse200>> {
    return this.core.fetch('/api/v1/training/record/employee/{employeeId}', 'get', metadata);
  }

  /**
   * Add a new employee training record. The owner of the API key used must have permission
   * to add trainings for the selected employee.
   *
   * @summary Create Employee Training Record
   * @throws FetchError<400, types.AddNewEmployeeTrainingRecordResponse400> Bad request parameters.
   * @throws FetchError<401, types.AddNewEmployeeTrainingRecordResponse401> Unauthorized. Invalid API credentials.
   * @throws FetchError<403, types.AddNewEmployeeTrainingRecordResponse403> Insufficient user permissions or API access is not turned on.
   * @throws FetchError<404, types.AddNewEmployeeTrainingRecordResponse404> Bad request url.
   */
  addNewEmployeeTrainingRecord(body: types.AddNewEmployeeTrainingRecordBodyParam, metadata: types.AddNewEmployeeTrainingRecordMetadataParam): Promise<FetchResponse<201, types.AddNewEmployeeTrainingRecordResponse201>> {
    return this.core.fetch('/api/v1/training/record/employee/{employeeId}', 'post', body, metadata);
  }

  /**
   * Update an existing exmployee training record. The owner of the API key used must have
   * permission to add trainings for the selected employee
   *
   * @summary Update Employee Training Record
   * @throws FetchError<400, types.UpdateEmployeeTrainingRecordResponse400> Bad request parameters.
   * @throws FetchError<401, types.UpdateEmployeeTrainingRecordResponse401> Unauthorized. Invalid API credentials.
   * @throws FetchError<403, types.UpdateEmployeeTrainingRecordResponse403> Insufficient user permissions or API access is not turned on.
   * @throws FetchError<404, types.UpdateEmployeeTrainingRecordResponse404> Bad request url.
   */
  updateEmployeeTrainingRecord(body: types.UpdateEmployeeTrainingRecordBodyParam, metadata: types.UpdateEmployeeTrainingRecordMetadataParam): Promise<FetchResponse<200, types.UpdateEmployeeTrainingRecordResponse200>> {
    return this.core.fetch('/api/v1/training/record/{employeeTrainingRecordId}', 'put', body, metadata);
  }

  /**
   * Delete an existing employee training record. The owner of the API key used must have
   * permission to view and edit the employee and training type.
   *
   * @summary Delete Employee Training Record
   * @throws FetchError<401, types.DeleteEmployeeTrainingRecordResponse401> Unauthorized. Invalid API credentials.
   * @throws FetchError<403, types.DeleteEmployeeTrainingRecordResponse403> Insufficient user permissions or API access is not turned on.
   * @throws FetchError<404, types.DeleteEmployeeTrainingRecordResponse404> Bad request url or training record does not exist.
   * @throws FetchError<405, types.DeleteEmployeeTrainingRecordResponse405> Unable to delete training record.
   */
  deleteEmployeeTrainingRecord(metadata: types.DeleteEmployeeTrainingRecordMetadataParam): Promise<FetchResponse<200, types.DeleteEmployeeTrainingRecordResponse200>> {
    return this.core.fetch('/api/v1/training/record/{employeeTrainingRecordId}', 'delete', metadata);
  }

  /**
   * Store a new employee photo
   *
   * @summary Upload Employee Photo
   * @throws FetchError<400, types.UploadEmployeePhotoResponse400> Maximum number of photo uploads exceeded
   * @throws FetchError<404, types.UploadEmployeePhotoResponse404> if the employee doesn\'t exist
   * @throws FetchError<413, types.UploadEmployeePhotoResponse413> if the file is too big.
   * @throws FetchError<415, types.UploadEmployeePhotoResponse415> if the file is not in a supported file format or if the width doesn\'t match the
   * height.
   */
  uploadEmployeePhoto(metadata: types.UploadEmployeePhotoMetadataParam): Promise<FetchResponse<201, types.UploadEmployeePhotoResponse201>> {
    return this.core.fetch('/api/v1/employees/{employeeId}/photo', 'post', metadata);
  }

  /**
   * This endpoint will return a list, sorted by date, of employees who will be out, and
   * company holidays, for a period of time.
   *
   * @summary Get Who’s Out
   */
  getAListOfWhoIsOut(metadata?: types.GetAListOfWhoIsOutMetadataParam): Promise<FetchResponse<200, types.GetAListOfWhoIsOutResponse200>> {
    return this.core.fetch('/api/v1/time_off/whos_out', 'get', metadata);
  }
}

const createSDK = (() => { return new SDK(); })()
;

export default createSDK;

export type { AddCompanyFileCategoryBodyParam, AddCompanyFileCategoryResponse201, AddCompanyFileCategoryResponse400, AddCompanyFileCategoryResponse403, AddCompanyFileCategoryResponse500, AddEditTimesheetClockEntriesBodyParam, AddEditTimesheetClockEntriesResponse201, AddEditTimesheetClockEntriesResponse400, AddEditTimesheetClockEntriesResponse401, AddEditTimesheetClockEntriesResponse403, AddEditTimesheetClockEntriesResponse406, AddEditTimesheetClockEntriesResponse409, AddEditTimesheetClockEntriesResponse500, AddEditTimesheetHourEntriesBodyParam, AddEditTimesheetHourEntriesResponse201, AddEditTimesheetHourEntriesResponse400, AddEditTimesheetHourEntriesResponse401, AddEditTimesheetHourEntriesResponse403, AddEditTimesheetHourEntriesResponse406, AddEditTimesheetHourEntriesResponse409, AddEditTimesheetHourEntriesResponse500, AddEmployeeBodyParam, AddEmployeeDependentBodyParam, AddEmployeeDependentResponse200, AddEmployeeDependentResponse400, AddEmployeeDependentResponse403, AddEmployeeDependentResponse500, AddEmployeeFileCategoryBodyParam, AddEmployeeFileCategoryResponse201, AddEmployeeFileCategoryResponse400, AddEmployeeFileCategoryResponse403, AddEmployeeFileCategoryResponse500, AddEmployeeResponse201, AddEmployeeResponse400, AddEmployeeResponse403, AddEmployeeResponse409, AddEmployeeTableRowBodyParam, AddEmployeeTableRowMetadataParam, AddEmployeeTableRowResponse200, AddEmployeeTableRowResponse400, AddEmployeeTableRowResponse403, AddEmployeeTableRowResponse406, AddEmployeeTableRowV1BodyParam, AddEmployeeTableRowV1MetadataParam, AddEmployeeTableRowV1Response200, AddNewCandidateBodyParam, AddNewCandidateResponse200, AddNewCandidateResponse401, AddNewCandidateResponse403, AddNewCandidateResponse404, AddNewCandidateResponse422, AddNewEmployeeTrainingRecordBodyParam, AddNewEmployeeTrainingRecordMetadataParam, AddNewEmployeeTrainingRecordResponse201, AddNewEmployeeTrainingRecordResponse400, AddNewEmployeeTrainingRecordResponse401, AddNewEmployeeTrainingRecordResponse403, AddNewEmployeeTrainingRecordResponse404, AddNewJobOpeningBodyParam, AddNewJobOpeningResponse200, AddNewJobOpeningResponse401, AddNewJobOpeningResponse403, AddNewJobOpeningResponse404, AddNewJobOpeningResponse422, AddTimeTrackingBulkBodyParam, AddTimeTrackingBulkResponse201, AddTimeTrackingHourRecordBodyParam, AddTimeTrackingHourRecordResponse201, AddTimeTrackingHourRecordResponse400, AddTimesheetClockInEntryBodyParam, AddTimesheetClockInEntryMetadataParam, AddTimesheetClockInEntryResponse200, AddTimesheetClockInEntryResponse400, AddTimesheetClockInEntryResponse401, AddTimesheetClockInEntryResponse403, AddTimesheetClockInEntryResponse406, AddTimesheetClockInEntryResponse409, AddTimesheetClockOutEntryBodyParam, AddTimesheetClockOutEntryMetadataParam, AddTimesheetClockOutEntryResponse200, AddTimesheetClockOutEntryResponse400, AddTimesheetClockOutEntryResponse401, AddTimesheetClockOutEntryResponse403, AddTimesheetClockOutEntryResponse406, AddTimesheetClockOutEntryResponse409, AddTimesheetClockOutEntryResponse500, AddTrainingCategoryBodyParam, AddTrainingCategoryResponse201, AddTrainingCategoryResponse400, AddTrainingCategoryResponse401, AddTrainingCategoryResponse403, AddTrainingCategoryResponse404, AddTrainingTypeBodyParam, AddTrainingTypeResponse201, AddTrainingTypeResponse400, AddTrainingTypeResponse401, AddTrainingTypeResponse403, AddTrainingTypeResponse404, CreateTimeTrackingProjectBodyParam, CreateTimeTrackingProjectResponse201, CreateTimeTrackingProjectResponse400, CreateTimeTrackingProjectResponse401, CreateTimeTrackingProjectResponse403, CreateTimeTrackingProjectResponse406, CreateTimeTrackingProjectResponse409, DeleteCompanyFileMetadataParam, DeleteCompanyFileResponse200, DeleteCompanyFileResponse403, DeleteCompanyFileResponse404, DeleteEmployeeFileMetadataParam, DeleteEmployeeFileResponse200, DeleteEmployeeFileResponse403, DeleteEmployeeFileResponse404, DeleteEmployeeTableRowV1MetadataParam, DeleteEmployeeTableRowV1Response200, DeleteEmployeeTableRowV1Response400, DeleteEmployeeTableRowV1Response401, DeleteEmployeeTableRowV1Response403, DeleteEmployeeTrainingRecordMetadataParam, DeleteEmployeeTrainingRecordResponse200, DeleteEmployeeTrainingRecordResponse401, DeleteEmployeeTrainingRecordResponse403, DeleteEmployeeTrainingRecordResponse404, DeleteEmployeeTrainingRecordResponse405, DeleteGoalCommentMetadataParam, DeleteGoalCommentResponse204, DeleteGoalCommentResponse400, DeleteGoalCommentResponse403, DeleteGoalCommentResponse404, DeleteGoalMetadataParam, DeleteGoalResponse204, DeleteGoalResponse400, DeleteGoalResponse403, DeleteGoalResponse404, DeleteTimeTrackingByIdMetadataParam, DeleteTimeTrackingByIdResponse201, DeleteTimeTrackingByIdResponse400, DeleteTimesheetClockEntriesViaPostBodyParam, DeleteTimesheetClockEntriesViaPostResponse400, DeleteTimesheetClockEntriesViaPostResponse403, DeleteTimesheetClockEntriesViaPostResponse404, DeleteTimesheetClockEntriesViaPostResponse409, DeleteTimesheetClockEntriesViaPostResponse412, DeleteTimesheetClockEntriesViaPostResponse500, DeleteTimesheetHourEntriesViaPostBodyParam, DeleteTimesheetHourEntriesViaPostResponse400, DeleteTimesheetHourEntriesViaPostResponse401, DeleteTimesheetHourEntriesViaPostResponse403, DeleteTimesheetHourEntriesViaPostResponse406, DeleteTimesheetHourEntriesViaPostResponse409, DeleteTimesheetHourEntriesViaPostResponse412, DeleteTimesheetHourEntriesViaPostResponse500, DeleteTrainingCategoryMetadataParam, DeleteTrainingCategoryResponse200, DeleteTrainingCategoryResponse401, DeleteTrainingCategoryResponse403, DeleteTrainingCategoryResponse404, DeleteTrainingCategoryResponse500, DeleteTrainingTypeMetadataParam, DeleteTrainingTypeResponse200, DeleteTrainingTypeResponse400, DeleteTrainingTypeResponse401, DeleteTrainingTypeResponse403, DeleteTrainingTypeResponse404, DeleteTrainingTypeResponse405, DeleteWebhookMetadataParam, DeleteWebhookResponse200, DeleteWebhookResponse401, DeleteWebhookResponse403, DeleteWebhookResponse404, DeleteWebhookResponse500, EditTimeTrackingRecordBodyParam, EditTimeTrackingRecordResponse201, EditTimeTrackingRecordResponse400, GetAListOfWhoIsOutMetadataParam, GetAListOfWhoIsOutResponse200, GetApplicationDetailsMetadataParam, GetApplicationDetailsResponse200, GetApplicationsMetadataParam, GetApplicationsResponse200, GetApplicationsResponse400, GetApplicationsResponse401, GetApplicationsResponse403, GetBenefitCoveragesMetadataParam, GetBenefitCoveragesResponse200, GetBenefitDeductionTypesResponse200, GetByReportIdMetadataParam, GetByReportIdResponse200, GetByReportIdResponse400, GetByReportIdResponse403, GetByReportIdResponse404, GetByReportIdResponse500, GetCanCreateGoalMetadataParam, GetCanCreateGoalResponse200, GetChangedEmployeeIdsMetadataParam, GetChangedEmployeeIdsResponse200, GetChangedEmployeeTableDataMetadataParam, GetChangedEmployeeTableDataResponse200, GetCompanyBenefitsResponse200, GetCompanyFileMetadataParam, GetCompanyFileResponse200, GetCompanyFileResponse403, GetCompanyFileResponse404, GetCompanyInformationResponse200, GetCompanyLocationsResponse200, GetCompanyLocationsResponse401, GetCompanyLocationsResponse403, GetCompanyLocationsResponse404, GetCompanyReportMetadataParam, GetCompanyReportResponse200, GetCompanyReportResponse404, GetCountriesOptionsResponse200, GetDataFromDatasetBodyParam, GetDataFromDatasetMetadataParam, GetDataFromDatasetResponse200, GetDataFromDatasetResponse400, GetDataFromDatasetResponse403, GetDataFromDatasetResponse500, GetDatasetsResponse200, GetDatasetsResponse403, GetDatasetsResponse500, GetDatasetsV12Response200, GetDatasetsV12Response403, GetDatasetsV12Response500, GetEmployeeBenefitBodyParam, GetEmployeeBenefitMetadataParam, GetEmployeeBenefitResponse200, GetEmployeeDependentMetadataParam, GetEmployeeDependentResponse200, GetEmployeeDependentsMetadataParam, GetEmployeeDependentsResponse200, GetEmployeeFileMetadataParam, GetEmployeeFileResponse200, GetEmployeeFileResponse403, GetEmployeeFileResponse404, GetEmployeeMetadataParam, GetEmployeePhotoMetadataParam, GetEmployeePhotoResponse200, GetEmployeeResponse200, GetEmployeeResponse403, GetEmployeeResponse404, GetEmployeeTableRowMetadataParam, GetEmployeeTableRowResponse200, GetEmployeesDirectoryMetadataParam, GetEmployeesDirectoryResponse200, GetEmployeesDirectoryResponse403, GetEmployeesListMetadataParam, GetEmployeesListResponse200, GetEmployeesListResponse400, GetFieldOptionsBodyParam, GetFieldOptionsMetadataParam, GetFieldOptionsResponse200, GetFieldOptionsResponse400, GetFieldOptionsResponse403, GetFieldOptionsResponse500, GetFieldOptionsV12BodyParam, GetFieldOptionsV12MetadataParam, GetFieldOptionsV12Response200, GetFieldOptionsV12Response400, GetFieldOptionsV12Response403, GetFieldOptionsV12Response500, GetFieldsFromDatasetMetadataParam, GetFieldsFromDatasetResponse200, GetFieldsFromDatasetResponse400, GetFieldsFromDatasetResponse403, GetFieldsFromDatasetResponse500, GetFieldsFromDatasetV12MetadataParam, GetFieldsFromDatasetV12Response200, GetFieldsFromDatasetV12Response403, GetFieldsFromDatasetV12Response422, GetFieldsFromDatasetV12Response500, GetGoalAggregateMetadataParam, GetGoalAggregateResponse200, GetGoalCommentsMetadataParam, GetGoalCommentsResponse200, GetGoalsAggregateV11MetadataParam, GetGoalsAggregateV11Response200, GetGoalsAggregateV12MetadataParam, GetGoalsAggregateV12Response200, GetGoalsAggregateV1MetadataParam, GetGoalsAggregateV1Response200, GetGoalsAlignmentOptionsBodyParam, GetGoalsAlignmentOptionsMetadataParam, GetGoalsAlignmentOptionsResponse200, GetGoalsFiltersV11MetadataParam, GetGoalsFiltersV11Response200, GetGoalsFiltersV12MetadataParam, GetGoalsFiltersV12Response200, GetGoalsFiltersV1MetadataParam, GetGoalsFiltersV1Response200, GetGoalsMetadataParam, GetGoalsResponse200, GetGoalsShareOptionsMetadataParam, GetGoalsShareOptionsResponse200, GetHiringLeadsResponse200, GetHiringLeadsResponse401, GetHiringLeadsResponse403, GetHiringLeadsResponse404, GetJobSummariesMetadataParam, GetJobSummariesResponse200, GetJobSummariesResponse400, GetJobSummariesResponse401, GetJobSummariesResponse403, GetListOfUsersResponse200, GetMemberBenefitResponse200, GetMemberBenefitsMetadataParam, GetMemberBenefitsResponse200, GetMemberBenefitsResponse400, GetMemberBenefitsResponse403, GetMonitorFieldsResponse200, GetMonitorFieldsResponse401, GetMonitorFieldsResponse500, GetStatesByCountryIdMetadataParam, GetStatesByCountryIdResponse200, GetStatusesResponse200, GetStatusesResponse401, GetStatusesResponse403, GetTimeOffPoliciesMetadataParam, GetTimeOffPoliciesResponse200, GetTimeOffTypesMetadataParam, GetTimeOffTypesResponse200, GetTimeTrackingRecordMetadataParam, GetTimeTrackingRecordResponse200, GetTimeTrackingRecordResponse400, GetTimesheetEntriesMetadataParam, GetTimesheetEntriesResponse200, GetTimesheetEntriesResponse400, GetTimesheetEntriesResponse401, GetTimesheetEntriesResponse403, GetTimesheetEntriesResponse500, GetWebhookListResponse200, GetWebhookListResponse401, GetWebhookListResponse500, GetWebhookLogsMetadataParam, GetWebhookLogsResponse200, GetWebhookLogsResponse403, GetWebhookLogsResponse404, GetWebhookLogsResponse500, GetWebhookMetadataParam, GetWebhookResponse200, GetWebhookResponse401, GetWebhookResponse403, GetWebhookResponse404, GetWebhookResponse500, ListCompanyFilesResponse200, ListCompanyFilesResponse403, ListCompanyFilesResponse404, ListEmployeeFilesMetadataParam, ListEmployeeFilesResponse200, ListEmployeeFilesResponse403, ListEmployeeFilesResponse404, ListEmployeeTrainingsMetadataParam, ListEmployeeTrainingsResponse200, ListEmployeeTrainingsResponse400, ListEmployeeTrainingsResponse401, ListEmployeeTrainingsResponse403, ListEmployeeTrainingsResponse404, ListReportsMetadataParam, ListReportsResponse200, ListReportsResponse403, ListReportsResponse500, ListTrainingCategoriesResponse200, ListTrainingCategoriesResponse400, ListTrainingCategoriesResponse401, ListTrainingCategoriesResponse403, ListTrainingCategoriesResponse404, ListTrainingTypesResponse200, ListTrainingTypesResponse400, ListTrainingTypesResponse401, ListTrainingTypesResponse403, ListTrainingTypesResponse404, LoginFormDataParam, LoginMetadataParam, LoginResponse200, MetadataAddOrUpdateValuesForListFieldsBodyParam, MetadataAddOrUpdateValuesForListFieldsMetadataParam, MetadataAddOrUpdateValuesForListFieldsResponse200, MetadataAddOrUpdateValuesForListFieldsResponse400, MetadataAddOrUpdateValuesForListFieldsResponse403, MetadataAddOrUpdateValuesForListFieldsResponse404, MetadataAddOrUpdateValuesForListFieldsResponse409, MetadataGetAListOfFieldsMetadataParam, MetadataGetAListOfFieldsResponse200, MetadataGetAListOfTabularFieldsMetadataParam, MetadataGetAListOfTabularFieldsResponse200, MetadataGetDetailsForListFieldsMetadataParam, MetadataGetDetailsForListFieldsResponse200, PostApplicantStatusBodyParam, PostApplicantStatusMetadataParam, PostApplicantStatusResponse200, PostApplicantStatusResponse400, PostApplicantStatusResponse401, PostApplicantStatusResponse403, PostApplicantStatusResponse404, PostApplicationCommentBodyParam, PostApplicationCommentMetadataParam, PostApplicationCommentResponse200, PostApplicationCommentResponse400, PostApplicationCommentResponse401, PostApplicationCommentResponse403, PostApplicationCommentResponse404, PostCloseGoalBodyParam, PostCloseGoalMetadataParam, PostCloseGoalResponse201, PostCloseGoalResponse400, PostCloseGoalResponse403, PostCloseGoalResponse404, PostGoalBodyParam, PostGoalCommentBodyParam, PostGoalCommentMetadataParam, PostGoalCommentResponse201, PostGoalCommentResponse400, PostGoalCommentResponse403, PostGoalMetadataParam, PostGoalResponse201, PostGoalResponse400, PostGoalResponse403, PostGoalResponse500, PostReopenGoalMetadataParam, PostReopenGoalResponse201, PostReopenGoalResponse400, PostReopenGoalResponse403, PostReopenGoalResponse404, PostWebhookBodyParam, PostWebhookResponse201, PostWebhookResponse400, PostWebhookResponse401, PostWebhookResponse403, PostWebhookResponse500, PutGoalCommentBodyParam, PutGoalCommentMetadataParam, PutGoalCommentResponse200, PutGoalCommentResponse400, PutGoalCommentResponse403, PutGoalCommentResponse404, PutGoalMilestoneProgressBodyParam, PutGoalMilestoneProgressMetadataParam, PutGoalMilestoneProgressResponse200, PutGoalProgressBodyParam, PutGoalProgressMetadataParam, PutGoalProgressResponse200, PutGoalProgressResponse400, PutGoalProgressResponse403, PutGoalProgressResponse404, PutGoalSharedWithBodyParam, PutGoalSharedWithMetadataParam, PutGoalSharedWithResponse200, PutGoalSharedWithResponse400, PutGoalSharedWithResponse403, PutGoalSharedWithResponse404, PutGoalV11BodyParam, PutGoalV11MetadataParam, PutGoalV11Response200, PutGoalV11Response400, PutGoalV11Response403, PutGoalV11Response404, PutGoalV11Response500, PutGoalV1BodyParam, PutGoalV1MetadataParam, PutGoalV1Response200, PutGoalV1Response400, PutGoalV1Response403, PutGoalV1Response404, PutGoalV1Response500, PutWebhookBodyParam, PutWebhookMetadataParam, PutWebhookResponse200, PutWebhookResponse400, PutWebhookResponse401, PutWebhookResponse403, PutWebhookResponse404, PutWebhookResponse500, RequestCustomReportBodyParam, RequestCustomReportMetadataParam, RequestCustomReportResponse200, TimeOffAddATimeOffHistoryItemForTimeOffRequestBodyParam, TimeOffAddATimeOffHistoryItemForTimeOffRequestMetadataParam, TimeOffAddATimeOffHistoryItemForTimeOffRequestResponse201, TimeOffAddATimeOffHistoryItemForTimeOffRequestResponse400, TimeOffAddATimeOffHistoryItemForTimeOffRequestResponse403, TimeOffAddATimeOffHistoryItemForTimeOffRequestResponse409, TimeOffAddATimeOffRequestBodyParam, TimeOffAddATimeOffRequestMetadataParam, TimeOffAddATimeOffRequestResponse201, TimeOffAddATimeOffRequestResponse400, TimeOffAddATimeOffRequestResponse403, TimeOffAddATimeOffRequestResponse404, TimeOffAdjustTimeOffBalanceBodyParam, TimeOffAdjustTimeOffBalanceMetadataParam, TimeOffAdjustTimeOffBalanceResponse201, TimeOffAdjustTimeOffBalanceResponse400, TimeOffAdjustTimeOffBalanceResponse403, TimeOffAssignTimeOffPoliciesForAnEmployeeBodyParam, TimeOffAssignTimeOffPoliciesForAnEmployeeMetadataParam, TimeOffAssignTimeOffPoliciesForAnEmployeeResponse200, TimeOffAssignTimeOffPoliciesForAnEmployeeV11BodyParam, TimeOffAssignTimeOffPoliciesForAnEmployeeV11MetadataParam, TimeOffAssignTimeOffPoliciesForAnEmployeeV11Response200, TimeOffChangeARequestStatusBodyParam, TimeOffChangeARequestStatusMetadataParam, TimeOffChangeARequestStatusResponse200, TimeOffChangeARequestStatusResponse400, TimeOffChangeARequestStatusResponse403, TimeOffChangeARequestStatusResponse404, TimeOffEstimateFutureTimeOffBalancesMetadataParam, TimeOffEstimateFutureTimeOffBalancesResponse200, TimeOffGetTimeOffRequestsMetadataParam, TimeOffGetTimeOffRequestsResponse200, TimeOffGetTimeOffRequestsResponse400, TimeOffListTimeOffPoliciesForEmployeeMetadataParam, TimeOffListTimeOffPoliciesForEmployeeResponse200, TimeOffListTimeOffPoliciesForEmployeeV11MetadataParam, TimeOffListTimeOffPoliciesForEmployeeV11Response200, UpdateCompanyFileBodyParam, UpdateCompanyFileMetadataParam, UpdateCompanyFileResponse200, UpdateCompanyFileResponse400, UpdateCompanyFileResponse403, UpdateCompanyFileResponse404, UpdateEmployeeBodyParam, UpdateEmployeeDependentBodyParam, UpdateEmployeeDependentMetadataParam, UpdateEmployeeDependentResponse201, UpdateEmployeeDependentResponse400, UpdateEmployeeDependentResponse403, UpdateEmployeeDependentResponse500, UpdateEmployeeFileBodyParam, UpdateEmployeeFileMetadataParam, UpdateEmployeeFileResponse200, UpdateEmployeeFileResponse400, UpdateEmployeeFileResponse403, UpdateEmployeeFileResponse404, UpdateEmployeeMetadataParam, UpdateEmployeeResponse200, UpdateEmployeeResponse400, UpdateEmployeeResponse403, UpdateEmployeeResponse404, UpdateEmployeeResponse409, UpdateEmployeeTableRowBodyParam, UpdateEmployeeTableRowMetadataParam, UpdateEmployeeTableRowResponse200, UpdateEmployeeTableRowResponse400, UpdateEmployeeTableRowResponse403, UpdateEmployeeTableRowResponse406, UpdateEmployeeTableRowVBodyParam, UpdateEmployeeTableRowVMetadataParam, UpdateEmployeeTableRowVResponse200, UpdateEmployeeTableRowVResponse400, UpdateEmployeeTableRowVResponse403, UpdateEmployeeTableRowVResponse406, UpdateEmployeeTrainingRecordBodyParam, UpdateEmployeeTrainingRecordMetadataParam, UpdateEmployeeTrainingRecordResponse200, UpdateEmployeeTrainingRecordResponse400, UpdateEmployeeTrainingRecordResponse401, UpdateEmployeeTrainingRecordResponse403, UpdateEmployeeTrainingRecordResponse404, UpdateTrainingCategoryBodyParam, UpdateTrainingCategoryMetadataParam, UpdateTrainingCategoryResponse200, UpdateTrainingCategoryResponse400, UpdateTrainingCategoryResponse401, UpdateTrainingCategoryResponse403, UpdateTrainingCategoryResponse404, UpdateTrainingTypeBodyParam, UpdateTrainingTypeMetadataParam, UpdateTrainingTypeResponse200, UpdateTrainingTypeResponse400, UpdateTrainingTypeResponse401, UpdateTrainingTypeResponse403, UpdateTrainingTypeResponse404, UploadCompanyFileResponse201, UploadCompanyFileResponse403, UploadCompanyFileResponse404, UploadCompanyFileResponse413, UploadEmployeeFileMetadataParam, UploadEmployeeFileResponse201, UploadEmployeeFileResponse403, UploadEmployeeFileResponse404, UploadEmployeeFileResponse413, UploadEmployeePhotoMetadataParam, UploadEmployeePhotoResponse201, UploadEmployeePhotoResponse400, UploadEmployeePhotoResponse404, UploadEmployeePhotoResponse413, UploadEmployeePhotoResponse415 } from './types';
