// Start the worker in which sql.js will run
var worker = new Worker("js/worker.sql-asm.js");
worker.onerror = error;


const sqlPromise = initSqlJs({
    locateFile: file => `database/tombola.db`
});
const dataPromise = fetch("/path/to/database.sqlite").then(res => res.arrayBuffer());
const [SQL, buf] = await Promise.all([sqlPromise, dataPromise])
const db = new SQL.Database(new Uint8Array(buf));