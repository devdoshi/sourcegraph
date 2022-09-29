import { Facet, RangeSetBuilder } from '@codemirror/state'
import { Decoration, DecorationSet, EditorView, PluginValue, ViewPlugin, ViewUpdate } from '@codemirror/view'

import { BlobStencilFields } from '../../../graphql-operations'

class FocusManager implements PluginValue {
    public decorations: DecorationSet = Decoration.none

    constructor(view: EditorView) {
        this.decorations = this.computeDecorations(view)
    }

    public update(update: ViewUpdate): void {
        if (update.viewportChanged) {
            // TODO: Handle view changes
            // this.decorations = this.computeDecorations(update.view)
        }
    }

    private computeDecorations(view: EditorView): DecorationSet {
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
                console.log(startLine, endLine)
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

                        const decoration = Decoration.mark({
                            attributes: {
                                tabIndex: '0',
                                role: 'button',
                            },
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

export const keyboardNavigation = Facet.define<
    BlobStencilFields['stencil'] | null,
    BlobStencilFields['stencil'][] | null
>({
    static: true,
    // TODO better compare
    compareInput: (rangesA, rangesB) => rangesA?.length === rangesB?.length,
    enables: ViewPlugin.fromClass(FocusManager, { decorations: plugin => plugin.decorations }),
})
