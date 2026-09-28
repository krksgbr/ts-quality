set shell := ["bash", "-eu", "-o", "pipefail", "-c"]

# Standalone Oxlint rules package: build, test, smoke, and pack.

# Compile the plugins and presets into dist/.
build:
  npm run build

# Build and run the rule/preset test suite.
check:
  npm run check

# Build, pack, and exercise the tarball in a disposable consumer project.
smoke:
  npm run smoke:consumer

# Build, bump to <version>, and pack a versioned tarball into release/.
# Consumers pin release/krksgbr-oxlint-rules-<version>.tgz; bump on every change.
release version:
  #!/usr/bin/env bash
  set -euo pipefail
  npm pkg set version="{{version}}"
  npm run build
  mkdir -p release
  npm pack --pack-destination release
  echo "packed: release/krksgbr-oxlint-rules-{{version}}.tgz"
