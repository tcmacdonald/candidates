import Papa from "papaparse"
import { DateTime } from "luxon";
import accounting from "accounting-js";
import { kref, sum } from '../../../lib/utils';

const TotalsRoute = async (req, res) => {
  const { office, location } = req.query

  const url = kref(`/kref/publicsearch/ExportSearch?ExemptionStatus=All&OfficeSought=${office}&Location=${location}&IsActiveFlag=True`)
  const payload = await fetch(url)
  const csv = await payload.text()
  const json = Papa.parse(csv, { header: true })
  const calendarYear = new Date(2022, 1, 1)
  const f = (str) => accounting.formatMoney(str)

  const output = json.data
    .map(row => {
      const date = DateTime.fromMillis(Date.parse(row.ElectionDate))
      return date > calendarYear ? row : undefined
    })
    .filter(r => r !== undefined)
    .reduce(function (r, a) {
      const name = `${a.FirstName} ${a.LastName}`
      r[name] = r[name] || [];
      r[name].push(a);
      return r;
    }, Object.create(null))
  ;

  Object.keys(output).map(name => {
    const profit = sum(output[name].map(r => Number(r.TotalReceipts)))
    const expenses = sum(output[name].map(r => Number(r.TotalDisburse)))
    output[name] = {
      profit: f(profit), 
      expenses: f(expenses),
      available: f(profit - expenses)
    }
  })

  res.status(200).json(output)
}
export default TotalsRoute;