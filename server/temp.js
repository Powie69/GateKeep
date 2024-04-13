

// Format the date and time to match MySQL timestamp format
let mysqlTimestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');
// const mysqlTimestamp = '2012-04-13 12:30:00'; // Example timestamp
console.log(mysqlTimestamp);

// Convert MySQL timestamp to JavaScript Date object
const jsDate = new Date(mysqlTimestamp);

// Get the time and day
const timeAndDay = {
  time: jsDate.toLocaleTimeString(), // Returns time in local time zone
//   day: jsDate.toLocaleDateString('en-US') // Returns full name of the day
day: jsDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' }) // Returns month name and day
};

console.log('Time:', timeAndDay.time);
console.log('Day:', timeAndDay.day);