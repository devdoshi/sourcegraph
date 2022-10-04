import React, { useState, useEffect, useMemo } from 'react'

import { mdiClose } from '@mdi/js'
import classNames from 'classnames'

import { pluralize } from '@sourcegraph/common'
import { toPrettyBlobURL } from '@sourcegraph/shared/src/util/url'
import { Button, Modal, Icon, H3, Text, Input, useSessionStorage } from '@sourcegraph/wildcard'

import { AggregateFuzzySearch } from '../../fuzzyFinder/AggregateFuzzySearch'
import { FuzzySearch, FuzzySearchResult } from '../../fuzzyFinder/FuzzySearch'
import { parseBrowserRepoURL } from '../../util/url'

import { FuzzyFSM, Indexing } from './FuzzyFsm'
import { FuzzyTabs } from './FuzzyTabs'
import { HighlightedLink } from './HighlightedLink'

import styles from './FuzzyModal.module.scss'

const FUZZY_MODAL_RESULTS = 'fuzzy-modal-results'

// Cache for the last fuzzy query. This value is only used to avoid redoing the
// full fuzzy search on every re-render when the user presses the down/up arrow
// keys to move the "focus index".
const lastFuzzySearchResult = new Map<string, FuzzySearchResult>()

// The number of results to jump by on PageUp/PageDown keyboard shortcuts.
const PAGE_DOWN_INCREMENT = 10

export interface FuzzyModalProps {
    repoName: string
    commitID: string
    initialMaxResults: number
    initialQuery: string
    onClose: () => void
    tabs: FuzzyTabs
}

function cleanupOldLocalStorage(): void {
    for (let index = 0; index < localStorage.length; index++) {
        const key = localStorage.key(index)
        if (key?.startsWith('fuzzy-modal.')) {
            localStorage.removeItem(key)
        }
    }
}

interface QueryResult {
    resultsCount: number
    isComplete: boolean
    totalFileCount: number
    fuzzyResultElement: JSX.Element
}

function renderFiles(
    focusIndex: number,
    maxResults: number,
    props: FuzzyModalProps,
    search: FuzzySearch,
    indexingFileCount: number
): QueryResult {
    const query = props.tabs.query
    // Parse the URL here instead of accepting it as a React prop because the
    // URL can change based on shortcuts like `y` that won't trigger a re-render
    // in React. By parsing the URL here, we avoid the risk of rendering links to a revision that
    // doesn't match the active revision in the browser's address bar.
    const repoUrl = parseBrowserRepoURL(location.pathname + location.search + location.hash)
    const cacheKey = `${query}-${maxResults}${indexingFileCount}-${repoUrl.revision || ''}`
    let filesResult = lastFuzzySearchResult.get(cacheKey)
    if (!filesResult) {
        const start = window.performance.now()
        filesResult = search.search({
            query,
            maxResults,
            createUrl: filename =>
                toPrettyBlobURL({
                    filePath: filename,
                    revision: repoUrl.revision,
                    repoName: props.repoName,
                    commitID: props.commitID,
                }),
            onClick: () => props.onClose(),
        })
        filesResult.elapsedMilliseconds = window.performance.now() - start
        lastFuzzySearchResult.clear() // Only cache the last query.
        lastFuzzySearchResult.set(cacheKey, filesResult)
    }
    const links = filesResult.links
    if (links.length === 0) {
        return {
            fuzzyResultElement: <Text>No files matching '{query}'</Text>,
            resultsCount: 0,
            totalFileCount: search.totalFileCount,
            isComplete: filesResult.isComplete,
        }
    }

    const linksToRender = links.slice(0, maxResults)
    const element = (
        <ul id={FUZZY_MODAL_RESULTS} className={styles.results} role="listbox" aria-label="Fuzzy finder results">
            {linksToRender.map((file, fileIndex) => (
                <li
                    id={fuzzyResultId(fileIndex)}
                    key={file.text}
                    role="option"
                    aria-selected={fileIndex === focusIndex}
                    className={classNames('p-1', fileIndex === focusIndex && styles.focused)}
                >
                    <HighlightedLink {...file} />
                </li>
            ))}
        </ul>
    )
    return {
        fuzzyResultElement: element,
        resultsCount: linksToRender.length,
        totalFileCount: search.totalFileCount,
        isComplete: filesResult.isComplete,
    }
}

