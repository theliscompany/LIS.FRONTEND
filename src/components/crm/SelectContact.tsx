import { useQueryClient } from "@tanstack/react-query"
import { getContactGetContactsOptions } from "../../api/client/crm/@tanstack/react-query.gen"
import { ContactViewModel } from "../../api/client/crm"
import AutocompleteUI from "../common/AutocompleteUI"
import { useEffect, useState } from "react"

interface SelectContactProps {
    label:string
    //contactId?: number
    ContactSelected: (contact?:ContactViewModel | null) => void
}

const SelectContact = ({label, ContactSelected}: SelectContactProps) => {

    const [isLoading, setIsLoading] = useState(false)
    const [contacts, setContacts] = useState<ContactViewModel[]>([])

    const queryClient = useQueryClient()

    useEffect(() => {
        loadContacts()
    }, [])
    

    const loadContacts = async () => {
        setIsLoading(true)
        try {
          // ensureQueryData retourne les données (du cache ou de la requête)
          const data = await queryClient.ensureQueryData({
            ...getContactGetContactsOptions()
          })
    
          setContacts(data.data ?? [])
        } catch (error) {
          console.error('Erreur lors du chargement du contact', error)
        } finally {
          setIsLoading(false)
        }
    }

    // useEffect(() => {
    //     setcontact(data?.data?.find(x=>x.contactId === contactId))
    // }, [])

    return (
        <AutocompleteUI<ContactViewModel> loading={isLoading} label={label} data={contacts} 
            valueSelected={ContactSelected} getOptionLabel={(option) => option.contactName ?? ''} />
        
    )
}

export default SelectContact