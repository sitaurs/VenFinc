#!/bin/sh
set -eu
TASK_ROOT=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
if [ -x "$TASK_ROOT/.tools/node/bin/node" ]; then
  PATH="$TASK_ROOT/.tools/node/bin:$PATH"
  export PATH
fi
cd "$TASK_ROOT"
exec corepack pnpm "$@"
