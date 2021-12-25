const fs = require("fs");
const csv = fs.readFileSync("./로그.csv");

(function main() {
  const pattern = /\r\n/g;
  const parsed = csv.toString()?.split(pattern);
  const allDates = [];
  const datePattern = /[0-9]{4}-[0-9]{2}-[0-9]{2}/;
  const dateSet = new Set();
  const output = new Map();

  parsed.forEach((item) => {
    if (datePattern.test(item)) allDates.push(item);
    if (item.match(datePattern)) dateSet.add(item.match(datePattern)[0]);
  });

  allDates.forEach((item) => {
    for (const value of dateSet.entries()) {
      if (item.includes(value[0])) {
        if (output.has(value[0])) {
          const oldValue = output.get(value[0]);
          output.set(value[0], [...oldValue, item]);
        } else {
          output.set(value[0], [item]);
        }
      }
    }
  });

  fs.writeFile(
    "./spliced.json",
    JSON.stringify(spliceObject(mapToObject(output))),
    (err) => {
      if (err) console.log(err);
      fs.writeFileSync("./date.json", JSON.stringify(mapToObject(output)));
    }
  );
})();

function mapToObject(map) {
  const obj = {};
  for (const entry of map.entries()) {
    obj[entry[0]] = entry[1];
  }
  return obj;
}

function spliceObject(obj) {
  const keys = Object.keys(obj);
  for (const key of keys) {
    obj[key] = [
      getTime(obj[key][0]),
      getTime(obj[key][obj[key].length - 1]),
      subsTime(
        key,
        getTime(obj[key][0]),
        getTime(obj[key][obj[key].length - 1])
      ),
    ];
  }
  return obj;
}

function getTime(str) {
  const timePattern = /오[전|후] [0-9]{1,2}:[0-6][0-9]:[0-6][0-9]/g;
  if (timePattern.test(str)) return str.match(timePattern)[0];
  return "none";
}

function transHour(matchedPattern) {
  if (matchedPattern.split(" ")[0] === "오전") {
    return `${matchedPattern.split(" ")[1]}`;
  } else {
    return `${
      parseInt(matchedPattern.split(" ")[1]) + 12 === 24
        ? 0
        : parseInt(matchedPattern.split(" ")[1]) + 12
    }`;
  }
}

function subsTime(date, time1, time2) {
  const hourPattern = /오[전|후] [0-9]{1,2}(?=:[0-6][0-9]:[0-6][0-9])/g;
  return Math.round(
    Math.abs(
      new Date(
        `${date} ${time1?.replace(
          hourPattern,
          transHour(time1.match(hourPattern)[0])
        )}`
      ) -
        new Date(
          `${date} ${time2?.replace(
            hourPattern,
            transHour(time2.match(hourPattern)[0])
          )}`
        )
    ) /
      1000 /
      60 /
      60
  );
}
