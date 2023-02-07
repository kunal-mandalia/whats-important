const fs = require("fs/promises");
const path = require("path");


async function main() {
    console.log("pre-build started");
    const swTemplate = await fs.readFile(path.join(__dirname, '/src/sw.js'), { encoding: "utf-8" });
    const appVersion = process.env.REACT_APP_VERSION.substring(0, 7);
    const nextCacheName = `WebApp_${appVersion}`;
    const generatedSw = swTemplate.replace("{{SHA_FROM_PRE_BUILD}}", nextCacheName);

    await fs.writeFile(path.join(__dirname, "/public/generated-sw.js"), generatedSw, { encoding: "utf-8" });
    console.log("updated /public/generated-sw.js");
    console.log("pre-build finished");
}

main();
