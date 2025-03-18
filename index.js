const helper = require("./helper.js");
const fetch = require("node-fetch");
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

function getCloseMessage(merged, pr) {
  if (merged) {
    return mergePRBody(pr);
  }
  return closePRBody(pr);
}

function getBody(action, merged, pr) {
  switch (action) {
    case "opened":
      return newPRBody(pr);
    case "closed":
      return getCloseMessage(merged, pr);
  }
}

async function parseRedmineIssues(prdata, redmine_host) {
  const regexp = new RegExp(".*" + redmine_host + "/issues/(\\d+).*", "g");
  const issues = [];

  let result;
  while ((result = regexp.exec(prdata)) !== null) {
    issues.push(parseInt(result[1]));
  }

  return issues;
}

async function put(options) {
  const { hostname, number, action, merged, pr } = options;
  return await fetch(`${hostname}/issues/${number}.json`, {
    method: "PUT",
    headers: {
      "X-redmine-api-key": core.getInput("REDMINE_APIKEY"),
      "Content-type": "application/json",
    },
    body: JSON.stringify(getBody(action, merged, pr)),
  });
}

async function run() {
  try {
    const context = github.context;
    const action = context.payload.action;
    const octokit = github.getOctokit(core.getInput("token"));
    const hostname = core.getInput("REDMINE_HOST");
    const pr = await octokit.rest.pulls.get({
      owner: context.repo.owner,
      repo: context.repo.repo,
      pull_number: context.payload.pull_request.number,
    });

    const merged = context.payload.pull_request?.merged;
    const issueNumbers = await parseRedmineIssues(pr.data.body, hostname);

    const promises = issueNumbers.map((number) =>
      put({
        hostname: hostname,
        number: number,
        action: action,
        merged: merged,
        pr: pr,
      }),
    );

    await Promise.all(promises);
  } catch (error) {
    console.error("error: " + error);
    process.exitCode = 1;
  }
}

run();
