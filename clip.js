const fs = require('fs');
const packages = require('./packages.json');
const argv = require('minimist')(process.argv.slice(2));
const base64 = require('js-base64').Base64;
const VERSION = "0.1.2";

const axios = require('axios');
async function getVersion() {
    try {
      const response = await axios.get('https://api.github.com/repos/mvishok/climine/releases/latest');
      return response.data.tag_name;
    } catch (error) {
      console.error('Error fetching release tag:', error.message);
      // Handle the error as needed
      return null;
    }
}

if (argv['v']){
    console.log(VERSION);
}

async function boot(){
    console.log("Climine Package Manager v"+VERSION);
    const latestVersion = await getVersion();
    if (latestVersion != VERSION){
        console.log("New version available:", latestVersion, "\nCheck it out at https://clip.vishok.tech/\n");
    }

    if (argv['i'] || argv['install']){
        let package = argv['i'] || argv['install'];
        let owner = package.split("/")[0];
        let repo = package.split("/")[1];
        if (!owner || !repo){
            console.error("ERROR: Invalid package name");
            return;
        }

        let url = "https://api.github.com/repos/"+owner+"/"+repo+"/contents/package.json";

        let v = false;
        if (argv['version']){
            v = argv['v'] || argv['version'];
        }

        console.log("Fetching package.json from", url);
        var json;
        try {
        const response = await axios.get(url);
        let data = base64.decode(response.data.content);
        json = JSON.parse(data);}
        catch (e){
            console.error("ERROR: Package not found");
            return;
        }

        console.log("Installing", json.name, "version "+json.version);
        console.log("Description:", json.description);
        console.log("Author:", json.author);

        console.log("Downloading files...");
        var name = "";
        //download the repo
        try{
        let downloadUrl = "https://github.com/"+owner+"/"+repo+"/archive/master.zip";
        let downloadPath = "./";
        const download = require('download');
        name = await download(downloadUrl, downloadPath, {extract: true});
        } catch (e){
            console.error("ERROR: Could not download package");
            return;
        }
        console.log("Downloaded to", name[0].path);
        
        try {
        console.log("Renaming to", json.name);
        fs.renameSync(name[0].path, json.name);
        } catch (e){
            console.error("ERROR: Could not rename package");
            return;
        }
        console.log("Setting package entry point to", json.entry);
        const entry = json.name+"/"+json.entry;
        console.log("Appending to packages.json");
        packages[""][json.name] = {
            "name": json.name,
            "version": json.version,
            "description": json.description,
            "author": json.author,
            "repo": owner+"/"+repo,
            "path": entry,
        }
        try{
        fs.writeFileSync("packages.json", JSON.stringify(packages, null, 2));
        } catch (e){
            console.error("ERROR: Could not write to packages.json");
            return;
        }
        console.log("Done!");
        console.log(json.name, "installed successfully.");
    }
    if (argv["u"] || argv["uninstall"] || argv["remove"]){
        let package = argv["u"] || argv["uninstall"] || argv["remove"];
        if (!packages[""][package]){
            console.error("ERROR: Package not found");
            return;
        }
        console.log("Removing", package);
        console.log("Deleting files...");
        try{
        fs.rmSync(package, { recursive: true });
        } catch (e){
            console.error("ERROR: Could not delete package");
            return;
        }
        console.log("Removing from packages.json");
        delete packages[""][package];
        try{
        fs.writeFileSync("packages.json", JSON.stringify(packages, null, 2));
        } catch (e){
            console.error("ERROR: Could not write to packages.json");
            return;
        }
        console.log("Done!");
        console.log(package, "removed successfully.");
    }
}

boot();