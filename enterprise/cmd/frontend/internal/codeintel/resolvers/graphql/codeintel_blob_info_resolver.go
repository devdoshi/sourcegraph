package graphql

import (
	"context"

	"github.com/opentracing/opentracing-go/log"

	gql "github.com/sourcegraph/sourcegraph/cmd/frontend/graphqlbackend"
	"github.com/sourcegraph/sourcegraph/enterprise/cmd/frontend/internal/codeintel/resolvers"
	"github.com/sourcegraph/sourcegraph/internal/api"
	"github.com/sourcegraph/sourcegraph/internal/observation"
)

type codeIntelSupportResolver struct {
	repo      api.RepoName
	path      string
	resolver  resolvers.Resolver
	errTracer *observation.ErrCollector
}

// move to autoindexing service
func NewCodeIntelSupportResolver(resolver resolvers.Resolver, repoName api.RepoName, path string, errTracer *observation.ErrCollector) gql.GitBlobCodeIntelSupportResolver {
	return &codeIntelSupportResolver{
		repo:      repoName,
		path:      path,
		resolver:  resolver,
		errTracer: errTracer,
	}
}

func (r *codeIntelSupportResolver) SearchBasedSupport(ctx context.Context) (_ gql.SearchBasedSupportResolver, err error) {
	var (
		ctagsSupported bool
		language       string
	)

	defer func() {
		r.errTracer.Collect(&err,
			log.String("codeIntelSupportResolver.field", "searchBasedSupport"),
			log.String("inferedLanguage", language),
			log.Bool("ctagsSupported", ctagsSupported))
	}()

	// move to autoindexing service
	codeNavResolver := r.resolver.CodeNavResolver()
	ctagsSupported, language, err = codeNavResolver.GetSupportedByCtags(ctx, r.path, r.repo)
	if err != nil {
		return nil, err
	}

	if !ctagsSupported {
		return nil, nil
	}

	// move to autoindexing service
	return NewSearchBasedCodeIntelResolver(language), nil
}

// move to autoindexing service
func (r *codeIntelSupportResolver) PreciseSupport(ctx context.Context) (gql.PreciseSupportResolver, error) {
	return NewPreciseCodeIntelSupportResolver(r.path), nil
}
