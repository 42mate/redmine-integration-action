const core = require("@actions/core");
const github = require("@actions/github");

/**
 * Constructs the body of the new PR issue.
 * @param {Object} pr - The pull request data.
 * @returns {Object} The issue body containing PR notes and URL.
 */
function newPRBody(pr) {
  console.log("MIRA LAO PR", pr);
  return {
    issue: {
      notes: `PR CREATED ${pr.data.html_url} \n ${pr.data.body}`,
    },
  };
}

/**
 * Constructs the body of the closed PR issue.
 * @param {Object} pr - The pull request data.
 * @returns {Object} The issue body with PR closed message.
 */
function closePRBody(pr) {
  return {
    issue: {
      notes: `PR CLOSED [${pr.data.title}](${pr.data.html_url})`
    },
  };
}

/**
 * Constructs the body for a merged PR issue, including a progress percentage.
 * @param {Object} pr - The pull request data.
 * @param {number} percentage - The percentage of completion.
 * @returns {Object} The issue body with PR merged message and status.
 */
function mergePRBody(pr, percentage) {
  const body = {
    notes: `PR MERGED [${pr.data.title}](${pr.data.html_url})`,
    done_ratio: percentage,
  };
  if (percentage === 100) {
    return {
      issue: { ...body, status_id: 3 }, // Mark as 'completed' when 100%
    };
  }
  return {
    issue: body,
  };
}

/**
 * Determines the appropriate closing message for the PR based on whether it was merged or not.
 * @param {boolean} merged - Whether the PR was merged.
 * @param {Object} pr - The pull request data.
 * @param {number} percentage - The percentage of completion for the PR.
 * @returns {Object} The issue body with the appropriate close message.
 */
function getCloseMessage(merged, pr, percentage) {
  if (merged) {
    return mergePRBody(pr, percentage);
  }
  return closePRBody(pr);
}

/**
 * Constructs the body for the issue based on the PR action.
 * @param {string} action - The action performed on the PR (opened, closed, etc.).
 * @param {boolean} merged - Whether the PR was merged.
 * @param {Object} pr - The pull request data.
 * @param {number} percentage - The percentage of completion for the PR.
 * @returns {Object} The issue body.
 */
function getBody(action, merged, pr, percentage) {
  switch (action) {
    case "opened":
      return newPRBody(pr);
    case "closed":
      return getCloseMessage(merged, pr, percentage);
  }
}

/**
 * Parses the Redmine issue numbers mentioned in the PR body.
 * @param {string} prdata - The body content of the PR.
 * @param {string} redmine_host - The Redmine hostname.
 * @returns {Promise<number[]>} A promise that resolves to an array of issue numbers.
 */
async function parseRedmineIssues(prdata, redmine_host) {
  const regexp = new RegExp(".*" + redmine_host + "/issues/(\\d+).*", "g");
  const issues = [];

  let result;
  while ((result = regexp.exec(prdata)) !== null) {
    issues.push(parseInt(result[1]));
  }

  return issues;
}

/**
 * Parses the percentage of completion from the PR body.
 * @param {string} prdata - The body content of the PR.
 * @returns {Promise<number>} A promise that resolves to the percentage done.
 */
async function parsePercentageDone(prdata) {
  const regexp = new RegExp(".*PERCENTAGE_DONE=(\\d+).*", "g");
  const result = regexp.exec(prdata);
  if (result) {
      return parseInt(result[1]);
  }
  return 0

}

/**
 * Sends a PUT request to update the issue in Redmine.
 * @param {Object} options - The options for the PUT request.
 * @param {string} options.hostname - The Redmine hostname.
 * @param {number} options.number - The issue number in Redmine.
 * @param {string} options.action - The action performed on the PR.
 * @param {boolean} options.merged - Whether the PR was merged.
 * @param {Object} options.pr - The PR data.
 * @param {number} options.percentage - The percentage of completion.
 * @returns {Promise<Response>} The response from the PUT request.
 */
async function put(options) {
  const { hostname, number, action, merged, pr, percentage } = options;
  console.log("options: ", JSON.stringify(getBody(action, merged, pr, percentage)));
  return await fetch(`${hostname}/issues/${number}.json`, {
    method: "PUT",
    headers: {
      "X-redmine-api-key": core.getInput("REDMINE_APIKEY"),
      "Content-type": "application/json",
    },
    body: JSON.stringify(getBody(action, merged, pr, percentage)),
  });
}

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
    const issueNumbers = await parseRedmineIssues(pr.data.body, hostname);
    const percentageDone = await parsePercentageDone(pr.data.body);

    for (const number of issueNumbers) {
      const res = await put({
        hostname: hostname,
        number: number,
        action: action,
        merged: merged,
        pr: pr,
        percentage: percentageDone,
      });

      console.log("MIRA LAO", res.status);
      
      if (res.status != 204) {
        throw new Error(res);
      }
    }
  } catch (error) {
    console.error("error: " + error);
    process.exitCode = 1;
  }
}

run();
