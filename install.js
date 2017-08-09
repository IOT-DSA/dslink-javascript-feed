var https = require("https"),
    fs = require("fs"),
    path = require("path"),
    crypto = require("crypto"),
    child = require("child_process");

const MD5_PATH = path.join(__dirname, ".dslink.md5");
const PACKAGE_PATH = path.join(__dirname, "package.json");

// hardcoded to Yarn v0.27.5 for now
const YARN_PATH = path.join(__dirname, "tool", "yarn-0.27.5.js");

function getMD5(str) {
  const hash = crypto.createHash("md5");
  hash.update(str);
  return hash.digest("base64");
}

// check package.json for changes
// if so download/run yarn
// we use yarn because yarn.lock makes things easier to reproduce
function getDependencies() {
  const file = fs.readFileSync(PACKAGE_PATH);

  var md5 = "";
  if(fs.existsSync(MD5_PATH)) {
    md5 = fs.readFileSync(MD5_PATH).toString("utf8");
  }

  const hash = getMD5(file);
  if(hash !== md5) {
    const yarn = child.exec(`node ${YARN_PATH} install --production --no-progress`);
    console.log("installing dependencies with yarn");
    yarn.stdout.pipe(process.stdout);

    fs.writeFileSync(MD5_PATH, hash);
  }
}

getDependencies();
