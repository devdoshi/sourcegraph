import React, { useState, useEffect, Dispatch, SetStateAction } from 'react'

import * as H from 'history'
import { useHistory } from 'react-router-dom'

import { useKeyboardShortcut } from '@sourcegraph/shared/src/keyboardShortcuts/useKeyboardShortcut'
import { Shortcut } from '@sourcegraph/shared/src/react-shortcuts'
import { SettingsCascadeProps } from '@sourcegraph/shared/src/settings/settings'
import { TelemetryProps } from '@sourcegraph/shared/src/telemetry/telemetryService'

import { parseBrowserRepoURL } from '../../util/url'

import { FuzzyFSM } from './FuzzyFsm'
import { FuzzyModal, FuzzyModalProps } from './FuzzyModal'
import { FuzzyTabsProps, useFuzzyTabs } from './FuzzyTabs'

const DEFAULT_MAX_RESULTS = 100

interface FuzzyFinderContainerProps
    extends TelemetryProps,
        Pick<FuzzyFinderProps, 'location'>,
        SettingsCascadeProps,
        FuzzyTabsProps {}

/**
 * This components registers a global keyboard shortcut to render the fuzzy
 * finder and renders the fuzzy finder.
 */
export const FuzzyFinderContainer: React.FunctionComponent<FuzzyFinderContainerProps> = props => {
    const [isVisible, setIsVisible] = useState(false)
    const [retainFuzzyFinderCache, setRetainFuzzyFinderCache] = useState(true)
    const fuzzyFinderShortcut = useKeyboardShortcut('fuzzyFinder')
    const tabs = useFuzzyTabs(props)

    // useEffect(() => {
    //     if (isVisible) {
    //         props.telemetryService.log('FuzzyFinderViewed', { action: 'shortcut open' })
    //     }
    // }, [props.telemetryService, isVisible])

    if (tabs.isAllHidden()) {
        return null
    }

    return (
        <>
            {fuzzyFinderShortcut?.keybindings.map(keybinding => (
                <Shortcut
                    key={`fuzzyFinderShortcut.title-${JSON.stringify(keybinding)}`}
                    {...keybinding}
                    onMatch={() => {
                        setIsVisible(true)
                        setRetainFuzzyFinderCache(true)
                        const input = document.querySelector<HTMLInputElement>('#fuzzy-modal-input')
                        input?.focus()
                        input?.select()
                    }}
                    ignoreInput={true}
                />
            ))}
            {retainFuzzyFinderCache && (
                <FuzzyFinder
                    tabs={tabs}
                    setIsVisible={bool => setIsVisible(bool)}
                    isVisible={isVisible}
                    location={props.location}
                    setCacheRetention={bool => setRetainFuzzyFinderCache(bool)}
                />
            )}
        </>
    )
}

interface FuzzyFinderProps extends Pick<FuzzyModalProps, 'tabs'> {
    setIsVisible: Dispatch<SetStateAction<boolean>>

    isVisible: boolean

    location: H.Location

    setCacheRetention: Dispatch<SetStateAction<boolean>>

    /**
     * The maximum number of files a repo can have to use case-insensitive fuzzy finding.
     *
     * Case-insensitive fuzzy finding is more expensive to compute compared to
     * word-sensitive fuzzy finding.  The fuzzy modal will use case-insensitive
     * fuzzy finding when the repo has fewer files than this number, and
     * word-sensitive fuzzy finding otherwise.
     */
    caseInsensitiveFileCountThreshold?: number
}

const FuzzyFinder: React.FunctionComponent<React.PropsWithChildren<FuzzyFinderProps>> = ({
    location: { search, pathname, hash },
    setCacheRetention,
    setIsVisible,
    isVisible,
    tabs,
}) => {
    // The state machine of the fuzzy finder. See `FuzzyFSM` for more details
    // about the state transititions.
    const [fsm, setFsm] = useState<FuzzyFSM>({ key: 'empty' })
    const { repoName = '', commitID = '', rawRevision = '' } = parseBrowserRepoURL(pathname + search + hash)

    const history = useHistory()
    useEffect(
        () =>
            history.listen(location => {
                const url = location.pathname + location.search + location.hash
                const { repoName: repo = '', commitID: commit = '', rawRevision: raw = '' } = parseBrowserRepoURL(url)
                if (repo !== repoName || commit !== commitID || raw !== rawRevision) {
                    setCacheRetention(false)
                }
            }),
        [history, repoName, commitID, rawRevision, setCacheRetention]
    )

    if (!isVisible) {
        return null
    }

    return (
        <FuzzyModal
            tabs={tabs}
            repoName={repoName}
            commitID={commitID}
            initialMaxResults={DEFAULT_MAX_RESULTS}
            initialQuery=""
            onClose={() => setIsVisible(false)}
            fsm={fsm}
            setFsm={setFsm}
        />
    )
}
