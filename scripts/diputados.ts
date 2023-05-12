import axios from 'axios';
import fs from 'fs';
import path from 'path';

const query = `
  query GetAllDiputados {
    allDiputados {
      id_dip
      Nombre
      PrimerApellido
      SegundoApellido
      NombreCompleto
      Partido
      Telefono
      Correo
    }
  }
`;

const url = 'https://micrositios.diputados.gob.mx:4001/graphql';

axios.post(url, { query })
  .then((result) => {
    // Get the array of diputados from the response
    const diputados = result.data.data.allDiputados;

    // Transform the diputados array to the desired format
    const transformedDiputados = diputados.map((diputado: any) => ({
      id: diputado.id_dip,
      nombre: diputado.Nombre,
      apellidos: diputado.PrimerApellido + ' ' + diputado.SegundoApellido,
      fraccion: diputado.Partido,
      telefono: diputado.Telefono,
      correo: diputado.Correo,
    }));

    // Write the transformed array to a JSON file
    fs.writeFileSync(path.join(__dirname, '../', '.tmp', 'diputados.json'), JSON.stringify(transformedDiputados, null, 2));
  })
  .catch((error) => {
    console.error('Error fetching data: ', error);
  });
