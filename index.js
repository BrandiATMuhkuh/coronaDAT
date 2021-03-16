console.log("Cov2");
const admZip = require("adm-zip");
const csvjson = require("csvjson");
const fs = require("fs");
const glob = require("glob");

const mg = glob.sync("./**/*_orig_csv_ages.zip");

const allDaysJSON = [];
for (const file of mg) {
  let date = file.split("/")[2];
  date = `${date.substr(0, 4)}-${date.substr(4, 2)}-${date.substr(6, 2)}`;
  var zip = new admZip(file);
  var zipEntries = zip.getEntries(); // an array of ZipEntry records
  for (const innerFile of zipEntries) {
    if (innerFile.entryName === "CovidFaelle_Altersgruppe.csv") {
      // console.log("innerFile", innerFile.entryName)
      // console.log("innerFile.csv", innerFile.getData().toString('utf8'));

      let dayData = csvjson.toObject(innerFile.getData().toString("utf8"), {
        delimiter: ";",
      });
      dayData = dayData.filter((e) => e.BundeslandID === "10");

      const ages = [
        "<5",
        "5-14",
        "15-24",
        "25-34",
        "35-44",
        "45-54",
        "55-64",
        "65-74",
        "75-84",
        ">84",
      ];

      const d = {
        date,
        "<5": 0,
        "5-14": 0,
        "15-24": 0,
        "25-34": 0,
        "35-44": 0,
        "45-54": 0,
        "55-64": 0,
        "65-74": 0,
        "75-84": 0,
        ">84": 0,
      };

      for (const dayDatum of dayData) {
        d[dayDatum["Altersgruppe"]] += parseInt(dayDatum["Anzahl"]);
        // console.log('dayDatum',dayDatum);
      }

      // noramlize
      let total = 0;
      for(const age of ages){
        total += d[age];
      }

      for(const age of ages){
        d[age] = Math.round((d[age]/total) * 100);
      }



      allDaysJSON.push(d);

      break;
    }
  }
}

console.log("allDaysJSON", allDaysJSON);

const finalCSV = csvjson.toCSV(allDaysJSON, { delimiter: ";" });
console.log("finalCSV", finalCSV);
fs.writeFileSync("./AustriaAge.csv", finalCSV);
