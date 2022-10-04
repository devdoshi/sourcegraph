import { Dispatch, SetStateAction, useEffect, useMemo, useRef, useState } from 'react'

import * as H from 'history'
import useDeepCompareEffect from 'use-deep-compare-effect'

import { Settings, SettingsCascadeOrError } from '@sourcegraph/shared/src/settings/settings'
import { useSessionStorage } from '@sourcegraph/wildcard'

import { SearchIndexing } from '../../fuzzyFinder/FuzzySearch'
import { getExperimentalFeatures } from '../../util/get-experimental-features'
import { parseBrowserRepoURL } from '../../util/url'

import { allFuzzyActions, FuzzyAction, FuzzyActionProps } from './FuzzyAction'
import { newFuzzyFSM, FuzzyFSM, Indexing } from './FuzzyFsm'
import { filesFSM, useFilename } from './useFilename'

export enum FuzzyTabState {
    Hidden,
    Disabled,
    Enabled,
    Active,
}

class Tab {
    constructor(
        public readonly title: string,
        public readonly state: FuzzyTabState,
        public readonly fsm: FuzzyFSM | undefined = undefined
    ) {}
    public withFSM(fsm: FuzzyFSM): Tab {
        return new Tab(this.title, this.state, fsm)
    }
    public withState(state: FuzzyTabState.Active | FuzzyTabState.Enabled): Tab | undefined {
        switch (this.state) {
            case FuzzyTabState.Hidden:
            case FuzzyTabState.Disabled:
                return undefined
            default:
                if (state === this.state) {
                    return undefined
                }
                return new Tab(this.title, state, this.fsm)
        }
    }
    public isVisible(): boolean {
        return this.state !== FuzzyTabState.Hidden
    }
}

const defaultKinds: Tabs = {
    all: new Tab('All', FuzzyTabState.Enabled),
    actions: new Tab('Actions', FuzzyTabState.Enabled),
    repos: new Tab('Repos', FuzzyTabState.Enabled),
    files: new Tab('Files', FuzzyTabState.Enabled),
    symbols: new Tab('Symbols', FuzzyTabState.Enabled),
    lines: new Tab('Lines', FuzzyTabState.Enabled),
}
const hiddenKind: Tab = new Tab('Hidden', FuzzyTabState.Hidden)

export interface Tabs {
    all: Tab
    actions: Tab
    repos: Tab
    files: Tab
    symbols: Tab
    lines: Tab
}

export class FuzzyTabs {
    constructor(
        public readonly tabs: Tabs,
        public readonly actions: FuzzyAction[],
        public readonly query: string,
        public readonly setQuery: Dispatch<SetStateAction<string>>
    ) {}
    public trimmedQuery(): string {
        if (this.query.startsWith('/')) {
            return this.query.replace(/^\/ */, '')
        }
        if (this.query.startsWith('#')) {
            return this.query.replace(/^# */, '')
        }
        if (this.query.startsWith('>')) {
            return this.query.replace(/^> */, '')
        }
        return this.query
    }
    public entries(): [keyof Tabs, Tab][] {
        const result: [keyof Tabs, Tab][] = []
        for (const key of Object.keys(this.tabs)) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
            const value = (this.tabs as any)[key as keyof Tab] as Tab
            result.push([key as keyof Tabs, value])
        }
        return result
    }
    public isActive(state: FuzzyTabState): boolean {
        return state === FuzzyTabState.Active || this.tabs.all.state == FuzzyTabState.Active
    }
    public withQuery(newQuery: string): FuzzyTabs {
        return new FuzzyTabs(this.tabs, this.actions, newQuery, this.setQuery)
    }
    public withTabs(newTabs: Partial<Tabs>): FuzzyTabs {
        return new FuzzyTabs({ ...this.tabs, ...newTabs }, this.actions, this.query, this.setQuery)
    }
    public all(): Tab[] {
        return Object.values(this.tabs)
        // return [this.tabs.all, this.tabs.actions, this.tabs.repos, this.tabs.files, this.tabs.lines]
    }
    public isDownloading(): boolean {
        return this.all().find(tab => tab.fsm && tab.fsm.key === 'downloading') === undefined
    }
    public isAllHidden(): boolean {
        return this.all().find(tab => tab.state !== FuzzyTabState.Hidden) === undefined
    }
}

