# ruicsh/janitor-action

```yaml
name: janitor

on:
  workflow_dispatch:
  schedule:
    - cron: '0 3 * * *'

jobs:
  janitor:
    runs-on: ubuntu-latest
    steps:
      - uses: ruicsh/janitor-action@main
        with:
          orgs: <org1>,<org2>
          user: <user1>
          operations: <containers,packages,releases,tags,workflow-runs>
        env:
          GIT_PASSWORD: ${{ secrets.GIT_PASSWORD }}
          GIT_USER: ${{ secrets.GIT_USER }}
```
