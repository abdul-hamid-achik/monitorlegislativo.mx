import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { prisma, } from '@/lib/prisma'
import { Role } from '@prisma/client'
import Link from "next/link"

async function getSenators() {
  const senators = await prisma.politician.findMany({
    where: {
      role: Role.SENADOR
    }
  })

  return senators
}

export default async function SenadoresPage() {

  const senators = await getSenators()

  return <main className="container grid items-center gap-6 pb-8 pt-6 md:py-10" >
    <Table>
      <TableCaption>Senadores de la republica</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Nombre</TableHead>
          <TableHead>Partido</TableHead>
          <TableHead>Correo</TableHead>
          <TableHead>Telefono</TableHead>
          <TableHead>Perfil</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {senators.map((senator) => (
          <TableRow key={senator.id}>
            <TableCell>{senator.name}{" "}{senator.lastName}</TableCell>
            <TableCell>{senator.fraction}</TableCell>
            <TableCell>{senator.email}</TableCell>
            <TableCell>{senator.phone}</TableCell>
            <TableCell>
              <Link href={senator.link as string} className="underline">
                Ver
              </Link>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </main>
}
