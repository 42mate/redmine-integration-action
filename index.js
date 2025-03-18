const helper = require("./helper.js");

const core = require("@actions/core");
const github = require("@actions/github");
const http = require("http");

async function run() {
  try {
    const context = github.context;
    const octokit = github.getOctokit(core.getInput("token"));
    const hostname = core.getInput("redmine_host");
    const pr = await octokit.rest.pulls.get({
      owner: context.repo.owner,
      repo: context.repo.repo,
      pull_number: context.payload.pull_request.number,
    });

    const issueNumber = await helper.parse_redmine_issues(
      pr.data.body,
      hostname,
    );

    const method = "PUT";

    const message = `New PR created on Github [${pr.data.number}][${pr.url}]`;
    const params = {
      issue: {
        notes: message,
      },
    };

    var options = {
      host: "https://redmine.42mate.com",
      path: `/issues/${issueNumber.pop()}.json`,
      method: method,
      headers: {
        "X-Redmine-API-Key": core.getInput("redmine_apikey"),
      },
    };

    var req = http.request(options, function (res) {
      if (
        res.statusCode != 200 &&
        res.statusCode != 201 &&
        res.statusCode != 204
      ) {
        return;
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
      console.log(err);
    });

    if (method != "GET") {
      var body = JSON.stringify(params);
      req.setHeader("Content-Length", body.length);
      req.setHeader("Content-Type", "application/json");
      req.write(body);
    }
    req.end();
  } catch (error) {
    console.error("error: " + error);
    process.exitCode = 1;
  }
}

run();
