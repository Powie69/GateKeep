require('dotenv').config()

let mysqlTimestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');
console.log(mysqlTimestamp);

const jsDate = new Date(mysqlTimestamp);

const timeAndDay = {
  time: jsDate.toLocaleTimeString(), // Returns time in local time zone
//   day: jsDate.toLocaleDateString('en-US') // Returns full name of the day
day: jsDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: "numeric" }) // Returns month name and day
};

console.log('Time:', timeAndDay.time);
console.log('Day:', timeAndDay.day);

console.log();
