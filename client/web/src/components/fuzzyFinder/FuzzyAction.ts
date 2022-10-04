import { MutableRefObject } from 'react'
import { ThemePreference, ThemeState } from '../../theme'

export class FuzzyAction {
    constructor(public readonly id: string, public readonly title: string, public readonly run: () => void) {}
}

export interface FuzzyActionProps {
    themeState: MutableRefObject<ThemeState>
}
export function allFuzzyActions(props: FuzzyActionProps): FuzzyAction[] {
    return [
        new FuzzyAction('toggle.theme', 'Toggle Between Dark/Light Theme', () => {
            const themeState = props.themeState.current
            switch (themeState.enhancedThemePreference) {
                case ThemePreference.Dark:
                    return themeState.setThemePreference(ThemePreference.Light)
                case ThemePreference.Light:
                    return themeState.setThemePreference(ThemePreference.Dark)
            }
        }),
    ]
}
