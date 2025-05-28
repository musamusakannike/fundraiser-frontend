import CampaignDetailsClient from "./CampaignDetailsClient"

export default async function Page({ params }: { params: { id: string } }) {
    const { id } = await params
    return <CampaignDetailsClient id={id} />
}
