const https = require("https");
const fetch = require("node-fetch");

const marked = require('marked');

const invalidTags = {
  img:new RegExp('<img\\s+[^>]*src\\s*=\\s*["\'][^"\']*["\'][^>]*>', 'i'),
};

function isValidMarkdown(prdata) {
    try {
        marked.parse(prdata);
        return true;
    } catch (e) {
        return false;
    }
}

function getInvalidTags(prdata) {
  return Object.keys(invalidTags).reduce((accumulator, key) => {
    if (invalidTags[key].exec(prdata)) {
      accumulator.push(key);
    }
    return accumulator
  }, []);
}

async function run() {
  try {
    const message = `New PR created on Github TESTING BY LAO`;
    const params = {
      issue: {
        notes: message,
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

    console.log(getInvalidTags("PR CREATED https://github.com/Warc-Ghana-Limited/farming-app/pull/76 \n ## REDMINE Ticket:\r\n\r\n- [9102](***/issues/9102)\r\n\r\nPERCENTAGE_DONE=100\r\n\r\n## Tasks Done:\r\n\r\nProduct Resource Creation\r\n\r\n- List Products: Implementation of functionality to display all available products.\r\n- Create Product: Development of the interface and logic to add new products to the system.\r\n- Edit Product: Implementation of the option to modify information for existing products.\r\n- Backend and Frontend: Complete integration between the server and user interface for a seamless experience.\r\n\r\n## Tasks Remaining: (List of tasks remaining to be implemented)\r\n\r\n- What is remaining to be implemented in this PR? Mention a list of them\r\n\r\n## Steps to test feature:\r\n\r\n- How can we test the feature we implemented in this PR? \r\n- You could mention steps to test it for:\r\n  - Local\r\n  - Development\r\n  - Prodution\r\n\r\n## Screenshots:\r\n\r\n<img width=\"1800\" alt=\"Captura de pantalla 2025-03-19 a la(s) 3 41 31 p  m\" src=\"https://github.com/user-attachments/assets/f3bf0124-4cd3-484c-b7a9-88d3e8ef0eef\" />\r\n\r\n\r\n## Documentation\r\n\r\n- [Documentation](https://apps-docmost-web.eltavi.easypanel.host/s/42mate)\r\n\r\n## Reviewers\r\n\r\n- @ariel42mate\r\n- @wmb42mate\r\n- @agustinretamozo42mate\r\n- @lucas42mate\r\n- @diegonelson42mate\r\n"));

    const res = await fetch("https://redmine.42mate.com/issues/9196.json", {
      method: "PUT",
      headers: {
        "X-redmine-api-key": "ec234c37b836236e0de1d91de607b301ed1eb370",
        "Content-type": "application/json",
      },
      body: JSON.stringify({
	"issue":{
	  "notes": "PR CREATED https://github.com/Warc-Ghana-Limited/farming-app/pull/76 \n ## REDMINE Ticket:\r\n\r\n- [9102](***/issues/9102)\r\n\r\nPERCENTAGE_DONE=100\r\n\r\n## Tasks Done:\r\n\r\nProduct Resource Creation\r\n\r\n- List Products: Implementation of functionality to display all available products.\r\n- Create Product: Development of the interface and logic to add new products to the system.\r\n- Edit Product: Implementation of the option to modify information for existing products.\r\n- Backend and Frontend: Complete integration between the server and user interface for a seamless experience.\r\n\r\n## Tasks Remaining: (List of tasks remaining to be implemented)\r\n\r\n- What is remaining to be implemented in this PR? Mention a list of them\r\n\r\n## Steps to test feature:\r\n\r\n- How can we test the feature we implemented in this PR? \r\n- You could mention steps to test it for:\r\n  - Local\r\n  - Development\r\n  - Prodution\r\n\r\n## Screenshots:\r\n\r\n<img width=\"1800\" alt=\"Captura de pantalla 2025-03-19 a la(s) 3 41 31 p  m\" src=\"https://github.com/user-attachments/assets/f3bf0124-4cd3-484c-b7a9-88d3e8ef0eef\" />\r\n\r\n\r\n## Documentation\r\n\r\n- [Documentation](https://apps-docmost-web.eltavi.easypanel.host/s/42mate)\r\n\r\n## Reviewers\r\n\r\n- @ariel42mate\r\n- @wmb42mate\r\n- @agustinretamozo42mate\r\n- @lucas42mate\r\n- @diegonelson42mate\r\n"}
      })
    });

    console.log(res);

    // var req = https.request(options, function (res) {
    //   if (
    //     res.statusCode !== 200 &&
    //     res.statusCode !== 201 &&
    //     res.statusCode !== 204
    //   ) {
    //     console.log(res.statusCode);
    //     throw new Error("error");
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
