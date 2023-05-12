import Link from "next/link"

export default async function AboutPage() {

  return <main className="container grid items-center gap-6 px-8 pb-8 pt-6 md:py-10" >
    <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
      Acerca de Monitor Legislativo
    </h1>
    <p className="leading-7 [&:not(:first-child)]:mt-6">
      Me llamo Abdul Hamid y me gusta mucho la politica y el desarrollo de software.
    </p>

    <p className="leading-7 [&:not(:first-child)]:mt-6">
      Este proyecto es una forma de combinar mis dos pasiones.
    </p>

    <p className="leading-7 [&:not(:first-child)]:mt-6">
      Si quieres saber más de mi, puedes visitar mi <Link className="underline" href="https://abdulhamid.dev">página personal</Link>.
    </p>

    <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight transition-colors first:mt-0">
      ¿Qué es Monitor Legislativo?

    </h2>

    <p className="leading-7 [&:not(:first-child)]:mt-6">
      Monitor Legislativo es un proyecto que busca hacer accesible la información de las sesiones del congreso y el senado.
    </p>

    <p className="leading-7 [&:not(:first-child)]:mt-6">
      Tambien el objetivo es usar inteligencia artificial para analizar el contenido de las sesiones y hacerlo entendible.
    </p>

    <p className="leading-7 [&:not(:first-child)]:mt-6">
      El proyecto es de código abierto y puedes ver el código en <Link className="underline" href="https://github.com/abdul-hamid-achik/monitorlegislativo.mx">GitHub</Link>.
    </p>
  </main>
}
