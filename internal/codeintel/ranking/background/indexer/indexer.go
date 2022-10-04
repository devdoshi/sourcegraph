package indexer

import (
	"context"

	"github.com/sourcegraph/sourcegraph/internal/goroutine"
)

type indexer struct {
	rankingSvc RankingService
	batchSize  int
}

var (
	_ goroutine.Handler      = &indexer{}
	_ goroutine.ErrorHandler = &indexer{}
)

func (u *indexer) Handle(ctx context.Context) error {
	return u.rankingSvc.IndexRepositories(ctx)
}

func (u *indexer) HandleError(err error) {
}