function emptyResults(element: JSX.Element): QueryResult {
    return {
        resultsCount: 0,
        isComplete: true,
        totalFileCount: 0,
        fuzzyResultElement: element,
    }
}

/**
 * Component that interactively displays filenames in the open repository when given fuzzy queries.
 *
 * Similar to "Go to file" in VS Code or the "t" keyboard shortcut on github.com
 */
export const FuzzyModal: React.FunctionComponent<React.PropsWithChildren<FuzzyModalProps>> = props => {
    // The "focus index" is the index of the file result that the user has
    // select with up/down arrow keys. The focused item is highlighted and the
    // window.location is moved to that URL when the user presses the enter key.
    const [focusIndex, setFocusIndex] = useSessionStorage(
        `fuzzy-modal.focus-index.${props.repoName}.${props.commitID}`,
        0
    )

    // Old versions of the fuzzy finder used local storage for the query and
    // focus index.  This logic attempts to remove old keys from localStorage
    // since we only use session storage now.
    useEffect(() => cleanupOldLocalStorage(), [])

    // The maximum number of results to display in the fuzzy finder. For large
    // repositories, a generic query like "src" may return thousands of results
    // making DOM rendering slow.  The user can increase this number by clicking
    // on a button at the bottom of the result list.
    const [maxResults, setMaxResults] = useState(props.initialMaxResults)

    const { resultsCount, isComplete, totalFileCount, fuzzyResultElement } = useMemo<QueryResult>(() => {
        let isDownloading = false
        const errors: string[] = []
        const searches: FuzzySearch[] = []
        let indexingFileCount = 0
        for (const [, tab] of props.tabs.entries()) {
            if (!tab.fsm) {
                continue
            }
            switch (tab.fsm.key) {
                case 'failed':
                    errors.push(tab.fsm.errorMessage)
                    break
                case 'downloading':
                    isDownloading = true
                    break
                case 'indexing':
                    indexingFileCount += tab.fsm.indexing.indexedFileCount
                    searches.push(tab.fsm.indexing.partialFuzzy)
                    break
                case 'ready':
                    searches.push(tab.fsm.fuzzy)
            }
        }
        if (errors.length > 0) {
            return emptyResults(<Text>Error: {JSON.stringify(errors)}</Text>)
        }
        if (isDownloading) {
            return emptyResults(<Text>Downloading</Text>)
        }
        const search = new AggregateFuzzySearch(searches)
        return renderFiles(focusIndex, maxResults, props, search, indexingFileCount)
    }, [focusIndex, maxResults, props])

    // Sets the new "focus index" so that it's rounded by the number of
    // displayed filenames.  Cycles so that the user can press-hold the down
    // arrow and it goes all the way down and back up to the top result.
    function setRoundedFocusIndex(increment: number): void {
        const newNumber = focusIndex + increment
        const index = newNumber % resultsCount
        const nextIndex = index < 0 ? resultsCount + index : index
        setFocusIndex(nextIndex)
        document.querySelector(`#fuzzy-modal-result-${nextIndex}`)?.scrollIntoView(false)
    }

    function onInputKeyDown(event: React.KeyboardEvent): void {
        switch (true) {
            case event.key === 'Escape':
                props.onClose()
                break
            case event.key === 'ArrowDown':
                event.preventDefault() // Don't move the cursor to the end of the input.
                setRoundedFocusIndex(1)
                break
            case event.key === 'PageDown':
                setRoundedFocusIndex(PAGE_DOWN_INCREMENT)
                break
            case event.key === 'ArrowUp':
                event.preventDefault() // Don't move the cursor to the start of input.
                setRoundedFocusIndex(-1)
                break
            case event.key === 'PageUp':
                setRoundedFocusIndex(-PAGE_DOWN_INCREMENT)
                break
            case event.key === 'Enter':
                if (focusIndex < resultsCount) {
                    const fileAnchor = document.querySelector<HTMLAnchorElement>(`#fuzzy-modal-result-${focusIndex} a`)
                    fileAnchor?.click()
                    props.onClose()
                }
                break
            default:
        }
    }

    return (
        <Modal position="center" className={styles.modal} onDismiss={() => props.onClose()} aria-label="Fuzzy finder">
            <div className={styles.content}>
                <div className={styles.header}>
                    {props.tabs
                        .all()
                        .filter(tab => tab.isVisible())
                        .map(tab => (
                            <H3 key={tab.title} className="mb-0">
                                {tab.title}
                            </H3>
                        ))}
                    <Button variant="icon" onClick={() => props.onClose()} aria-label="Close">
                        <Icon className={styles.closeIcon} aria-hidden={true} svgPath={mdiClose} />
                    </Button>
                </div>
                <Input
                    autoComplete="off"
                    spellCheck="false"
                    role="combobox"
                    autoFocus={true}
                    aria-autocomplete="list"
                    aria-controls={FUZZY_MODAL_RESULTS}
                    aria-owns={FUZZY_MODAL_RESULTS}
                    aria-expanded={props.tabs.isDownloading()}
                    aria-activedescendant={fuzzyResultId(focusIndex)}
                    id="fuzzy-modal-input"
                    className={styles.input}
                    placeholder="Enter a partial file path or name"
                    value={props.tabs.query}
                    onChange={({ target: { value } }) => {
                        props.tabs.setQuery(value)
                    }}
                    onKeyDown={onInputKeyDown}
                />
                <div className={styles.summary}>
                    <FuzzyResultsSummary
                        tabs={props.tabs}
                        resultsCount={resultsCount}
                        isComplete={isComplete}
                        totalFileCount={totalFileCount}
                    />
                </div>
                {fuzzyResultElement}
                {!isComplete && (
                    <Button
                        className={styles.showMore}
                        onClick={() => setMaxResults(maxResults + props.initialMaxResults)}
                        variant="secondary"
                    >
                        Show more
                    </Button>
                )}
            </div>
        </Modal>
    )
}