export interface FuzzyTabsProps extends FuzzyActionProps {
    settingsCascade: SettingsCascadeOrError<Settings>
    isRepositoryRelatedPage: boolean
    location: H.Location
}

const isIndexing = new Set<string>()

function activeTab(query: string): keyof Tabs {
    if (query.startsWith('/')) {
        return 'files'
    }
    if (query.startsWith('#')) {
        return 'symbols'
    }
    if (query.startsWith('>')) {
        return 'actions'
    }
    return 'all'
}

export function useFuzzyTabs(props: FuzzyTabsProps): FuzzyTabs {
    const { repoName = '', commitID = '', rawRevision = '' } = useMemo(
        () => parseBrowserRepoURL(props.location.pathname + props.location.search + props.location.hash),
        [props.location]
    )

    const { fuzzyFinderActions } = getExperimentalFeatures(props.settingsCascade.final) ?? false

    // NOTE: the query is cached in session storage to mimic the file pickers in
    // IntelliJ (by default) and VS Code (when "Workbench > Quick Open >
    // Preserve Input" is enabled).
    const initialQuery = ''
    const [query, setQuery] = useSessionStorage(`fuzzy-modal.query.${repoName}`, initialQuery)
    const queryRef = useRef(query)
    queryRef.current = query

    const [tabs, setTabs] = useState<FuzzyTabs>(() => {
        const actions = allFuzzyActions(props)
        return new FuzzyTabs(
            {
                all: fuzzyFinderActions ? defaultKinds.all : hiddenKind,
                actions: fuzzyFinderActions
                    ? defaultKinds.actions.withFSM(newFuzzyFSM(actions.map(action => action.title)))
                    : hiddenKind,
                repos: hiddenKind,
                files: props.isRepositoryRelatedPage ? defaultKinds.files : hiddenKind,
                symbols: hiddenKind,
                lines: hiddenKind,
            },
            actions,
            query,
            setQuery
        )
    })

    // Keep `tabs` in-sync with `query`
    const active = activeTab(query)
    useEffect(() => {
        const updatedTabs: Partial<Tabs> = {}
        for (const [key, value] of tabs.entries()) {
            const newValue = value.withState(active === key ? FuzzyTabState.Active : FuzzyTabState.Enabled)
            if (newValue) {
                updatedTabs[key] = newValue
            }
        }
        if (tabs.query !== query || Object.keys(updatedTabs).length > 0) {
            setTabs(tabs.withQuery(queryRef.current).withTabs(updatedTabs))
        }
    }, [query, active, tabs])

    useEffect(() => {
        for (const [key, value] of tabs.entries()) {
            // TODO: move `isIndexing` into FSM
            if (!isIndexing.has(key) && value.fsm?.key === 'indexing') {
                isIndexing.add(value.title)
                continueIndexing(value.fsm.indexing)
                    .then(next => {
                        const updatedTabs: Partial<Tabs> = {}
                        updatedTabs[key] = value.withFSM(next)
                        setTabs(tabs.withQuery(queryRef.current).withTabs(updatedTabs))
                    })
                    // eslint-disable-next-line no-console
                    .catch(error => console.error(`failed to index fuzzy tab ${key}`, error))
                    .finally(() => isIndexing.delete(value.title))
            }
        }
    }, [tabs])

    const { downloadFilename, filenameError, isLoadingFilename } = useFilename(repoName, commitID || rawRevision)

    useEffect(() => {
        setTabs(
            tabs.withQuery(queryRef.current).withTabs({
                files: tabs.tabs.files.withFSM(filesFSM({ downloadFilename, filenameError, isLoadingFilename })),
            })
        )
    }, [downloadFilename, filenameError, isLoadingFilename])

    return tabs
}

async function continueIndexing(indexing: SearchIndexing): Promise<FuzzyFSM> {
    const next = await indexing.continue()
    if (next.key === 'indexing') {
        return { key: 'indexing', indexing: next }
    }
    return {
        key: 'ready',
        fuzzy: next.value,
    }
}
