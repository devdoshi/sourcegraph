// Code generated by go-mockgen 1.3.4; DO NOT EDIT.
//
// This file was generated by running `sg generate` (or `go-mockgen`) at the root of
// this repository. To add additional mocks to this or another package, add a new entry
// to the mockgen.yaml file in the root of this repository.

package mocks

import (
	"sync"

	resolvers "github.com/sourcegraph/sourcegraph/enterprise/cmd/frontend/internal/codeintel/resolvers"
	graphql "github.com/sourcegraph/sourcegraph/internal/services/executors/transport/graphql"
)

// MockResolver is a mock implementation of the Resolver interface (from the
// package
// github.com/sourcegraph/sourcegraph/enterprise/cmd/frontend/internal/codeintel/resolvers)
// used for unit testing.
type MockResolver struct {
	// AutoIndexingResolverFunc is an instance of a mock function object
	// controlling the behavior of the method AutoIndexingResolver.
	AutoIndexingResolverFunc *ResolverAutoIndexingResolverFunc
	// CodeNavResolverFunc is an instance of a mock function object
	// controlling the behavior of the method CodeNavResolver.
	CodeNavResolverFunc *ResolverCodeNavResolverFunc
	// ExecutorResolverFunc is an instance of a mock function object
	// controlling the behavior of the method ExecutorResolver.
	ExecutorResolverFunc *ResolverExecutorResolverFunc
	// PoliciesResolverFunc is an instance of a mock function object
	// controlling the behavior of the method PoliciesResolver.
	PoliciesResolverFunc *ResolverPoliciesResolverFunc
	// UploadsResolverFunc is an instance of a mock function object
	// controlling the behavior of the method UploadsResolver.
	UploadsResolverFunc *ResolverUploadsResolverFunc
}

// NewMockResolver creates a new mock of the Resolver interface. All methods
// return zero values for all results, unless overwritten.
func NewMockResolver() *MockResolver {
	return &MockResolver{
		AutoIndexingResolverFunc: &ResolverAutoIndexingResolverFunc{
			defaultHook: func() (r0 resolvers.AutoIndexingResolver) {
				return
			},
		},
		CodeNavResolverFunc: &ResolverCodeNavResolverFunc{
			defaultHook: func() (r0 resolvers.CodeNavResolver) {
				return
			},
		},
		ExecutorResolverFunc: &ResolverExecutorResolverFunc{
			defaultHook: func() (r0 graphql.Resolver) {
				return
			},
		},
		PoliciesResolverFunc: &ResolverPoliciesResolverFunc{
			defaultHook: func() (r0 resolvers.PoliciesResolver) {
				return
			},
		},
		UploadsResolverFunc: &ResolverUploadsResolverFunc{
			defaultHook: func() (r0 resolvers.UploadsResolver) {
				return
			},
		},
	}
}

// NewStrictMockResolver creates a new mock of the Resolver interface. All
// methods panic on invocation, unless overwritten.
func NewStrictMockResolver() *MockResolver {
	return &MockResolver{
		AutoIndexingResolverFunc: &ResolverAutoIndexingResolverFunc{
			defaultHook: func() resolvers.AutoIndexingResolver {
				panic("unexpected invocation of MockResolver.AutoIndexingResolver")
			},
		},
		CodeNavResolverFunc: &ResolverCodeNavResolverFunc{
			defaultHook: func() resolvers.CodeNavResolver {
				panic("unexpected invocation of MockResolver.CodeNavResolver")
			},
		},
		ExecutorResolverFunc: &ResolverExecutorResolverFunc{
			defaultHook: func() graphql.Resolver {
				panic("unexpected invocation of MockResolver.ExecutorResolver")
			},
		},
		PoliciesResolverFunc: &ResolverPoliciesResolverFunc{
			defaultHook: func() resolvers.PoliciesResolver {
				panic("unexpected invocation of MockResolver.PoliciesResolver")
			},
		},
		UploadsResolverFunc: &ResolverUploadsResolverFunc{
			defaultHook: func() resolvers.UploadsResolver {
				panic("unexpected invocation of MockResolver.UploadsResolver")
			},
		},
	}
}

