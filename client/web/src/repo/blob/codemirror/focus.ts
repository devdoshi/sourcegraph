import { Extension, Facet, RangeSetBuilder, StateEffectType } from '@codemirror/state'
import {
    Decoration,
    DecorationSet,
    EditorView,
    PluginValue,
    ViewPlugin,
    ViewUpdate,
    WidgetType,
} from '@codemirror/view'

import { createUpdateableField } from '@sourcegraph/shared/src/components/CodeMirrorEditor'
import { UIRange } from '@sourcegraph/shared/src/util/url'

import { BlobStencilFields } from '../../../graphql-operations'

import { hovercardRanges } from './hovercard'
import { offsetToUIPosition } from './utils'

class ButtonWidget extends WidgetType {
    constructor(
        private view: EditorView,
        private setTokencardPosition: StateEffectType<TokencardRange | null>,
        private from: number,
        private to: number
    ) {
        super()
    }

    /* eslint-disable-next-line id-length*/
    public eq(other: ButtonWidget): boolean {
        // return true
        return this.to === other.to && this.from === other.from
    }

    public toDOM(): HTMLElement {
        const button = document.createElement('button')
        button.className = 'sourcegraph-document-focus'
        button.textContent = this.view.state.sliceDoc(this.from, this.to)
        button.addEventListener('click', () => {
            // TODO, sort out cleanup
            this.view.dom.addEventListener('keydown', event => {
                if (event.key === 'Escape') {
                    this.view.dispatch({
                        effects: this.setTokencardPosition.of(null),
                    })
                    button.focus()
                }
            })

            this.view.dispatch({
                effects: this.setTokencardPosition.of({
                    from: this.from,
                    to: this.to,
                    range: offsetToUIPosition(this.view.state.doc, this.from, this.to),
                }),
            })
        })

        return button
    }
}

class FocusManager implements PluginValue {
    public decorations: DecorationSet = Decoration.none
    constructor(view: EditorView, setTokencardPosition: StateEffectType<TokencardRange | null>) {
        this.decorations = this.computeDecorations(view, setTokencardPosition)
    }

    public update(update: ViewUpdate): void {
        if (update.viewportChanged) {
            // TODO: Handle view changes
            // this.decorations = this.computeDecorations(update.view)
        }
    }

    private computeDecorations(
        view: EditorView,
        setTokencardPosition: StateEffectType<TokencardRange | null>
    ): DecorationSet {
        const builder = new RangeSetBuilder<Decoration>()

        try {
            const { from, to } = view.viewport

            // Determine the start and end lines of the current viewport
            const fromLine = view.state.doc.lineAt(from)
            const toLine = view.state.doc.lineAt(to)

            const result = view.state.facet(keyboardNavigation)?.[0]
            if (result) {
                const startLine = result.at(0)?.start.line
                const endLine = result?.at(-1)?.end.line
                // Cache current line object
                let line = fromLine

                if (startLine !== undefined && endLine !== undefined) {
                    // Iterate over the rendered line (numbers) and get the
                    // corresponding occurrences from the highlighting table.
                    for (let index = startLine; index < endLine; index++) {
                        const { start, end } = result[index]

                        // Fetch new line information if necessary
                        if (line.number !== start.line + 1) {
                            line = view.state.doc.line(start.line + 1)
                        }

                        const from = line.from + start.character
                        const to = view.state.doc.line(end.line + 1).from + end.character

                        const decoration = Decoration.replace({
                            widget: new ButtonWidget(view, setTokencardPosition, from, to),
                        })
                        builder.add(from, to, decoration)
                    }
                }
            }
        } catch (error) {
            console.error('Failed to compute decorations from SCIP occurrences', error)
        }

        return builder.finish()
    }
}

interface TokencardRange {
    // CodeMirror document offsets
    from: number
    to: number

    // Line/column position
    range: UIRange
}

function tokencard(): Extension {
    const [tokencardRange, , setTokencardRange] = createUpdateableField<TokencardRange | null>(null, field =>
        hovercardRanges.computeN([field], state => {
            const range = state.field(field)
            return range ? [range] : []
        })
    )

    return [
        tokencardRange,
        ViewPlugin.define(view => new FocusManager(view, setTokencardRange), {
            decorations: plugin => plugin.decorations,
        }),
    ]
}

export const keyboardNavigation = Facet.define<
    BlobStencilFields['stencil'] | null,
    BlobStencilFields['stencil'][] | null
>({
    static: true,
    // TODO better compare
    compareInput: (rangesA, rangesB) => rangesA?.length === rangesB?.length,
    enables: tokencard(),
})
