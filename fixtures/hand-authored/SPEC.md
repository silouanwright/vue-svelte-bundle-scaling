# Hand-Authored Application Specification

## Purpose

This workload tests complete production bundles containing independently designed product features. It is not intended to force a crossover or to imitate a particular framework's preferred demo.

The specification was fixed before either framework's bundle result was measured.

## Application

The application is a client-heavy research workspace with eight feature routes:

| Route | Required behavior | Leaf components |
| --- | --- | --- |
| Dashboard | Summarize metrics, filter recent activity, and expose health status | `MetricBoard`, `ActivityTimeline`, `HealthChecklist` |
| Search | Edit a query, toggle facets, rank results, and save a search | `QueryComposer`, `FacetFilters`, `SearchResults` |
| Records | Sort and select tabular records, choose columns, and paginate | `RecordTable`, `ColumnPicker`, `Pager` |
| Reader | Navigate sections, adjust reading state, and create annotations | `ContentsTree`, `ReaderViewport`, `AnnotationComposer` |
| Editor | Edit a document, expose save state, and inspect revisions | `DocumentEditor`, `AutosaveStatus`, `RevisionHistory` |
| Settings | Validate a profile, select appearance, and edit shortcuts | `ProfileForm`, `ThemeChooser`, `ShortcutEditor` |
| Notifications | Filter notices, dismiss items, and configure quiet hours | `NotificationList`, `ChannelMatrix`, `QuietHours` |
| Library | Filter sources, navigate collections, and monitor imports | `SourceBrowser`, `CollectionTree`, `ImportQueue` |

Each route is a separate lazy boundary except Dashboard, which is the initial route. Every route shell and leaf is a component definition.

## Equivalence Rules

- Vue and Svelte expose the same visible labels and `data-testid` hooks.
- Both versions begin with the same data and state.
- Both versions perform the same user-visible transitions.
- Framework code should be idiomatic, but neither version may remove required behavior for size.
- No framework-specific UI or state library is included. This lane isolates component and application code; specialist-library integration belongs to a separate product benchmark.

## Scaling Points

The benchmark builds the first 1, 2, 4, and 8 routes in manifest order. Scale therefore increases by complete product features rather than cloned component definitions.

## Transfer Measurements

For each build:

- raw, gzip level 9, and Brotli quality 11 per emitted JavaScript file;
- initial-route transfer;
- each lazy-route transfer;
- complete cold traversal, counting every emitted file once;
- coalesced compression as a repetition diagnostic only.

## Parity Gate

Playwright runs the same assertions against both complete applications and
exercises every route and every leaf component. A bundle result is not
publishable if either implementation fails parity.
