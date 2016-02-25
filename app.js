"use strict";

const express = require("express");
const app = express();

const PORT = process.env.PORT || 3000;

const sqlite3 = require("sqlite3");
const db = new sqlite3.Database("./db/chinook.sqlite");

app.get("/", (req, res) => {
  res.set('Content-Type', 'text/html');
  res.send(`<h1>SQLite Database Exercises</h1>
            <a href="/sales-per-year"><button type="button">Sales Per Year</button></a>
            <a href="/invoices-per-country"><button type="button">Invoices Per Country</button></a>`);
});

app.get("/sales-per-year", (req, res) => {
  // /sales-per-year?filter[year]=2009,2012

  let having = "";

  if (req.query.filter) {
    having = "HAVING";

    req.query.filter.year
      .split(",")
      .map(y => +y)
      .forEach(y => {
        having += ` year = "${y}" OR`;
    });

    having = having.substring(0, having.length - 3);
  }

  db.all(`
    SELECT    COUNT(*) as Invoices,
              SUM(Total) as Total,
              STRFTIME("%Y", InvoiceDate) as year
    FROM      Invoice
    GROUP BY  year
    ${having}`,
      (err, data) => {
        if (err) throw err;

        const roundedData = data.map(function (obj) {
          return {
            invoices: obj.invoices,
            year: +obj.year,
            total: +obj.Total.toFixed(2)
          }
        });

        res.send({
          data: roundedData,
          info: "# of invoices and sales per year"
        });
      })
});

app.get("/invoices-per-country", (req, res) => {
  db.all(`
    SELECT    COUNT(*) as InvoiceCount,
              BillingCountry AS Country
    FROM      Invoice
    GROUP BY  BillingCountry
    ORDER BY  InvoiceCount DESC`,
      (err, data) => {
        if (err) throw err;

        res.send({
          data: data,
          info: "# of invoices per country"
        });
      }
  );
});

app.listen(PORT, () => {
  console.log(`Express server listening on port ${PORT}`);
})
