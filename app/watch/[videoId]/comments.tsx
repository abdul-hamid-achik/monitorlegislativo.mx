"use client"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

export default function Commments() {

  return <div className="container grid items-center gap-6 px-8 pb-8 pt-6 md:py-10" >
    <h3 className="scroll-m-20 text-lg font-extrabold tracking-tight lg:text-5xl">
      Comentarios
    </h3>
    <Textarea className="h-32 w-full" />
    <Button className="h-12 w-full" >Enviar</Button>
  </div>
}
