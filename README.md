# Changelog Handler

Handles changelog entries by storing them as seperate files within a changelog folder for each pull request.

## Installation

## Usage

### Creating a changelog entry

`npx changelog "description of change" -m 1000 -t bug`

### Creating a release

`npx release -v 1.0.0`

This updates the **CHANGELOG.md** file with the unreleased changelogs.
This also deletes the changelog entries.