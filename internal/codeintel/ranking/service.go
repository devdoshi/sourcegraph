package ranking

import (
	"context"
	"errors"

	"github.com/sourcegraph/log"

	"github.com/sourcegraph/sourcegraph/internal/api"
	"github.com/sourcegraph/sourcegraph/internal/codeintel/autoindexing/shared"
	"github.com/sourcegraph/sourcegraph/internal/observation"
)

type Service struct {
	uploadSvc  shared.UploadService
	operations *operations
	logger     log.Logger
}

func newService(
	uploadSvc shared.UploadService,
	observationContext *observation.Context,
) *Service {
	return &Service{
		uploadSvc:  uploadSvc,
		operations: newOperations(observationContext),
		logger:     observationContext.Logger,
	}
}

func (s *Service) GetRepoRank(ctx context.Context, repoName api.RepoName) (_ float64, err error) {
	ctx, _, endObservation := s.operations.getRepoRank.With(ctx, &err, observation.Args{})
	defer endObservation(1, observation.Args{})

	// TODO
	return 0, errors.New("GetRepoRank unimplemented")
}

func (s *Service) IndexRepositories(ctx context.Context) (err error) {
	ctx, _, endObservation := s.operations.indexRepositories.With(ctx, &err, observation.Args{})
	defer endObservation(1, observation.Args{})

	// TODO
	return errors.New("IndexRepositories unimplemented")
}
