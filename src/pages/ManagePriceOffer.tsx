import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAccount, useMsal } from '@azure/msal-react';
import { Typography, Box } from '@mui/material';
import { useAuthorizedBackendApi } from '../api/api';
import { protectedResources } from '../config/authConfig';
import { BackendService } from '../utils/services/fetch';
import { useTranslation } from 'react-i18next';
import {
	type RichTextEditorRef,
	RichTextReadOnly,
} from "mui-tiptap";
import { containerPackages } from '../utils/constants';
import PriceOffer from '../components/editRequestPage/PriceOffer';

function ManagePriceOffer(props: any) {
	const { t } = useTranslation();

	const [offer, setOffer] = useState<any>(null);
	const [offerNumber, setOfferNumber] = useState<string>("");
	const [content, setContent] = useState<string>("");
	const [options, setOptions] = useState<any>(null);
	
	const [files, setFiles] = useState<any>(null);
	const [containers, setContainers] = useState<any>(null);
	
	let { id } = useParams();
	const { instance, accounts } = useMsal();
	const account = useAccount(accounts[0] || {});
	const context = useAuthorizedBackendApi();

	const rteRef = useRef<RichTextEditorRef>(null);
	const [fileValue, setFileValue] = useState<File[] | undefined>(undefined);
    
	useEffect(() => {
		getContainers();
	}, [account, instance, account]);

	const loadOffer = async () => {
		if (account && instance && context) {
			const response = await (context?.service as BackendService<any>).getSingle(protectedResources.apiLisOffer.endPoint+"/QuoteOffer/"+id);
			if (response !== null && response.code !== undefined) {
				if (response.code === 200) {
					console.log(response.data);
					var objTotal = JSON.parse(response.data.createdBy);
					setFiles(objTotal.files);
					setOptions(objTotal.options);
					setOffer(response.data);
					setOfferNumber(response.data.quoteOfferNumber);
					setContent(response.data.comment);
					// setLoad(false);
				}
				else {
					// setLoad(false);
				}
			}
		}
	}

	const getContainers = async () => {
		if (account && instance && context) {
			setContainers(containerPackages);
			// Now I can call the quote offer
			loadOffer();
		}
	}

	return (
		<div style={{ background: "#fff", borderTopLeftRadius: 20, borderTopRightRadius: 20 }}>
			<Box py={2.5}>
				<Typography variant="h5" sx={{ mt: { xs: 4, md: 1.5, lg: 1.5 } }} mx={5}><b>{t('manageOffer')} N° {offerNumber}</b></Typography>
				<Box>
					<PriceOffer
						id={id} files={files} options={options}
						offer={offer} setOffer={setOffer}
					/>
				</Box>
			</Box>
		</div>
	);
}

export default ManagePriceOffer;
