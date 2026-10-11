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

# Pack the current version locally for inspection; releases publish via GitHub Actions.
pack:
  mkdir -p release
  npm pack --pack-destination release