// NewMockResolverFrom creates a new mock of the MockResolver interface. All
// methods delegate to the given implementation, unless overwritten.
func NewMockResolverFrom(i resolvers.Resolver) *MockResolver {
	return &MockResolver{
		AutoIndexingResolverFunc: &ResolverAutoIndexingResolverFunc{
			defaultHook: i.AutoIndexingResolver,
		},
		CodeNavResolverFunc: &ResolverCodeNavResolverFunc{
			defaultHook: i.CodeNavResolver,
		},
		ExecutorResolverFunc: &ResolverExecutorResolverFunc{
			defaultHook: i.ExecutorResolver,
		},
		PoliciesResolverFunc: &ResolverPoliciesResolverFunc{
			defaultHook: i.PoliciesResolver,
		},
		UploadsResolverFunc: &ResolverUploadsResolverFunc{
			defaultHook: i.UploadsResolver,
		},
	}
}

// ResolverAutoIndexingResolverFunc describes the behavior when the
// AutoIndexingResolver method of the parent MockResolver instance is
// invoked.
type ResolverAutoIndexingResolverFunc struct {
	defaultHook func() resolvers.AutoIndexingResolver
	hooks       []func() resolvers.AutoIndexingResolver
	history     []ResolverAutoIndexingResolverFuncCall
	mutex       sync.Mutex
}

// AutoIndexingResolver delegates to the next hook function in the queue and
// stores the parameter and result values of this invocation.
func (m *MockResolver) AutoIndexingResolver() resolvers.AutoIndexingResolver {
	r0 := m.AutoIndexingResolverFunc.nextHook()()
	m.AutoIndexingResolverFunc.appendCall(ResolverAutoIndexingResolverFuncCall{r0})
	return r0
}

// SetDefaultHook sets function that is called when the AutoIndexingResolver
// method of the parent MockResolver instance is invoked and the hook queue
// is empty.
func (f *ResolverAutoIndexingResolverFunc) SetDefaultHook(hook func() resolvers.AutoIndexingResolver) {
	f.defaultHook = hook
}

// PushHook adds a function to the end of hook queue. Each invocation of the
// AutoIndexingResolver method of the parent MockResolver instance invokes
// the hook at the front of the queue and discards it. After the queue is
// empty, the default hook function is invoked for any future action.
func (f *ResolverAutoIndexingResolverFunc) PushHook(hook func() resolvers.AutoIndexingResolver) {
	f.mutex.Lock()
	f.hooks = append(f.hooks, hook)
	f.mutex.Unlock()
}

// SetDefaultReturn calls SetDefaultHook with a function that returns the
// given values.
func (f *ResolverAutoIndexingResolverFunc) SetDefaultReturn(r0 resolvers.AutoIndexingResolver) {
	f.SetDefaultHook(func() resolvers.AutoIndexingResolver {
		return r0
	})
}

// PushReturn calls PushHook with a function that returns the given values.
func (f *ResolverAutoIndexingResolverFunc) PushReturn(r0 resolvers.AutoIndexingResolver) {
	f.PushHook(func() resolvers.AutoIndexingResolver {
		return r0
	})
}

func (f *ResolverAutoIndexingResolverFunc) nextHook() func() resolvers.AutoIndexingResolver {
	f.mutex.Lock()
	defer f.mutex.Unlock()

	if len(f.hooks) == 0 {
		return f.defaultHook
	}

	hook := f.hooks[0]
	f.hooks = f.hooks[1:]
	return hook
}

func (f *ResolverAutoIndexingResolverFunc) appendCall(r0 ResolverAutoIndexingResolverFuncCall) {
	f.mutex.Lock()
	f.history = append(f.history, r0)
	f.mutex.Unlock()
}

