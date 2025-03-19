const core = require("@actions/core");
const github = require("@actions/github");
const utils = require("./utils.js");

/**
 * Main function that executes the workflow of handling the PR action.
 * @returns {Promise<void>} A promise that resolves when the workflow completes.
 */
async function run() {
  try {
    console.log("WAL1");
    const context = github.context;
    console.log("WA2");
    const action = context.payload.action;
    console.log("WAL3");
    const octokit = github.getOctokit(core.getInput("token"));
    console.log("WAL4");
    const hostname = core.getInput("REDMINE_HOST");
    console.log("WAL");
    const pr = await octokit.rest.pulls.get({
      owner: context.repo.owner,
      repo: context.repo.repo,
      pull_number: context.payload.pull_request.number,
    });
    console.log(pr);

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
	apiKey: core.getInput("REDMINE_APIKEY"),
      });
      if (res.status != 204) {
        throw new Error(res.body);
      }
    }
  } catch (error) {
    console.error("error: " + error);
    process.exitCode = 1;
  }
}

run();
