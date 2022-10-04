package indexer

import (
	"context"

	"github.com/sourcegraph/sourcegraph/internal/goroutine"
)

func NewIndexer(rankingSvc RankingService) goroutine.BackgroundRoutine {
	return goroutine.NewPeriodicGoroutine(context.Background(), ConfigInst.Interval, &indexer{
		rankingSvc: rankingSvc,
	})
}
