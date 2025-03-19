const fetch = require("node-fetch");

/**
 * Constructs the body of the new PR issue.
 * @param {Object} pr - The pull request data.
 * @returns {Object} The issue body containing PR notes and URL.
 */
function newPRBody(pr) {
  return {
    issue: {
      notes: `*PR CREATED*: "${pr.data.title}":${pr.data.url} \n` + pr.data.body,
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
      notes: `PR CLOSED ${pr.url}`,
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
    notes: `PR MERGED ${pr.url}`,
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
  return 0;
}

// This could be a  nice to have
async function parseAttachements(prdata) {
  // https://github.com/user-attachments/assets/c6a40c7d-ad2b-469e-8708-a949cb17985d
  const regexp = new RegExp("https?:\/\/github\.com\/user-attachments[^\)]+)", "g");

  let attachments = [];
  let result;

  while ((result = regexp.exec(prdata)) !== null) {
    attachments.push(result[0]);
  }

  return attachments;
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
  const { hostname, number, action, merged, pr, percentage, apiKey} = options;
  console.log(options);
  return await fetch(`${hostname}/issues/${number}.json`, {
    method: "PUT",
    headers: {
      "X-redmine-api-key": apiKey,
      "Content-type": "application/json",
    },
    body: JSON.stringify(getBody(action, merged, pr, percentage)),
  });
}


module.exports = {
  put,
  parseRedmineIssues,
  parsePercentageDone,
  parseAttachements,
}
