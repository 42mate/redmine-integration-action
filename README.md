# Redmine Integration

## GitHub repos

### Description
We use GitHub Actions workflow for updating Redmine's `issue` resource with GitHub `pull_request` command, this action update targeted Redmine issue by adding `notes` with the first comment added to the GitHub pull request.

It is required to add in the PR comment the Redmine explicit http link. 
Example: `https://redmine.company.com/issues/id_of_issue`

You can also add `PERCENTAGE_DONE=percentage` (10, 20, 30...)  
This will trigger the update of the percentage on the redmine ticket.

The code uses `actions/github` and `actions/core` to access PR context to grab necessary data to pass it through Redmine `issues` notes. 
Also code listen for `opended`, `closed` or `reopended` status on your pull request.

The code interpolate PR context data and update Redmine issues resource with the following note added:

```
*PR CREATED*: ${pr.data.title} \n + pr.data.body + "\n" + pr.url,
```

Where 
- `pr.data.title`: is the PR title.
- `pr.data.body`: is the full PR 1st comment (Where we lookup for the Redmine issue link)
- `pr.url`: is the full reference url of the GitHub PR.

Note: We highly recommend to use a [github/pull_request_template](https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests/creating-a-pull-request-template-for-your-repository)

## Usage / Install

- Use the example files on .github/worflow folder, rename the file/s and add it into your project's `.github/workflows` folder.
- Add the proper permission on your github repository under `Settings->Actions->General->ActionsPermissions->Allow all actions and reusable workflows`

### Settings
- Enable your Redmine [REST API](https://www.redmine.org/projects/redmine/wiki/rest_api#Authentication).
- Register your Redmine api key as `REDMINE_API_KEY` in [GitHub secrets](https://docs.github.com/en/actions/reference/encrypted-secrets#creating-encrypted-secrets-for-a-repository).
- Register your Redmine URL as `REDMINE_HOST` in [GitHub secrets](https://docs.github.com/en/actions/reference/encrypted-secrets#creating-encrypted-secrets-for-a-repository).

Note: Be sure that your `REDMINE_HOST` contains protocol such as `https://redmine.company.com`.

### How to test the integration with Redmine

- Update the test.js
- `npm i`
- node test.js


### To build

```
npm run build
git add index.js dist
git commit -m 'wathever'
git push
```

### To test changes on the action:

- Create a new branch
- Update the action on the repository that's using it to use 42mate/redmine-integration-action@branch
