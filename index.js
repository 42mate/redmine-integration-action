const helper = require("./helper.js");

const core = require("@actions/core");
const github = require("@actions/github");
const https = require("https");

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
        notes: pr.data.body,
      },
    };

    var options = {
      host: "redmine.42mate.com",
      path: `/issues/9196.json`,
      method: "PUT",
    };

    console.log("before request");
    var req = https.request(options, function (res) {
      if (
        res.statusCode !== 200 &&
        res.statusCode !== 201 &&
        res.statusCode !== 204
      ) {
        console.log(res.statusCode, res.headers, res.req.headers);
        throw new Error(res.statusCode);
      }
      console.log(res.statusCode);
      process.exitCode = 0;
    });

    req.setHeader(
      "X-Redmine-API-key",
      "ec234c37b836236e0de1d91de607b301ed1eb370",
    );
    req.setHeader("Content-type", "application/json");
    req.on("error", function (err) {
      console.log("before ");
      console.log(err);
      throw err;
    });

    var body = JSON.stringify(params);

    req.write(body);
    console.log(req.getHeaders());
    console.log("pushing the message");
    req.end();
  } catch (error) {
    console.error("error: " + error);
    process.exitCode = 1;
  }
}

run();
