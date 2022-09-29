import { Facet, RangeSetBuilder } from '@codemirror/state'
import { Decoration, DecorationSet, EditorView, PluginValue, ViewPlugin, WidgetType } from '@codemirror/view'

import { BlobStencilFields } from '../../../graphql-operations'

class ButtonWidget extends WidgetType {
    constructor(private content: string) {
        super()
    }

    /* eslint-disable-next-line id-length */
    public eq(other: ButtonWidget): boolean {
        return this.content === other.content
    }

    public toDOM(): HTMLElement {
        const button = document.createElement('button')
        button.textContent = this.content
        return button
    }
}

class FocusManager implements PluginValue {
    public decorations: DecorationSet = Decoration.none

    constructor(view: EditorView) {
        this.decorations = this.computeDecorations(view)
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
                let char = null

                if (startLine !== undefined && endLine !== undefined) {
                    // Iterate over the rendered line (numbers) and get the
                    // corresponding occurrences from the highlighting table.
                    for (let index = startLine; index < endLine; index++) {
                        const { start, end } = result[index]
                        char = start.character

                        // Fetch new line information if necessary
                        if (line.number !== start.line + 1) {
                            line = view.state.doc.line(start.line + 1)
                        }

                        const from = line.from + start.character
                        const to = view.state.doc.line(end.line + 1).from + end.character

                        const decoration = Decoration.mark({
                            attributes: {
                                tabIndex: '0',
                            },
                        })

                        // TODO: Would be great to have these as buttons
                        // const decoration = Decoration.replace({
                        //     widget: new ButtonWidget(view.state.sliceDoc(from, to)),
                        // })

                        console.log(to, from, start.character, end.character)
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
