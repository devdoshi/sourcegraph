import { requestGraphQL } from '../backend/graphql'
import { FuzzySearch, FuzzySearchParameters, FuzzySearchResult } from './FuzzySearch'
import gql from 'tagged-template-noop'
import { FuzzyFinderRepoResult, FuzzyFinderRepoVariables } from '../graphql-operations'

export class RepoFuzzySearch extends FuzzySearch {
    public totalFileCount = 0
    private repositoryNames = new Set<string>()
    public search(parameters: FuzzySearchParameters): FuzzySearchResult {
        const query = parameters.query.replaceAll('/', '.*/.*')
        requestGraphQL<FuzzyFinderRepoResult, FuzzyFinderRepoVariables>(
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
        )
        this.repositoryNames
        return {
            isComplete: false,
            links: [],
        }
    }
    private async runQuery(query: string): Promise<void> {
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
        for (const name of names) {
            this.repositoryNames.add(name)
        }
    }
}