function plural(what: string, count: number, isComplete: boolean): string {
    return `${count.toLocaleString()}${isComplete ? '' : '+'} ${pluralize(what, count)}`
}
interface FuzzyResultsSummaryProps {
    tabs: FuzzyTabs
    resultsCount: number
    isComplete: boolean
    totalFileCount: number
}

const FuzzyResultsSummary: React.FunctionComponent<React.PropsWithChildren<FuzzyResultsSummaryProps>> = ({
    tabs,
    resultsCount,
    isComplete,
    totalFileCount,
}) => (
    <>
        <span className={styles.resultCount}>
            {plural('result', resultsCount, isComplete)} - {indexingProgressBar(tabs)}{' '}
            {plural('total file', totalFileCount, true)}
        </span>
        <i className="text-muted">
            <kbd>↑</kbd> and <kbd>↓</kbd> arrow keys browse. <kbd>⏎</kbd> selects.
        </i>
    </>
)

function indexingProgressBar(tabs: FuzzyTabs): JSX.Element {
    let indexedFiles = 0
    let totalFiles = 0
    for (const [, tab] of tabs.entries()) {
        if (!tab.fsm) {
            continue
        }
        if (tab.fsm.key === 'indexing') {
            indexedFiles += tab.fsm.indexing.indexedFileCount
            totalFiles += tab.fsm.indexing.totalFileCount
        }
    }
    if (indexedFiles === 0 && totalFiles === 0) {
        return <></>
    }
    const percentage = Math.round((indexedFiles / totalFiles) * 100)
    return (
        <progress value={indexedFiles} max={totalFiles}>
            {percentage}%
        </progress>
    )
}

function fuzzyResultId(id: number): string {
    return `fuzzy-modal-result-${id}`
}
