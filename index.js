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
      id: 1,
      title: "foo",
      body: "bar",
      userId: 1,
    };

    var options = {
      host: "jsonplaceholder.typicode.com",
      path: `/posts/1`,
      method: "PUT",
      headers: {
        "X-Redmine-API-Key": "ec234c37b836236e0de1d91de607b301ed1eb370",
        "Content-type": "application/json",
      },
    };

    console.log("before request");
    var req = https.request(options, function (res) {
      if (
        res.statusCode !== 200 &&
        res.statusCode !== 201 &&
        res.statusCode !== 204
      ) {
        console.log("Status code " + res.statusCode);
        throw new Error(res.statusCode);
      }
      console.log(res.statusCode);
      process.exitCode = 0;
    });

    req.on("error", function (err) {
      console.log("before ");
      console.log(err);
      throw err;
    });

    var body = JSON.stringify(params);
    console.log("writing the body");
    req.write(body);
    console.log("pushing the message");
    req.end();
  } catch (error) {
    console.error("error: " + error);
    process.exitCode = 1;
  }
}

run();
