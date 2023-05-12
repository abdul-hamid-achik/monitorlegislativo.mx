import { prisma } from '@/lib/prisma';
import fs from 'fs';

async function main() {
  await prisma.politician.deleteMany();
  await prisma.subtitle.deleteMany();

  const senadores = JSON.parse(fs.readFileSync('.tmp/senadores.json', 'utf8'));
  const diputados = JSON.parse(fs.readFileSync('.tmp/diputados.json', 'utf8'));

  console.log('Creating politicians...');

  console.log(`Creating ${senadores.length} senators...`);
  const senatorData = senadores.map((senador: any) => ({
    name: senador.nombre,
    lastName: senador.apellidos,
    fraction: senador.fraccion,
    phone: senador.telefono,
    email: senador.correo,
    link: senador.link,
    role: 'SENADOR',
  }));

  console.log(`Creating ${diputados.length} deputies...`);
  const diputadoData = diputados.map((diputado: any) => ({
    name: diputado.nombre,
    lastName: diputado.apellidos,
    fraction: diputado.fraccion,
    phone: diputado.telefono,
    email: diputado.correo,
    role: 'DIPUTADO',
  }));

  const allPoliticiansData = [...senatorData, ...diputadoData];

  console.log(`Creating ${allPoliticiansData.length} politicians...`)

  await prisma.politician.createMany({
    data: allPoliticiansData,
    skipDuplicates: true,
  });

  console.log(`Done!`);
}

main()
  .then(async () => {
    await prisma.$disconnect()
    process.exit(0)
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
