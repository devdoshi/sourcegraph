#!/usr/bin/env bash
(
  BUILDEVENT_APIKEY="$$CI_BUILDEVENT_API_KEY"
  BUILDEVENT_DATASET="buildkite"
  export BUILDEVENT_APIKEY
  export BUILDEVENT_DATASET
  args=$@

  tracedCommand=$(printf './buildevents cmd $BUILDKITE_BUILD_ID $BUILDKITE_STEP_ID "%s"' "$args")
  set -x
  $tracedCommand -- $args
)
