package executor

import (
	"time"

	"github.com/sourcegraph/sourcegraph/internal/workerutil"
)

// Job describes a series of steps to perform within an executor.
type Job struct {
	// ID is the unique identifier of a job within the source queue. Note
	// that different queues can share identifiers.
	ID int `json:"id"`

	// RepositoryName is the name of the repository to be cloned into the
	// workspace prior to job execution.
	RepositoryName string `json:"repositoryName"`

	// RepositoryDirectory is the relative path to which the repo is cloned. If
	// unset, defaults to the workspace root.
	RepositoryDirectory string `json:"repositoryDirectory"`

	// Commit is the revhash that should be checked out prior to job execution.
	Commit string `json:"commit"`

	// FetchTags, when true also fetches tags from the remote.
	FetchTags bool `json:"fetchTags"`

	// ShallowClone, when true speeds up repo cloning by fetching only the target commit
	// and no tags.
	ShallowClone bool `json:"shallowClone"`

	// SparseCheckout denotes the path patterns to check out. This can be used to fetch
	// only a part of a repository.
	SparseCheckout []string `json:"sparseCheckout"`

	// VirtualMachineFiles is a map from file names to content. Each entry in
	// this map will be written into the workspace prior to job execution.
	// The file paths must be relative and within the working directory.
	VirtualMachineFiles map[string]VirtualMachineFile `json:"files"`

	// DockerSteps describe a series of docker run commands to be invoked in the
	// workspace. This may be done inside or outside of a Firecracker virtual
	// machine.
	DockerSteps []DockerStep `json:"dockerSteps"`

	// CliSteps describe a series of src commands to be invoked in the workspace.
	// These run after all docker commands have been completed successfully. This
	// may be done inside or outside of a Firecracker virtual machine.
	CliSteps []CliStep `json:"cliSteps"`

	// RedactedValues is a map from strings to replace to their replacement in the command
	// output before sending it to the underlying job store. This should contain all worker
	// environment variables, as well as secret values passed along with the dequeued job
	// payload, which may be sensitive (e.g. shared API tokens, URLs with credentials).
	RedactedValues map[string]string `json:"redactedValues"`
}

// VirtualMachineFile is a file that will be written to the VM. A file can contain the raw content of the file or
// specify the coordinates of the file in the file store.
// A file must either contain Content or a Bucket/Key. If neither are provided, an empty file is written.
type VirtualMachineFile struct {
	// Content is the raw content of the file. If not provided, the file is retrieved from the file store based on the
	// configured Bucket and Key. If Content, Bucket, and Key are not provided, an empty file will be written.
	Content string `json:"content,omitempty"`

	// Bucket is the bucket in the files store the file belongs to. A Key must also be configured.
	Bucket string `json:"bucket,omitempty"`

	// Key the key or coordinates of the files in the Bucket. The Bucket must be configured.
	Key string `json:"key,omitempty"`

	// ModifiedAt an optional field that specifies when the file was last modified.
	ModifiedAt time.Time `json:"modifiedAt,omitempty"`
}

func (j Job) RecordID() int {
	return j.ID
}

type DockerStep struct {
	// Image specifies the docker image.
	Image string `json:"image"`

	// Commands specifies the arguments supplied to the end of a docker run command.
	Commands []string `json:"commands"`

	// Dir specifies the target working directory.
	Dir string `json:"dir"`

	// Env specifies a set of NAME=value pairs to supply to the docker command.
	Env []string `json:"env"`
}

type CliStep struct {
	// Commands specifies the arguments supplied to the src command.
	Commands []string `json:"command"`

	// Dir specifies the target working directory.
	Dir string `json:"dir"`

	// Env specifies a set of NAME=value pairs to supply to the src command.
	Env []string `json:"env"`
}

type DequeueRequest struct {
	ExecutorName string `json:"executorName"`
}

type AddExecutionLogEntryRequest struct {
	ExecutorName string `json:"executorName"`
	JobID        int    `json:"jobId"`
	workerutil.ExecutionLogEntry
}

type UpdateExecutionLogEntryRequest struct {
	ExecutorName string `json:"executorName"`
	JobID        int    `json:"jobId"`
	EntryID      int    `json:"entryId"`
	workerutil.ExecutionLogEntry
}

type MarkCompleteRequest struct {
	ExecutorName string `json:"executorName"`
	JobID        int    `json:"jobId"`
}

type MarkErroredRequest struct {
	ExecutorName string `json:"executorName"`
	JobID        int    `json:"jobId"`
	ErrorMessage string `json:"errorMessage"`
}

type HeartbeatRequest struct {
	ExecutorName string `json:"executorName"`
	JobIDs       []int  `json:"jobIds"`

	// Telemetry data.

	OS              string `json:"os"`
	Architecture    string `json:"architecture"`
	DockerVersion   string `json:"dockerVersion"`
	ExecutorVersion string `json:"executorVersion"`
	GitVersion      string `json:"gitVersion"`
	IgniteVersion   string `json:"igniteVersion"`
	SrcCliVersion   string `json:"srcCliVersion"`

	PrometheusMetrics string `json:"prometheusMetrics"`
}

type CanceledJobsRequest struct {
	KnownJobIDs  []int  `json:"knownJobIds"`
	ExecutorName string `json:"executorName"`
}
