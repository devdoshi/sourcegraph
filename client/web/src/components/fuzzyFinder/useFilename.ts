import { ApolloError, useQuery } from '@apollo/client'

import { gql, getDocumentNode } from '@sourcegraph/http-client'

import { FileNamesResult, FileNamesVariables } from '../../graphql-operations'

import { FuzzyFSM, newFuzzyFSM } from './FuzzyFsm'

export interface FilenameResult {
    downloadFilename: string[]
    isLoadingFilename: boolean
    filenameError: ApolloError | undefined
}

const emptyArray: string[] = []
export const useFilename = (repository: string, commit: string): FilenameResult => {
    const { data, loading, error } = useQuery<FileNamesResult, FileNamesVariables>(getDocumentNode(FILE_NAMES), {
        variables: { repository, commit },
    })

    return {
        downloadFilename: data?.repository?.commit?.fileNames || emptyArray,
        isLoadingFilename: loading,
        filenameError: error,
    }
}

const FILE_NAMES = gql`
    query FileNames($repository: String!, $commit: String!) {
        repository(name: $repository) {
            id
            commit(rev: $commit) {
                id
                fileNames
            }
        }
    }
`

export function filesFSM(result: FilenameResult): FuzzyFSM {
    if (result.isLoadingFilename) {
        return {
            key: 'downloading',
        }
    }
    if (result.filenameError) {
        return {
            key: 'failed',
            errorMessage: JSON.stringify(result.filenameError),
        }
    }
    return newFuzzyFSM(result.downloadFilename)
}
