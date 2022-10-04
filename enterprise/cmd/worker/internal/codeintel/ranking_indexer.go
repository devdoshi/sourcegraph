package codeintel

import (
	"context"

	"github.com/sourcegraph/log"

	"github.com/sourcegraph/sourcegraph/cmd/worker/job"
	"github.com/sourcegraph/sourcegraph/cmd/worker/shared/init/codeintel"
	workerdb "github.com/sourcegraph/sourcegraph/cmd/worker/shared/init/db"

	"github.com/sourcegraph/sourcegraph/internal/codeintel/ranking"
	"github.com/sourcegraph/sourcegraph/internal/codeintel/ranking/background/indexer"
	"github.com/sourcegraph/sourcegraph/internal/codeintel/uploads"
	"github.com/sourcegraph/sourcegraph/internal/database"
	"github.com/sourcegraph/sourcegraph/internal/env"
	"github.com/sourcegraph/sourcegraph/internal/goroutine"
)

type rankingIndexerJob struct{}

func NewRankingIndexerJob() job.Job {
	return &rankingIndexerJob{}
}

func (j *rankingIndexerJob) Description() string {
	return ""
}

func (j *rankingIndexerJob) Config() []env.Config {
	return []env.Config{
		indexer.ConfigInst,
	}
}

func (j *rankingIndexerJob) Routines(startupCtx context.Context, logger log.Logger) ([]goroutine.BackgroundRoutine, error) {
	rawDB, err := workerdb.Init()
	if err != nil {
		return nil, err
	}
	db := database.NewDB(logger, rawDB)

	rawCodeIntelDB, err := codeintel.InitCodeIntelDatabase()
	if err != nil {
		return nil, err
	}
	codeIntelDB := database.NewDB(logger, rawCodeIntelDB)

	gitserverClient, err := codeintel.InitGitserverClient()
	if err != nil {
		return nil, err
	}

	uploadSvc := uploads.GetService(db, codeIntelDB, gitserverClient)
	rankingSvc := ranking.GetService(uploadSvc)

	return []goroutine.BackgroundRoutine{
		indexer.NewIndexer(rankingSvc),
	}, nil
}
