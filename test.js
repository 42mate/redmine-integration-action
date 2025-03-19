const https = require("https");
const fetch = require("node-fetch");
const utils = require("./utils.cjs");

async function run() {
  try {
    const issueNumbers = [9196]
    const percentageDone = 10;
    for (const number of issueNumbers) {
      const res = await utils.put({
        hostname: "https://redmine.42mate.com",
	apiKey: 'ec234c37b836236e0de1d91de607b301ed1eb370',
        number: 9196,
        action: "opened",
        merged: false,
        pr: {
	  data: {
	    title: "this is a test",
	    url: "https://redmine.42mate.com/issues",
	    body: "this is the best body event \n Javi needs to learn how to do this"
	  }
	},
        percentage: percentageDone,
      });
      console.log(res);
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