// History returns a sequence of ResolverAutoIndexingResolverFuncCall
// objects describing the invocations of this function.
func (f *ResolverAutoIndexingResolverFunc) History() []ResolverAutoIndexingResolverFuncCall {
	f.mutex.Lock()
	history := make([]ResolverAutoIndexingResolverFuncCall, len(f.history))
	copy(history, f.history)
	f.mutex.Unlock()

	return history
}

// ResolverAutoIndexingResolverFuncCall is an object that describes an
// invocation of method AutoIndexingResolver on an instance of MockResolver.
type ResolverAutoIndexingResolverFuncCall struct {
	// Result0 is the value of the 1st result returned from this method
	// invocation.
	Result0 resolvers.AutoIndexingResolver
}

// Args returns an interface slice containing the arguments of this
// invocation.
func (c ResolverAutoIndexingResolverFuncCall) Args() []interface{} {
	return []interface{}{}
}

// Results returns an interface slice containing the results of this
// invocation.
func (c ResolverAutoIndexingResolverFuncCall) Results() []interface{} {
	return []interface{}{c.Result0}
}

// ResolverCodeNavResolverFunc describes the behavior when the
// CodeNavResolver method of the parent MockResolver instance is invoked.
type ResolverCodeNavResolverFunc struct {
	defaultHook func() resolvers.CodeNavResolver
	hooks       []func() resolvers.CodeNavResolver
	history     []ResolverCodeNavResolverFuncCall
	mutex       sync.Mutex
}

// CodeNavResolver delegates to the next hook function in the queue and
// stores the parameter and result values of this invocation.
func (m *MockResolver) CodeNavResolver() resolvers.CodeNavResolver {
	r0 := m.CodeNavResolverFunc.nextHook()()
	m.CodeNavResolverFunc.appendCall(ResolverCodeNavResolverFuncCall{r0})
	return r0
}

// SetDefaultHook sets function that is called when the CodeNavResolver
// method of the parent MockResolver instance is invoked and the hook queue
// is empty.
func (f *ResolverCodeNavResolverFunc) SetDefaultHook(hook func() resolvers.CodeNavResolver) {
	f.defaultHook = hook
}

// PushHook adds a function to the end of hook queue. Each invocation of the
// CodeNavResolver method of the parent MockResolver instance invokes the
// hook at the front of the queue and discards it. After the queue is empty,
// the default hook function is invoked for any future action.
func (f *ResolverCodeNavResolverFunc) PushHook(hook func() resolvers.CodeNavResolver) {
	f.mutex.Lock()
	f.hooks = append(f.hooks, hook)
	f.mutex.Unlock()
}

// SetDefaultReturn calls SetDefaultHook with a function that returns the
// given values.
func (f *ResolverCodeNavResolverFunc) SetDefaultReturn(r0 resolvers.CodeNavResolver) {
	f.SetDefaultHook(func() resolvers.CodeNavResolver {
		return r0
	})
}

// PushReturn calls PushHook with a function that returns the given values.
func (f *ResolverCodeNavResolverFunc) PushReturn(r0 resolvers.CodeNavResolver) {
	f.PushHook(func() resolvers.CodeNavResolver {
		return r0
	})
}

func (f *ResolverCodeNavResolverFunc) nextHook() func() resolvers.CodeNavResolver {
	f.mutex.Lock()
	defer f.mutex.Unlock()

	if len(f.hooks) == 0 {
		return f.defaultHook
	}

	hook := f.hooks[0]
	f.hooks = f.hooks[1:]
	return hook
}

func (f *ResolverCodeNavResolverFunc) appendCall(r0 ResolverCodeNavResolverFuncCall) {
	f.mutex.Lock()
	f.history = append(f.history, r0)
	f.mutex.Unlock()
}

