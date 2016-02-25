"use strict";

const sqlite3 = require("sqlite3");
const db = new sqlite3.Database("./db/chinook.sqlite");

console.log("# of invoices per country");

db.each(`
  SELECT    COUNT(*) as InvoiceCount,
            BillingCountry AS Country
  FROM      Invoice
  GROUP BY  BillingCountry
  ORDER BY  InvoiceCount DESC`,
    (err, res) => {
      console.log(res);
    }
);
