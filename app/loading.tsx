import { Skeleton } from "@/components/ui/skeleton";

export default function LoadingPage() {
  return <main className="container grid items-center gap-6 pb-8 pt-6 md:py-10" >
    <Skeleton className="h-[20px] w-[100px] rounded-full" />
  </main >

}
