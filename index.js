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
      headers: {
        "X-Redmine-API-Key": "ec234c37b836236e0de1d91de607b301ed1eb370",
        "Content-type": "application/json",
      },
    };

    https.get("https://google.com", (res) => console.log(res));

    https
      .get("https://jsonplaceholder.typicode.com/users", (res) => {
        let data = [];
        const headerDate =
          res.headers && res.headers.date
            ? res.headers.date
            : "no response date";
        console.log("Status Code:", res.statusCode);
        console.log("Date in Response header:", headerDate);

        res.on("data", (chunk) => {
          data.push(chunk);
        });

        res.on("end", () => {
          console.log("Response ended: ");
          const users = JSON.parse(Buffer.concat(data).toString());

          for (user of users) {
            console.log(`Got user with id: ${user.id}, name: ${user.name}`);
          }
        });
      })
      .on("error", (err) => {
        console.log("Error: ", err.message);
      });

    // var req = https.request(options, function (res) {
    //   if (
    //     res.statusCode !== 200 &&
    //     res.statusCode !== 201 &&
    //     res.statusCode !== 204
    //   ) {
    //     console.log(res.statusCode);
    //     throw new Error(res.statusCode);
    //   }
    //   console.log(res.statusCode);
    // });

    // req.on("error", function (err) {
    //   console.log(options);
    //   throw err;
    // });

    // var body = JSON.stringify(params);
    // console.log(body);
    // req.write(body);

    // req.end();
  } catch (error) {
    console.error("error: " + error);
    process.exitCode = 1;
  }
}

run();
