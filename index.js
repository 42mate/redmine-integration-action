const core = require("@actions/core");
const github = require("@actions/github");
const utils = require("./utils.js");

/**
 * Main function that executes the workflow of handling the PR action.
 * @returns {Promise<void>} A promise that resolves when the workflow completes.
 */
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
    const issueNumbers = await utils.parseRedmineIssues(pr.data.body, hostname);
    const percentageDone = await utils.parsePercentageDone(pr.data.body);
    console.log(pr);

    for (const number of issueNumbers) {
      const res = await utils.put({
        hostname: hostname,
        number: number,
        action: action,
        merged: merged,
        pr: pr,
        percentage: percentageDone,
      });
      if (res.status != 204) {
        throw new Error(res.json());
      }
    }
  } catch (error) {
    console.error("error: " + error);
    process.exitCode = 1;
  }
}

run();
