import gql from 'tagged-template-noop'
import { requestGraphQL } from '../../backend/graphql'
import { CaseInsensitiveFuzzySearch } from '../../fuzzyFinder/CaseInsensitiveFuzzySearch'
import { FuzzySearch, IndexingFSM, SearchIndexing } from '../../fuzzyFinder/FuzzySearch'
import { FuzzyFinderRepoResult, FuzzyFinderRepoVariables } from '../../graphql-operations'

export class Repositories {
    public queries: Map<string, Promise<string[]>> = new Map()
    public doneQueries: Set<string> = new Set()
    public repositoryNames: Set<string> = new Set()
    constructor(
        public readonly initialRepositoryNames: string[],
        public readonly setRepositoryNames: (newNames: string[]) => void
    ) {
        for (const name of initialRepositoryNames) {
            this.repositoryNames.add(name)
        }
    }
    private addRepositoryNames(names: string[]): void {
        this.setRepositoryNames(names)
        for (const name of names) {
            this.repositoryNames.add(name)
        }
    }
    public isDoneDownloading(): boolean {
        return this.queries.size === 0
    }
    public hasQuery(query: string): boolean {
        return this.queries.has(query) || this.doneQueries.has(query)
    }
    public fuzzySearch(): FuzzySearch {
        return new CaseInsensitiveFuzzySearch(
            [...this.repositoryNames].map(name => ({ text: name })),
            name => `/${name}`
        )
    }
    public indexingFSM(): SearchIndexing {
        let indexingPromise: Promise<IndexingFSM> | undefined
        return {
            key: 'indexing',
            partialFuzzy: this.fuzzySearch(),
            indexedFileCount: this.repositoryNames.size,
            totalFileCount: this.repositoryNames.size * 2,
            isIndexing: () => indexingPromise !== undefined,
            continueIndexing: () => {
                if (!indexingPromise) {
                    indexingPromise = Promise.any([...this.queries.values()]).then(() =>
                        this.isDoneDownloading() ? { key: 'ready', value: this.fuzzySearch() } : this.indexingFSM()
                    )
                }
                return indexingPromise
            },
        }
    }
    public async handleQuery(query: string): Promise<void> {
        const response = await requestGraphQL<FuzzyFinderRepoResult, FuzzyFinderRepoVariables>(
            gql`
                query FuzzyFinderRepo($query: String!) {
                    search(patternType: regexp, query: $query) {
                        results {
                            repositories {
                                name
                            }
                        }
                    }
                }
            `,
            { query }
        ).toPromise()

        const names = response.data?.search?.results?.repositories?.map(({ name }) => name) || []
        this.addRepositoryNames(names)
    }
    public addQuery(query: string, promise: Promise<string[]>): boolean {
        this.queries.set(query, promise)
        promise.then(
            result => {
                this.setRepositoryNames(result)
                this.queries.delete(query)
                this.doneQueries.add(query)
            },
            error => console.error(`failed to download repository names for query ${query}`, error)
        )
        return true
    }
}