// History returns a sequence of ResolverCodeNavResolverFuncCall objects
// describing the invocations of this function.
func (f *ResolverCodeNavResolverFunc) History() []ResolverCodeNavResolverFuncCall {
	f.mutex.Lock()
	history := make([]ResolverCodeNavResolverFuncCall, len(f.history))
	copy(history, f.history)
	f.mutex.Unlock()

	return history
}

// ResolverCodeNavResolverFuncCall is an object that describes an invocation
// of method CodeNavResolver on an instance of MockResolver.
type ResolverCodeNavResolverFuncCall struct {
	// Result0 is the value of the 1st result returned from this method
	// invocation.
	Result0 resolvers.CodeNavResolver
}

// Args returns an interface slice containing the arguments of this
// invocation.
func (c ResolverCodeNavResolverFuncCall) Args() []interface{} {
	return []interface{}{}
}

// Results returns an interface slice containing the results of this
// invocation.
func (c ResolverCodeNavResolverFuncCall) Results() []interface{} {
	return []interface{}{c.Result0}
}

// ResolverExecutorResolverFunc describes the behavior when the
// ExecutorResolver method of the parent MockResolver instance is invoked.
type ResolverExecutorResolverFunc struct {
	defaultHook func() graphql.Resolver
	hooks       []func() graphql.Resolver
	history     []ResolverExecutorResolverFuncCall
	mutex       sync.Mutex
}

// ExecutorResolver delegates to the next hook function in the queue and
// stores the parameter and result values of this invocation.
func (m *MockResolver) ExecutorResolver() graphql.Resolver {
	r0 := m.ExecutorResolverFunc.nextHook()()
	m.ExecutorResolverFunc.appendCall(ResolverExecutorResolverFuncCall{r0})
	return r0
}

// SetDefaultHook sets function that is called when the ExecutorResolver
// method of the parent MockResolver instance is invoked and the hook queue
// is empty.
func (f *ResolverExecutorResolverFunc) SetDefaultHook(hook func() graphql.Resolver) {
	f.defaultHook = hook
}

// PushHook adds a function to the end of hook queue. Each invocation of the
// ExecutorResolver method of the parent MockResolver instance invokes the
// hook at the front of the queue and discards it. After the queue is empty,
// the default hook function is invoked for any future action.
func (f *ResolverExecutorResolverFunc) PushHook(hook func() graphql.Resolver) {
	f.mutex.Lock()
	f.hooks = append(f.hooks, hook)
	f.mutex.Unlock()
}

// SetDefaultReturn calls SetDefaultHook with a function that returns the
// given values.
func (f *ResolverExecutorResolverFunc) SetDefaultReturn(r0 graphql.Resolver) {
	f.SetDefaultHook(func() graphql.Resolver {
		return r0
	})
}

// PushReturn calls PushHook with a function that returns the given values.
func (f *ResolverExecutorResolverFunc) PushReturn(r0 graphql.Resolver) {
	f.PushHook(func() graphql.Resolver {
		return r0
	})
}

func (f *ResolverExecutorResolverFunc) nextHook() func() graphql.Resolver {
	f.mutex.Lock()
	defer f.mutex.Unlock()

	if len(f.hooks) == 0 {
		return f.defaultHook
	}

	hook := f.hooks[0]
	f.hooks = f.hooks[1:]
	return hook
}

func (f *ResolverExecutorResolverFunc) appendCall(r0 ResolverExecutorResolverFuncCall) {
	f.mutex.Lock()
	f.history = append(f.history, r0)
	f.mutex.Unlock()
}

// History returns a sequence of ResolverExecutorResolverFuncCall objects
// describing the invocations of this function.
func (f *ResolverExecutorResolverFunc) History() []ResolverExecutorResolverFuncCall {
	f.mutex.Lock()
	history := make([]ResolverExecutorResolverFuncCall, len(f.history))
	copy(history, f.history)
	f.mutex.Unlock()

	return history
}

