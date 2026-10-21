# Signal Observatory

The Signal Observatory is Digital Alchemy's external evidence-discovery layer. It uses the public CKAN API exposed by New Zealand's data.govt.nz catalogue.

## Data flow

1. Search catalogue metadata using `/api/3/action/package_search`.
2. Inspect publisher, description, catalogue modification date, licence metadata, resource format and resource links.
3. For a resource that exposes the DataStore, request at most 100 rows from `/api/3/action/datastore_search?resource_id=...&limit=100`.
4. Display the fetched sample, its fields, a small preview and simple descriptive statistics for fields that appear numeric.
5. Export the bounded sample as CSV or pass it to Decision Lab's Evidence Forge.
6. The handoff uses the same-origin browser storage key `digitalAlchemyImportedCsv`. Decision Lab consumes it once, profiles the CSV locally, and adds the source URL, resource ID and retrieval timestamp to the evidence brief.

## Evidence and engineering boundaries

- **Live means a live API request.** Catalogue search and DataStore preview are requested when the user runs them; the interface does not silently substitute hard-coded sample records on failure.
- **A preview is not the whole dataset.** The DataStore request is capped at 100 rows. Numeric summaries describe only that returned sample, not necessarily the full population.
- **Freshness is multidimensional.** Catalogue metadata update dates do not establish the observation period or update cadence of the underlying values. Users must inspect the dataset's own description and time fields.
- **Descriptive, not predictive.** The Observatory calculates sample counts, means, minima and maxima. It does not forecast, establish causation, or automatically change Decision Lab's synthetic candidate scores.
- **Provenance travels with the sample.** The Evidence Forge brief records the source URL, resource ID and retrieval timestamp. These fields help trace a result but do not independently certify the dataset.
- **Client-side handoff.** The sample is stored briefly in same-origin browser storage to move between the two pages. A successful import removes the transfer item. If browser storage is blocked, export the CSV and import it manually.
- **No secrets or private uploads.** The page does not require an API key and the preview is requested directly by the browser. Only use datasets whose licence and terms permit the intended use. The app is not an official government service.

## Official references

- [About data.govt.nz APIs](https://www.data.govt.nz/catalogue-guide/using-data-govt-nz-apis/about-data-govt-nz-apis)
- [Accessing machine-readable data via API](https://www.data.govt.nz/catalogue-guide/using-data-govt-nz-apis/accessing-machine-readable-data-via-api)
- [API terms and do's and don'ts](https://www.data.govt.nz/catalogue-guide/using-data-govt-nz-apis/dos-and-donts-of-using-the-data-govt-nz-api)

The official documentation describes the catalogue metadata API and DataStore endpoint, while also making clear that data quality, accuracy, currency and licensing must be assessed for each dataset. This prototype therefore treats retrieved records as evidence candidates, not unquestionable truth.
