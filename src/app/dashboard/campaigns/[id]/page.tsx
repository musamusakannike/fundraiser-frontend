import CampaignDetailsClient from "./CampaignDetailsClient"

export default function Page({ params }: { params: { id: string } }) {
    const { id } = params
    return <CampaignDetailsClient id={id} />
}
