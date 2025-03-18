const helper = require("./helper.js");

const core = require("@actions/core");
const github = require("@actions/github");

async function run() {
  try {
    const context = github.context;
    const octokit = github.getOctokit(core.getInput("token"));
    const hostname = core.getInput("REDMINE_HOST");
    const pr = await octokit.rest.pulls.get({
      owner: context.repo.owner,
      repo: context.repo.repo,
      pull_number: context.payload.pull_request.number,
    });

    const issueNumber = await helper.parse_redmine_issues(
      pr.data.body,
      hostname,
    );

    const params = {
      issue: {
        notes: pr.data.body + "\n" + pr.url,
      },
    };

    const res = await fetch(`${hostname}/issues/${issueNumber.pop()}.json`, {
      method: "PUT",
      headers: {
        "X-redmine-api-key": core.getInput("REDMINE_APIKEY"),
        "Content-type": "application/json",
      },
      body: JSON.stringify(params),
    });
  } catch (error) {
    console.error("error: " + error);
    process.exitCode = 1;
  }
}

run();
