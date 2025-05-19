import CampaignDetailsClient from "./CampaignDetailsClient"

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    return <CampaignDetailsClient id={id} />
}
