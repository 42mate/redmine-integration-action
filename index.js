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

    const message = `New PR created on Github [${pr.data.number}][${pr.url}]`;
    const params = {
      issue: {
        notes: message,
      },
    };

    var options = {
      host: hostname,
      path: `/issues/${issueNumber.pop()}.json`,
      method: "PUT",
      headers: {
        "X-Redmine-API-Key": core.getInput("REDMINE_APIKEY"),
      },
    };

    var req = https.request(options, function (res) {
      if (
        res.statusCode != 200 &&
        res.statusCode != 201 &&
        res.statusCode != 204
      ) {
        throw new Error("error");
      }

      var body = "";
      res.setEncoding("utf8");
      res.on("data", function (chunk) {
        body += chunk;
      });
      res.on("end", function (e) {
        var data = JSON.parse(body);
        console.log(data);
      });
    });

    req.on("error", function (err) {
      console.log(options);
      throw err;
    });

    var body = JSON.stringify(params);
    req.setHeader("Content-Type", "application/json");
    req.write(body);

    req.end();
  } catch (error) {
    console.error("error: " + error);
    process.exitCode = 1;
  }
}

run();
