const helper = require("./helper.js");

const core = require("@actions/core");
const github = require("@actions/github");
const http = require("https");

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
      host: "redmine.42mate.com",
      path: `/issues/${issueNumber.pop()}.json`,
      method: "PUT",
      headers: {
        "X-Redmine-API-Key": core.getInput("REDMINE_APIKEY"),
      },
    };

    // var req = http.put(
    //   "https://redmine.42mate.com/issues/9196.json",
    //   params,
    //   (res) => {
    //     console.log(res);
    //   },
    // );

    // // Define the options object
    // const options = {
    //   method: 'PUT',
    //   hostname: 'example.',
    //   path: '/api/users/1',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': 'Bearer <your-token>'
    //   }
    // };

    // // Define the body
    // const body = JSON.stringify({ name: 'Bob' });

    // // Create the request
    // const req = http.request(options, (res) => {
    //   // Handle the response
    //   console.log(`Status code: ${res.statusCode}`);
    //   console.log(`Headers: ${JSON.stringify(res.headers)}`);
    //   let data = '';
    //   res.on('data', (chunk) => {
    //     // Concatenate the data chunks
    //     data += chunk;
    //   });
    //   res.on('end', () => {
    //     // Parse the data as JSON
    //     data = JSON.parse(data);
    //     console.log(`Data: ${JSON.stringify(data)}`);
    //   });
    // });

    // // Handle the error
    // req.on('error', (err) => {
    //   console.error(`Error: ${err.message}`);
    // });

    // // Write the body to the request
    // req.write(body);

    // // End the request
    // req.end();

    var req = http.request(options, function (res) {
      if (
        res.statusCode !== 200 &&
        res.statusCode !== 201 &&
        res.statusCode !== 204
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
