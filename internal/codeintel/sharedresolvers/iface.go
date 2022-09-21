package sharedresolvers

import (
	"context"
	"time"

	"github.com/sourcegraph/sourcegraph/internal/api"
	autoindexingShared "github.com/sourcegraph/sourcegraph/internal/codeintel/autoindexing/shared"
	policy "github.com/sourcegraph/sourcegraph/internal/codeintel/policies/transport/graphql"
	"github.com/sourcegraph/sourcegraph/internal/codeintel/types"
	uploadsShared "github.com/sourcegraph/sourcegraph/internal/codeintel/uploads/shared"
	"github.com/sourcegraph/sourcegraph/internal/database"
	"github.com/sourcegraph/sourcegraph/internal/gitserver/gitdomain"
)

type AutoIndexingService interface {
	GetIndexes(ctx context.Context, opts types.GetIndexesOptions) (_ []types.Index, _ int, err error)
	GetIndexByID(ctx context.Context, id int) (_ types.Index, _ bool, err error)
	GetIndexesByIDs(ctx context.Context, ids ...int) (_ []types.Index, err error)
	GetUnsafeDB() database.DB
	GetListTags(ctx context.Context, repo api.RepoName, commitObjs ...string) (_ []*gitdomain.Tag, err error)
}

type UploadsService interface {
	GetUploads(ctx context.Context, opts types.GetUploadsOptions) (uploads []types.Upload, totalCount int, err error)
	GetAuditLogsForUpload(ctx context.Context, uploadID int) (_ []types.UploadLog, err error)
	GetListTags(ctx context.Context, repo api.RepoName, commitObjs ...string) (_ []*gitdomain.Tag, err error)
	GetUploadDocumentsForPath(ctx context.Context, bundleID int, pathPattern string) ([]string, int, error)
	GetUploadsByIDs(ctx context.Context, ids ...int) (_ []types.Upload, err error)
}

type PolicyResolver interface {
	PolicyResolverFactory(ctx context.Context) (_ policy.PolicyResolver, err error)
}

type RepositorySummary struct {
	RecentUploads           []uploadsShared.UploadsWithRepositoryNamespace
	RecentIndexes           []autoindexingShared.IndexesWithRepositoryNamespace
	LastUploadRetentionScan *time.Time
	LastIndexScan           *time.Time
}
