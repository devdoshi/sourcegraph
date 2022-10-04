package codeintel

import (
	"github.com/sourcegraph/sourcegraph/internal/codeintel/autoindexing"
	"github.com/sourcegraph/sourcegraph/internal/codeintel/codenav"
	"github.com/sourcegraph/sourcegraph/internal/codeintel/dependencies"
	"github.com/sourcegraph/sourcegraph/internal/codeintel/policies"
	"github.com/sourcegraph/sourcegraph/internal/codeintel/stores/gitserver"
	"github.com/sourcegraph/sourcegraph/internal/codeintel/stores/repoupdater"
	"github.com/sourcegraph/sourcegraph/internal/codeintel/uploads"
	"github.com/sourcegraph/sourcegraph/internal/database"
	"github.com/sourcegraph/sourcegraph/internal/observation"
)

type Services struct {
	AutoIndexingService *autoindexing.Service
	CodenavService      *codenav.Service
	DependenciesService *dependencies.Service
	PoliciesService     *policies.Service
	UploadsService      *uploads.Service
}

// TODO - actually make observation context instead
func NewServices(db, codeIntelDB database.DB, observationContext *observation.Context) *Services {
	gitserverClient := gitserver.New(db, observationContext)
	repoUpdaterClient := repoupdater.New(observationContext)
	uploadsSvc := uploads.GetService(db, codeIntelDB, gitserverClient)
	autoIndexingSvc := autoindexing.GetService(db, uploadsSvc, gitserverClient, repoUpdaterClient)
	codenavSvc := codenav.GetService(db, codeIntelDB, uploadsSvc, gitserverClient)
	dependenciesSvc := dependencies.GetService(db)
	policiesSvc := policies.GetService(db, uploadsSvc, gitserverClient)

	return &Services{
		AutoIndexingService: autoIndexingSvc,
		CodenavService:      codenavSvc,
		DependenciesService: dependenciesSvc,
		PoliciesService:     policiesSvc,
		UploadsService:      uploadsSvc,
	}
}
