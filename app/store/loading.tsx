import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="flex flex-col w-full">
      <div className="relative mb-12 w-full overflow-hidden rounded-[2rem] bg-[#002684] px-6 py-12 text-center text-white shadow-sm md:px-12 md:py-20">
        <div className="relative z-10 mx-auto max-w-3xl">
          <Skeleton className="mx-auto mb-4 h-10 w-3/4 rounded-full bg-white/20" />
          <Skeleton className="mx-auto h-5 w-full rounded-full bg-white/15" />
          <Skeleton className="mx-auto mt-3 h-5 w-5/6 rounded-full bg-white/15" />
        </div>
      </div>

      <div className="flex flex-col gap-6 mb-8 md:mb-12">
        <div className="flex flex-col items-center text-center">
          <Skeleton className="mb-3 h-10 w-64 rounded-full" />
          <Skeleton className="h-5 w-full max-w-2xl rounded-full" />
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="w-full md:flex-1">
            <div className="flex justify-center gap-2">
              <Skeleton className="h-10 w-20 rounded-full" />
              <Skeleton className="h-10 w-24 rounded-full" />
              <Skeleton className="h-10 w-20 rounded-full" />
            </div>
          </div>

          <div className="flex justify-center md:justify-end">
            <Skeleton className="h-12 w-28 rounded-full" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="flex flex-col gap-4 h-full">
            <Skeleton className="aspect-[4/5] w-full rounded-[2rem]" />
            <div className="px-2">
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-full mb-4" />
              <div className="flex justify-between items-center mt-auto">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-9 w-20 rounded-full" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col items-center justify-center pt-10">
        <Skeleton className="h-12 w-40 rounded-full" />
      </div>
    </div>
  )
}
