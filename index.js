const helper = require("./helper.js");

const core = require("@actions/core");
const github = require("@actions/github");

function newPRBody(pr) {
  return {
    issue: {
      notes: pr.data.body + "\n" + pr.url,
    },
  };
}

function closePRBody(pr) {
  return {
    issue: {
      notes: `PR CLOSED ${pr.url}`,
    },
  };
}

function mergePRBody(pr) {
  return {
    issue: {
      notes: `PR MERGED ${pr.url}`,
      status_id: 3,
    },
  };
}

function getBody(action, pr) {
  switch (action) {
    case "opened":
      return newPRBody(pr);
    case "merged":
      return mergePRBody(pr);
    case "closed":
      return closePRBody(pr);
  }
}

async function run() {
  try {
    const context = github.context;
    const action = context.payload.action;
    console.log(context.payload.reason);
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

    const res = await fetch(`${hostname}/issues/${issueNumber.pop()}.json`, {
      method: "PUT",
      headers: {
        "X-redmine-api-key": core.getInput("REDMINE_APIKEY"),
        "Content-type": "application/json",
      },
      body: JSON.stringify(getBody(action, pr)),
    });

    console.log(res.status);
  } catch (error) {
    console.error("error: " + error);
    process.exitCode = 1;
  }
}

run();
