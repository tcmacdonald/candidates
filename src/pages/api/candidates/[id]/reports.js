import * as cheerio from 'cheerio';
import { kref } from '../../../../lib/utils';

const TestRoute = async (req, res) => {
  const { id } = req.query

  const url = kref(`/kref/publicsearch/CandidateSearch/CandidateReports/${id}`)
  const response = await fetch(url);
  const payload = await response.text();
  const $ = cheerio.load(payload, null, false);

  const els = $('.card')
  const extractUrl = (el) => {
    const a = $(el).find('a')
    console.log(a.attr('title'))
    const path = a.attr('href')
    return kref(path)
  }
  
  const data = Array.from(els).map(el => ({
      title: $(el).find('.card-header').text().trim(),
      url: extractUrl(el)
    })
  )
  res.status(200).json(data)
}

export default TestRoute;