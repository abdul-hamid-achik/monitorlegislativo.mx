import axios from 'axios';
import cheerio from 'cheerio';
import fs from 'fs';

const url = 'https://www.senado.gob.mx/65/senadores/directorio_de_senadores';

axios.get(url).then(response => {
  const html = response.data;
  const $ = cheerio.load(html);
  const table = $('.table.table-striped.table-condensed.table-list-search');
  let senators: any[] = [];

  // @ts-ignore
  table.find('tbody tr').each((i, elem) => {
    let senator = {
      id: $(elem).find('td').eq(0).text().trim(),
      apellidos: $(elem).find('td').eq(1).text().trim(),
      link: `https://www.senado.gob.mx${$(elem).find('td').eq(1).find('a').attr('href') || $(elem).find('td').eq(2).find('a').attr('href')}`,
      nombre: $(elem).find('td').eq(2).text().trim(),
      fraccion: $(elem).find('td').eq(3).text().trim(),
      telefono: $(elem).find('td').eq(4).text().trim(),
      // @ts-ignore
      correo: $(elem).find('td').eq(5).find('a').attr('href').replace('mailto:', '')
    };
    senators.push(senator);
  });

  fs.writeFileSync('.tmp/senadores.json', JSON.stringify(senators, null, 2));
}).catch(error => {
  console.error(error);
});
