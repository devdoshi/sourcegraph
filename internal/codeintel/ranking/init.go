package ranking

import (
	"sync"

	"github.com/prometheus/client_golang/prometheus"
	"go.opentelemetry.io/otel"

	"github.com/sourcegraph/log"

	"github.com/sourcegraph/sourcegraph/internal/codeintel/uploads"
	"github.com/sourcegraph/sourcegraph/internal/observation"
	"github.com/sourcegraph/sourcegraph/internal/trace"
)

var (
	svc     *Service
	svcOnce sync.Once
)

// GetService creates or returns an already-initialized ranking service.
// If the service is not yet initialized, it will use the provided dependencies.
func GetService(uploadSvc *uploads.Service) *Service {
	svcOnce.Do(func() {
		oc := func(name string) *observation.Context {
			return &observation.Context{
				Logger:     log.Scoped("ranking."+name, "ranking "+name),
				Tracer:     &trace.Tracer{TracerProvider: otel.GetTracerProvider()},
				Registerer: prometheus.DefaultRegisterer,
			}
		}

		svc = newService(uploadSvc, oc("service"))
	})

	return svc
}
