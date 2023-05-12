import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { prisma, } from '@/lib/prisma'
import { Role } from '@prisma/client'

async function getDiputados() {
  const diputados = await prisma.politician.findMany({
    where: {
      role: Role.DIPUTADO
    }
  })

  return diputados
}

export default async function DiputadosPage() {

  const Diputados = await getDiputados()

  return <main className="container grid items-center gap-6 pb-8 pt-6 md:py-10" >
    <Table>
      <TableCaption>Diputados de la republica</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Nombre</TableHead>
          <TableHead>Partido</TableHead>
          <TableHead>Correo</TableHead>
          <TableHead>Telefono</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {Diputados.map((senator) => (
          <TableRow key={senator.id}>
            <TableCell>{senator.name}</TableCell>
            <TableCell>{senator.fraction}</TableCell>
            <TableCell>{senator.email}</TableCell>
            <TableCell>{senator.phone}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </main>
}
