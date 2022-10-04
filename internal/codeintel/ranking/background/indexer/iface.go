package indexer

import "context"

type RankingService interface {
	IndexRepositories(ctx context.Context) error
}