// ResolverExecutorResolverFuncCall is an object that describes an
// invocation of method ExecutorResolver on an instance of MockResolver.
type ResolverExecutorResolverFuncCall struct {
	// Result0 is the value of the 1st result returned from this method
	// invocation.
	Result0 graphql.Resolver
}

// Args returns an interface slice containing the arguments of this
// invocation.
func (c ResolverExecutorResolverFuncCall) Args() []interface{} {
	return []interface{}{}
}

// Results returns an interface slice containing the results of this
// invocation.
func (c ResolverExecutorResolverFuncCall) Results() []interface{} {
	return []interface{}{c.Result0}
}

// ResolverPoliciesResolverFunc describes the behavior when the
// PoliciesResolver method of the parent MockResolver instance is invoked.
type ResolverPoliciesResolverFunc struct {
	defaultHook func() resolvers.PoliciesResolver
	hooks       []func() resolvers.PoliciesResolver
	history     []ResolverPoliciesResolverFuncCall
	mutex       sync.Mutex
}

// PoliciesResolver delegates to the next hook function in the queue and
// stores the parameter and result values of this invocation.
func (m *MockResolver) PoliciesResolver() resolvers.PoliciesResolver {
	r0 := m.PoliciesResolverFunc.nextHook()()
	m.PoliciesResolverFunc.appendCall(ResolverPoliciesResolverFuncCall{r0})
	return r0
}

// SetDefaultHook sets function that is called when the PoliciesResolver
// method of the parent MockResolver instance is invoked and the hook queue
// is empty.
func (f *ResolverPoliciesResolverFunc) SetDefaultHook(hook func() resolvers.PoliciesResolver) {
	f.defaultHook = hook
}

// PushHook adds a function to the end of hook queue. Each invocation of the
// PoliciesResolver method of the parent MockResolver instance invokes the
// hook at the front of the queue and discards it. After the queue is empty,
// the default hook function is invoked for any future action.
func (f *ResolverPoliciesResolverFunc) PushHook(hook func() resolvers.PoliciesResolver) {
	f.mutex.Lock()
	f.hooks = append(f.hooks, hook)
	f.mutex.Unlock()
}

// SetDefaultReturn calls SetDefaultHook with a function that returns the
// given values.
func (f *ResolverPoliciesResolverFunc) SetDefaultReturn(r0 resolvers.PoliciesResolver) {
	f.SetDefaultHook(func() resolvers.PoliciesResolver {
		return r0
	})
}

// PushReturn calls PushHook with a function that returns the given values.
func (f *ResolverPoliciesResolverFunc) PushReturn(r0 resolvers.PoliciesResolver) {
	f.PushHook(func() resolvers.PoliciesResolver {
		return r0
	})
}

func (f *ResolverPoliciesResolverFunc) nextHook() func() resolvers.PoliciesResolver {
	f.mutex.Lock()
	defer f.mutex.Unlock()

	if len(f.hooks) == 0 {
		return f.defaultHook
	}

	hook := f.hooks[0]
	f.hooks = f.hooks[1:]
	return hook
}

func (f *ResolverPoliciesResolverFunc) appendCall(r0 ResolverPoliciesResolverFuncCall) {
	f.mutex.Lock()
	f.history = append(f.history, r0)
	f.mutex.Unlock()
}

// History returns a sequence of ResolverPoliciesResolverFuncCall objects
// describing the invocations of this function.
func (f *ResolverPoliciesResolverFunc) History() []ResolverPoliciesResolverFuncCall {
	f.mutex.Lock()
	history := make([]ResolverPoliciesResolverFuncCall, len(f.history))
	copy(history, f.history)
	f.mutex.Unlock()

	return history
}

// ResolverPoliciesResolverFuncCall is an object that describes an
// invocation of method PoliciesResolver on an instance of MockResolver.
type ResolverPoliciesResolverFuncCall struct {
	// Result0 is the value of the 1st result returned from this method
	// invocation.
	Result0 resolvers.PoliciesResolver
}

