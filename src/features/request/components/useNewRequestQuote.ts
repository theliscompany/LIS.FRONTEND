import { useAccount, useMsal } from "@azure/msal-react";
import { useEffect, useRef, useState } from "react";
import { CargoDetailsViewModel, PostApiRequestNewResponse, RequestQuoteViewModel } from "@features/request/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getContactGetContactsOptions } from "@features/crm/api/@tanstack/react-query.gen";
import { getCityOptions, getPackageOptions } from "@features/masterdata/api/@tanstack/react-query.gen";
import { getApiHsCodeLisOptions, getApiRequestQueryKey, postApiRequestNewMutation, putApiRequestUpdateByIdMutation } from "@features/request/api/@tanstack/react-query.gen";
import { AccountInfo } from "@azure/msal-browser";
import { SubmitHandler, UseFormSetValue } from "react-hook-form";
import { showSnackbar } from "@components/common/Snackbar";

export interface GraphUser {
    id: string;
    displayName?: string;
    userPrincipalName?: string;
    mail?: string;
    // Ajoutez d'autres champs si besoin selon la doc Graph
}

export const useNewRequestQuote = ({requestQuoteId, setValue}:
    { requestQuoteId?: string, setValue: UseFormSetValue<RequestQuoteViewModel>}) => {
    const { instance, accounts } = useMsal();

    const account = useAccount(accounts[0] || {});
    const queryClient = useQueryClient()

    const [editingRowIndex, setEditingRowIndex] = useState<number | null>(null)
    const [cargoDetailsAdded, setCargoDetailsAdded] = useState<CargoDetailsViewModel[]>([])
    const [allSelectedServices, setAllSelectedServices] = useState<number[]>([])
    const [tableRef, setTableRef] = useState<import("@tanstack/table-core").Table<CargoDetailsViewModel>>()

    const [members, setMembers] = useState<GraphUser[]>([])

    const rowDraftRef = useRef<CargoDetailsViewModel | null>(null);

    useEffect(() => {
        if (account !== null) {
            getMembersCanAssigne(account)
        }

    }, [instance, account])


    const { data: customers, isLoading: isLoadingCustomers } = useQuery({
        ...getContactGetContactsOptions(),
        staleTime: Infinity
    })

    const { data: cities, isLoading: isLoadingCities } = useQuery({
        ...getCityOptions(),
        staleTime: Infinity
    })

    const { data: packages } = useQuery({
        ...getPackageOptions(),
        staleTime: Infinity
    })

    // const { data: products } = useQuery({
    //     ...getProductOptions(),
    //     staleTime: Infinity
    // })

    const { data: HsCodes } = useQuery({
        ...getApiHsCodeLisOptions(),
        staleTime: Infinity
    })

    const mutationPost = useMutation({
        ...postApiRequestNewMutation(),
        onSuccess: (data: PostApiRequestNewResponse) => {
            showSnackbar('Request quote saved','success')
            const requestQuoteId = Object.keys(data)[0]
            setValue('requestQuoteId', requestQuoteId)
            setValue('trackingNumber', data[requestQuoteId])
            queryClient.invalidateQueries({
                queryKey: getApiRequestQueryKey()
            })
        },
        onError:() => showSnackbar("An error occurred", "warning")
    })

    const mutationUpdate = useMutation({
        ...putApiRequestUpdateByIdMutation(),
        onSuccess: () => {
            showSnackbar('Request quote updated','success')
            queryClient.invalidateQueries({
                queryKey: getApiRequestQueryKey()
            })
        },
        onError:() => showSnackbar("An error occurred", "warning")
    })

    const handleGetRowsSelected = (index: number[]) => setAllSelectedServices(index)

    const getTable = (table: import("@tanstack/table-core").Table<CargoDetailsViewModel>) => {
        setTableRef(table);
    }

    const getMembersCanAssigne = async (_account: AccountInfo) => {
        try {
            const result = await instance.acquireTokenSilent({
                scopes: ["GroupMember.Read.All"],
                account: _account,
            });
            const groupId = "bc8d8ba0-7c17-4357-ab82-f0233b90b4d9"
            const res = await fetch(
                `https://graph.microsoft.com/v1.0/groups/${groupId}/members`,
                {
                    headers: {
                        Authorization: `Bearer ${result.accessToken}`,
                    },
                }
            );
            const data = await res.json();
            setMembers(data.value as GraphUser[]);
        }
        catch (e: any) {
            console.log(e)
        }
    }

    const handleAddProducts = () => {
        const newService: CargoDetailsViewModel = {
            quantity: 1,
            products: []
        };
        setCargoDetailsAdded([...cargoDetailsAdded, newService]);
        setEditingRowIndex(cargoDetailsAdded.length);
        rowDraftRef.current = newService;
    }

    const handleValidRow = () => {
        if (editingRowIndex !== null && rowDraftRef.current) {
            const updated = [...cargoDetailsAdded];
            updated[editingRowIndex] = rowDraftRef.current;
            setCargoDetailsAdded(updated);
            setEditingRowIndex(null);
        }
    }

    const handleCancelRow = (index: number) => {
        const values = [...cargoDetailsAdded]
        values.splice(index, 1)
        setCargoDetailsAdded(values)
    }

    const onSubmit: SubmitHandler<RequestQuoteViewModel> = async (data) => {
        requestQuoteId ? 
        await mutationUpdate.mutateAsync({
            path: {
                id: requestQuoteId
            },
            body: data
        }) :
        await mutationPost.mutateAsync({
            body: data
        })
    }

    const reFillRequestTable = () => {
        const values = [...cargoDetailsAdded]
        
        const result = values.filter((_,index)=> !allSelectedServices.includes(index))

        setAllSelectedServices([])
        setCargoDetailsAdded(result) 

        tableRef?.resetRowSelection();
    }

    return {
        allSelectedServices,
        cargoDetailsAdded,
        editingRowIndex,
        members,
        customers,
        isLoadingCustomers,
        cities,
        isLoadingCities,
        packages,
        // products,
        HsCodes,
        rowDraftRef,
        queryClient,
        handleGetRowsSelected,
        getTable,
        handleAddProducts,
        handleValidRow,
        handleCancelRow,
        onSubmit,
        reFillRequestTable,
        setCargoDetailsAdded
    }
}