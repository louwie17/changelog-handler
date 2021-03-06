#!/bin/sh

if ! [ -x "$(command -v hub)" ]; then
  echo 'Github hub is not installed. Install from https://github.com/github/hub' >&2
  exit 1
fi

echo "Version you want to release?"
read -r VERSION

CURRENTBRANCH="$(git rev-parse --abbrev-ref HEAD)"

if [ ! -d "build" ]; then
	echo "Build directory not found. Aborting."
	exit 1
fi

# Create a release branch.
BRANCH="${VERSION}"
git checkout -b $BRANCH

# Force add build directory and commit.
git add build/. --force
git add .
git commit -m "Adding /build directory to release" --no-verify

git push origin $BRANCH

# Create the new release.
hub release create -m $VERSION -m "Release of version $VERSION." -t $BRANCH "v${VERSION}"

git checkout $CURRENTBRANCH
git branch -D $BRANCH
git push origin --delete $BRANCH

echo "GitHub release complete."
