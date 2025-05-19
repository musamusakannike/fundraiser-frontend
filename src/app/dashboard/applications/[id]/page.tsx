
import ApplicationDetailsClient from "./ApplicationDetailsClient"

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <ApplicationDetailsClient id={id} />
}
