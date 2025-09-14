import { Box, Button, InputLabel, MenuItem, OutlinedInput, Select, SelectChangeEvent, Stack, Typography } from "@mui/material"
import Paper from "@mui/material/Paper"
import Popover from "@mui/material/Popover"
import TextField from "@mui/material/TextField"
import CountrySelect, { CountryType } from '@components/shared/CountrySelect'
import { useState } from "react"
import { categoriesOptions, CategoryType, COUNTRIES } from '@utils/constants'
import { CreateContactViewModel } from "@features/crm/api"
import { getCategoryNames } from '@utils/functions'
import { Cancel, Save } from "@mui/icons-material"

type CreateContactPopoverProps = {
    anchorEl: HTMLButtonElement | null
    setAnchorEl: (anchorEl: HTMLButtonElement | null) => void
}

const CreateContactPopover = ({anchorEl, setAnchorEl}: CreateContactPopoverProps) => {
    const [country, setCountry] = useState<CountryType>()
    const [categories, setCategories] = useState<number[] | null>()
    const [contact, setContact] = useState<CreateContactViewModel>({
        countryCode: COUNTRIES[0].code,
        categories: []
    });

    const openPopover = Boolean(anchorEl);

    const handleSetCountry = (value: CountryType) => {
        setCountry(value)
        setContact({
            ...contact,
            countryCode: value.code
        })
    }

    const handleSetCategories = (cat?: string | number[] | null) => {

        if(typeof cat !== "string"){
            setCategories(cat)
            setContact({
                ...contact,
                categories:  getCategoryNames(cat)
            })
        }
        
    }
    
    
    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <Popover open={openPopover} anchorEl={anchorEl} onClose={handleClose}
            anchorOrigin={{
                vertical:'bottom',
                horizontal: 'left'
            }}
            slotProps={{
                paper:{
                    sx:{
                        width: '400px',
                        maxWidth: '90vw'
                    }
                }
            }}>
            <Paper sx={{backgroundColor: '#e8f9fa'}}>
                <Box pl={2} pt={2}>
                    <Typography fontWeight='bold' variant="h6">Create contact</Typography>
                </Box>
                <Stack spacing={2} p={2}>
                    <TextField size="small" />
                    <CountrySelect id="countryCode" value={country ?? COUNTRIES[0]} onChange={handleSetCountry} fullWidth />

                    <Box>
                        <InputLabel htmlFor="test-categories">Category</InputLabel>
                        <Select
                            size="small"
                            labelId="test-categories"
                            id="test-selected-categories"
                            multiple
                            value={categories ?? []} 
                            onChange={(e:SelectChangeEvent<typeof categories>)=> handleSetCategories(e.target.value)}
                            fullWidth
                            input={<OutlinedInput label="Categories" />}
                        >
                            {categoriesOptions.map((contactType: CategoryType) => (
                                <MenuItem key={contactType.value} value={contactType.value}>
                                    {contactType?.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </Box>
                </Stack>
                <Stack direction='row' justifyContent='flex-end' spacing={2} pb={2} pr={2}>
                    <Button size="small" variant="contained" color="success" startIcon={<Save />}>Save</Button>
                    <Button size="small" variant="outlined" color="error" 
                        startIcon={<Cancel />} onClick={handleClose}>Close</Button>
                    
                </Stack>
            </Paper>
        </Popover>
    )
}

export default CreateContactPopover