// Args returns an interface slice containing the arguments of this
// invocation.
func (c ResolverPoliciesResolverFuncCall) Args() []interface{} {
	return []interface{}{}
}

// Results returns an interface slice containing the results of this
// invocation.
func (c ResolverPoliciesResolverFuncCall) Results() []interface{} {
	return []interface{}{c.Result0}
}

// ResolverUploadsResolverFunc describes the behavior when the
// UploadsResolver method of the parent MockResolver instance is invoked.
type ResolverUploadsResolverFunc struct {
	defaultHook func() resolvers.UploadsResolver
	hooks       []func() resolvers.UploadsResolver
	history     []ResolverUploadsResolverFuncCall
	mutex       sync.Mutex
}

// UploadsResolver delegates to the next hook function in the queue and
// stores the parameter and result values of this invocation.
func (m *MockResolver) UploadsResolver() resolvers.UploadsResolver {
	r0 := m.UploadsResolverFunc.nextHook()()
	m.UploadsResolverFunc.appendCall(ResolverUploadsResolverFuncCall{r0})
	return r0
}

// SetDefaultHook sets function that is called when the UploadsResolver
// method of the parent MockResolver instance is invoked and the hook queue
// is empty.
func (f *ResolverUploadsResolverFunc) SetDefaultHook(hook func() resolvers.UploadsResolver) {
	f.defaultHook = hook
}

// PushHook adds a function to the end of hook queue. Each invocation of the
// UploadsResolver method of the parent MockResolver instance invokes the
// hook at the front of the queue and discards it. After the queue is empty,
// the default hook function is invoked for any future action.
func (f *ResolverUploadsResolverFunc) PushHook(hook func() resolvers.UploadsResolver) {
	f.mutex.Lock()
	f.hooks = append(f.hooks, hook)
	f.mutex.Unlock()
}

// SetDefaultReturn calls SetDefaultHook with a function that returns the
// given values.
func (f *ResolverUploadsResolverFunc) SetDefaultReturn(r0 resolvers.UploadsResolver) {
	f.SetDefaultHook(func() resolvers.UploadsResolver {
		return r0
	})
}

// PushReturn calls PushHook with a function that returns the given values.
func (f *ResolverUploadsResolverFunc) PushReturn(r0 resolvers.UploadsResolver) {
	f.PushHook(func() resolvers.UploadsResolver {
		return r0
	})
}

func (f *ResolverUploadsResolverFunc) nextHook() func() resolvers.UploadsResolver {
	f.mutex.Lock()
	defer f.mutex.Unlock()

	if len(f.hooks) == 0 {
		return f.defaultHook
	}

	hook := f.hooks[0]
	f.hooks = f.hooks[1:]
	return hook
}

func (f *ResolverUploadsResolverFunc) appendCall(r0 ResolverUploadsResolverFuncCall) {
	f.mutex.Lock()
	f.history = append(f.history, r0)
	f.mutex.Unlock()
}

// History returns a sequence of ResolverUploadsResolverFuncCall objects
// describing the invocations of this function.
func (f *ResolverUploadsResolverFunc) History() []ResolverUploadsResolverFuncCall {
	f.mutex.Lock()
	history := make([]ResolverUploadsResolverFuncCall, len(f.history))
	copy(history, f.history)
	f.mutex.Unlock()

	return history
}

// ResolverUploadsResolverFuncCall is an object that describes an invocation
// of method UploadsResolver on an instance of MockResolver.
type ResolverUploadsResolverFuncCall struct {
	// Result0 is the value of the 1st result returned from this method
	// invocation.
	Result0 resolvers.UploadsResolver
}

// Args returns an interface slice containing the arguments of this
// invocation.
func (c ResolverUploadsResolverFuncCall) Args() []interface{} {
	return []interface{}{}
}

// Results returns an interface slice containing the results of this
// invocation.
func (c ResolverUploadsResolverFuncCall) Results() []interface{} {
	return []interface{}{c.Result0}
}
