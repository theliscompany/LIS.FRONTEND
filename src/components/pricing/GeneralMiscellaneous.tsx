import { useQuery } from "@tanstack/react-query";
import { getApiMiscellaneousMiscellaneousByPortsOptions } from "../../api/client/pricing/@tanstack/react-query.gen";
import OffersMiscellaneousService from "./OffersMiscellaneousService";

const GeneralMiscellaneous = () => {


    const {data} = useQuery({
        ...getApiMiscellaneousMiscellaneousByPortsOptions(),
        staleTime: Infinity
    })
    
    return (
        <>
            {/* <Stack direction='row' alignItems='center' justifyContent='space-between' mb={1}>
                <TextField value={globalFilter ?? ''} onChange={(e) => setGlobalFilter(e.target.value)}
                    size='small' placeholder="Search miscellaneous..." />
            </Stack> */}
            <OffersMiscellaneousService miscellaneous={data ?? []} />
    
        </>
    )
}

export default GeneralMiscellaneous;