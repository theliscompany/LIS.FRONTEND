

export enum EnumCategory
{
    CUSTOMERS = 1,
    SUPPLIERS = 2,
    CHARGEUR = 3,
    RECEIVER = 4,
    SHIPPING_LINES = 5,
    BANK = 10,
    SHIPPING_AGENCY = 11
}

/**
 * @deprecated - Faire le backend depuis CRM backend
 */
export let categoriesOptions: CategoryType[] = [
  { value: 1, name: "CUSTOMERS" },
  { value: 2, name: "SUPPLIERS" },
  { value: 3, name: "CHARGEUR" },
  { value: 4, name: "RECEIVER" },
  { value: 5, name: "SHIPPING_LINES" },
  { value: 6, name: "BANK" },
  { value: 7, name: "SHIPPING_AGENCY11" },
];

/**
 * @deprecated - Faire le backend depuis CRM backend
 */
export type CategoryType = {
  value: number;
  name: string
}

export let prioritiesOptions: any = [
  { label: "NORMAL", value: "NORMAL" },
  { label: "IMPORTANT", value: "IMPORTANT" },
];

export let orderStatusOptions: any = [
  { label: "ALL", value: -1, color: "default" },
  { label: "OPEN", value: 1, color: "default" },
  { label: "COMPLETED", value: 2, color: "info" },
  { label: "VALIDATED", value: 3, color: "primary" },
  { label: "CLOSED", value: 4, color: "success" },
  { label: "CANCELLED", value: 5, color: "warning" },
  { label: "DOCS-SENT", value: 6, color: "secondary" },
  { label: "PAID", value: 7, color: "success" },
];

export let orderExportOptions: any = [
  { label: "ALL", value: -1 },
  { label: "EXPORT", value: true },
  { label: "IMPORT", value: false },
];

export let incotermValues = ["FOB", "EXW", "FCA Warehouse", "CFR"];

export let incotermDestinationValues = ["CFR", "Free On Truck destination", "FOB", "FCA", "FAS", "CPT", "CIP", "DPU", "DAP", "DDP"];

export let packingOptions = ["Unit", "Bundle", "Bag", "Pallet", "Carton", "Lot", "Crate"];

export var statusTypes = [
  { type: "EnAttente", label: 'labelEnAttente', value: "En attente", description: 'descriptionEnAttente' }, 
  { type: "Valider", label: 'labelValider', value: "Validé", description: 'descriptionValider' }, 
  { type: "Rejeter", label: 'labelRejeter', value: "Rejeté", description: 'descriptionRejeter' }, 
  { type: "EnCoursDeTraitement", label: 'labelEnCoursDeTraitement', value: "En cours de traitement", description: 'descriptionEnCoursDeTraitement' }, 
  // { type: "EnTransit", label: 'labelEnTransit', value: "En transit", description: 'descriptionEnTransit' }, 
  // { type: "EnDouane", label: 'labelEnDouane', value: "En douane", description: 'descriptionEnDouane' }, 
  // { type: "LivraisonEnCours", label: 'labelLivraisonEnCours', value: "Livraison en cours", description: 'descriptionLivraisonEnCours' }, 
  // { type: "Livre", label: 'labelLivre', value: "Livré", description: 'descriptionLivre' }, 
  { type: "Annule", label: 'labelAnnule', value: "Annulé", description: 'descriptionAnnule' }, 
  // { type: "Retour", label: 'labelRetour', value: "Retourné", description: 'descriptionRetour' }, 
  { type: "Problème", label: 'labelProbleme', value: "Problème", description: 'descriptionProbleme' }, 
  // { type: "EnAttenteDeFacturation", label: 'labelEnAttenteDeFacturation', value: "En attente de facturation", description: 'descriptionEnAttenteDeFacturation' },
  // { type: "Accepted", label: 'labelValider', value: "Validé", description: 'descriptionValider' }, 
  // { type: "Rejected", label: 'labelRejeter', value: "Rejeté", description: 'descriptionRejeter' }, 
  { type: "New", label: 'labelNew', value: "Nouveau", description: 'descriptionNew' }, 
];

export const currencyOptions = [
  { code: "EUR", label: 'Euro - €' },
  { code: 'GBP', label: 'British pound - £' },
  { code: "USD", label: 'Dollar - $' },
  { code: "FCFA", label: 'Franc CFA - FCFA' }
]

export const Currency: Record<string, string> = {
  EUR: '€',
  GBP: '£',
  USD: '$',
  FCFA: 'FCFA'
}

export const haulageTypeOptions = [
  { value: "On trailer, direct loading", label: 'haulageType1' },
  { value: "On trailer, Loading with Interval", label: 'haulageType2' },
  { value: "Side loader, direct loading", label: 'haulageType3' },
  { value: "Side loader, Loading with Interval, from trailer to floor", label: 'haulageType4' },
  { value: "Side loader, Loading with Interval, from floor to trailer", label: 'haulageType5' }
];

export const languageOptions = [
  { value: "", label: "" },
  { value: "", label: "" },
];

export let allPackages = [
  {
    "packageId": 81,
    "packageName": "UNIT"
  },
  {
    "packageId": 82,
    "packageName": "BUNDLE"
  },
  {
    "packageId": 83,
    "packageName": "BAG"
  },
  {
    "packageId": 84,
    "packageName": "PALLET"
  },
  {
    "packageId": 85,
    "packageName": "CARTON"
  },
  {
    "packageId": 86,
    "packageName": "LOT"
  },
  {
    "packageId": 87,
    "packageName": "CASE"
  },
  {
    "packageId": 8,
    "packageName": "20' Dry"
  },
  {
    "packageId": 9,
    "packageName": "40' Dry"
  },
  {
    "packageId": 10,
    "packageName": "40' HC"
  },
  {
    "packageId": 11,
    "packageName": "20' VT"
  },
  {
    "packageId": 12,
    "packageName": "40' VT"
  },
  {
    "packageId": 13,
    "packageName": "20' RF"
  },
  {
    "packageId": 14,
    "packageName": "40' RF"
  },
  {
    "packageId": 15,
    "packageName": "40' HC RF"
  },
  {
    "packageId": 16,
    "packageName": "20' FL"
  },
  {
    "packageId": 17,
    "packageName": "40' FL"
  },
  {
    "packageId": 18,
    "packageName": "20' OT"
  },
  {
    "packageId": 19,
    "packageName": "40' OT"
  },
  {
    "packageId": 20,
    "packageName": "20' Tank"
  },
  {
    "packageId": 21,
    "packageName": "40' Tank"
  },
  {
    "packageId": 23,
    "packageName": "40' HC OT"
  },
];

export const containerPackages = [
    {
        "packageId": 8,
        "packageName": "20' Dry"
    },
    {
        "packageId": 9,
        "packageName": "40' Dry"
    },
    {
        "packageId": 10,
        "packageName": "40' HC"
    },
    {
        "packageId": 11,
        "packageName": "20' VT"
    },
    {
        "packageId": 12,
        "packageName": "40' VT"
    },
    {
        "packageId": 13,
        "packageName": "20' RF"
    },
    {
        "packageId": 14,
        "packageName": "40' RF"
    },
    {
        "packageId": 15,
        "packageName": "40' HC RF"
    },
    {
        "packageId": 16,
        "packageName": "20' FL"
    },
    {
        "packageId": 17,
        "packageName": "40' FL"
    },
    {
        "packageId": 18,
        "packageName": "20' OT"
    },
    {
        "packageId": 19,
        "packageName": "40' OT"
    },
    {
        "packageId": 20,
        "packageName": "20' Tank"
    },
    {
        "packageId": 21,
        "packageName": "40' Tank"
    },
    {
        "packageId": 23,
        "packageName": "40' HC OT"
    }
];


interface CountryType {
    code: string;
    label: string;
    phone: string;
    suggested?: boolean;
}

export const COUNTRIES: readonly CountryType[] = [
    { code: 'AD', label: 'Andorra', phone: '376' },
    {
      code: 'AE',
      label: 'United Arab Emirates',
      phone: '971',
    },
    { code: 'AF', label: 'Afghanistan', phone: '93' },
    {
      code: 'AG',
      label: 'Antigua and Barbuda',
      phone: '1-268',
    },
    { code: 'AI', label: 'Anguilla', phone: '1-264' },
    { code: 'AL', label: 'Albania', phone: '355' },
    { code: 'AM', label: 'Armenia', phone: '374' },
    { code: 'AO', label: 'Angola', phone: '244' },
    { code: 'AQ', label: 'Antarctica', phone: '672' },
    { code: 'AR', label: 'Argentina', phone: '54' },
    { code: 'AS', label: 'American Samoa', phone: '1-684' },
    { code: 'AT', label: 'Austria', phone: '43' },
    {
      code: 'AU',
      label: 'Australia',
      phone: '61',
      suggested: true,
    },
    { code: 'AW', label: 'Aruba', phone: '297' },
    { code: 'AX', label: 'Alland Islands', phone: '358' },
    { code: 'AZ', label: 'Azerbaijan', phone: '994' },
    {
      code: 'BA',
      label: 'Bosnia and Herzegovina',
      phone: '387',
    },
    { code: 'BB', label: 'Barbados', phone: '1-246' },
    { code: 'BD', label: 'Bangladesh', phone: '880' },
    { code: 'BE', label: 'Belgium', phone: '32' },
    { code: 'BF', label: 'Burkina Faso', phone: '226' },
    { code: 'BG', label: 'Bulgaria', phone: '359' },
    { code: 'BH', label: 'Bahrain', phone: '973' },
    { code: 'BI', label: 'Burundi', phone: '257' },
    { code: 'BJ', label: 'Benin', phone: '229' },
    { code: 'BL', label: 'Saint Barthelemy', phone: '590' },
    { code: 'BM', label: 'Bermuda', phone: '1-441' },
    { code: 'BN', label: 'Brunei Darussalam', phone: '673' },
    { code: 'BO', label: 'Bolivia', phone: '591' },
    { code: 'BR', label: 'Brazil', phone: '55' },
    { code: 'BS', label: 'Bahamas', phone: '1-242' },
    { code: 'BT', label: 'Bhutan', phone: '975' },
    { code: 'BV', label: 'Bouvet Island', phone: '47' },
    { code: 'BW', label: 'Botswana', phone: '267' },
    { code: 'BY', label: 'Belarus', phone: '375' },
    { code: 'BZ', label: 'Belize', phone: '501' },
    {
      code: 'CA',
      label: 'Canada',
      phone: '1',
      suggested: true,
    },
    {
      code: 'CC',
      label: 'Cocos (Keeling) Islands',
      phone: '61',
    },
    {
      code: 'CD',
      label: 'Congo, Democratic Republic of the',
      phone: '243',
    },
    {
      code: 'CF',
      label: 'Central African Republic',
      phone: '236',
    },
    {
      code: 'CG',
      label: 'Congo, Republic of the',
      phone: '242',
    },
    { code: 'CH', label: 'Switzerland', phone: '41' },
    { code: 'CI', label: "Cote d'Ivoire", phone: '225' },
    { code: 'CK', label: 'Cook Islands', phone: '682' },
    { code: 'CL', label: 'Chile', phone: '56' },
    { code: 'CM', label: 'Cameroon', phone: '237' },
    { code: 'CN', label: 'China', phone: '86' },
    { code: 'CO', label: 'Colombia', phone: '57' },
    { code: 'CR', label: 'Costa Rica', phone: '506' },
    { code: 'CU', label: 'Cuba', phone: '53' },
    { code: 'CV', label: 'Cape Verde', phone: '238' },
    { code: 'CW', label: 'Curacao', phone: '599' },
    { code: 'CX', label: 'Christmas Island', phone: '61' },
    { code: 'CY', label: 'Cyprus', phone: '357' },
    { code: 'CZ', label: 'Czech Republic', phone: '420' },
    {
      code: 'DE',
      label: 'Germany',
      phone: '49',
      suggested: true,
    },
    { code: 'DJ', label: 'Djibouti', phone: '253' },
    { code: 'DK', label: 'Denmark', phone: '45' },
    { code: 'DM', label: 'Dominica', phone: '1-767' },
    {
      code: 'DO',
      label: 'Dominican Republic',
      phone: '1-809',
    },
    { code: 'DZ', label: 'Algeria', phone: '213' },
    { code: 'EC', label: 'Ecuador', phone: '593' },
    { code: 'EE', label: 'Estonia', phone: '372' },
    { code: 'EG', label: 'Egypt', phone: '20' },
    { code: 'EH', label: 'Western Sahara', phone: '212' },
    { code: 'ER', label: 'Eritrea', phone: '291' },
    { code: 'ES', label: 'Spain', phone: '34' },
    { code: 'ET', label: 'Ethiopia', phone: '251' },
    { code: 'FI', label: 'Finland', phone: '358' },
    { code: 'FJ', label: 'Fiji', phone: '679' },
    {
      code: 'FK',
      label: 'Falkland Islands (Malvinas)',
      phone: '500',
    },
    {
      code: 'FM',
      label: 'Micronesia, Federated States of',
      phone: '691',
    },
    { code: 'FO', label: 'Faroe Islands', phone: '298' },
    {
      code: 'FR',
      label: 'France',
      phone: '33',
      suggested: true,
    },
    { code: 'GA', label: 'Gabon', phone: '241' },
    { code: 'GB', label: 'United Kingdom', phone: '44' },
    { code: 'GD', label: 'Grenada', phone: '1-473' },
    { code: 'GE', label: 'Georgia', phone: '995' },
    { code: 'GF', label: 'French Guiana', phone: '594' },
    { code: 'GG', label: 'Guernsey', phone: '44' },
    { code: 'GH', label: 'Ghana', phone: '233' },
    { code: 'GI', label: 'Gibraltar', phone: '350' },
    { code: 'GL', label: 'Greenland', phone: '299' },
    { code: 'GM', label: 'Gambia', phone: '220' },
    { code: 'GN', label: 'Guinea', phone: '224' },
    { code: 'GP', label: 'Guadeloupe', phone: '590' },
    { code: 'GQ', label: 'Equatorial Guinea', phone: '240' },
    { code: 'GR', label: 'Greece', phone: '30' },
    {
      code: 'GS',
      label: 'South Georgia and the South Sandwich Islands',
      phone: '500',
    },
    { code: 'GT', label: 'Guatemala', phone: '502' },
    { code: 'GU', label: 'Guam', phone: '1-671' },
    { code: 'GW', label: 'Guinea-Bissau', phone: '245' },
    { code: 'GY', label: 'Guyana', phone: '592' },
    { code: 'HK', label: 'Hong Kong', phone: '852' },
    {
      code: 'HM',
      label: 'Heard Island and McDonald Islands',
      phone: '672',
    },
    { code: 'HN', label: 'Honduras', phone: '504' },
    { code: 'HR', label: 'Croatia', phone: '385' },
    { code: 'HT', label: 'Haiti', phone: '509' },
    { code: 'HU', label: 'Hungary', phone: '36' },
    { code: 'ID', label: 'Indonesia', phone: '62' },
    { code: 'IE', label: 'Ireland', phone: '353' },
    { code: 'IL', label: 'Israel', phone: '972' },
    { code: 'IM', label: 'Isle of Man', phone: '44' },
    { code: 'IN', label: 'India', phone: '91' },
    {
      code: 'IO',
      label: 'British Indian Ocean Territory',
      phone: '246',
    },
    { code: 'IQ', label: 'Iraq', phone: '964' },
    {
      code: 'IR',
      label: 'Iran, Islamic Republic of',
      phone: '98',
    },
    { code: 'IS', label: 'Iceland', phone: '354' },
    { code: 'IT', label: 'Italy', phone: '39' },
    { code: 'JE', label: 'Jersey', phone: '44' },
    { code: 'JM', label: 'Jamaica', phone: '1-876' },
    { code: 'JO', label: 'Jordan', phone: '962' },
    {
      code: 'JP',
      label: 'Japan',
      phone: '81',
      suggested: true,
    },
    { code: 'KE', label: 'Kenya', phone: '254' },
    { code: 'KG', label: 'Kyrgyzstan', phone: '996' },
    { code: 'KH', label: 'Cambodia', phone: '855' },
    { code: 'KI', label: 'Kiribati', phone: '686' },
    { code: 'KM', label: 'Comoros', phone: '269' },
    {
      code: 'KN',
      label: 'Saint Kitts and Nevis',
      phone: '1-869',
    },
    {
      code: 'KP',
      label: "Korea, Democratic People's Republic of",
      phone: '850',
    },
    { code: 'KR', label: 'Korea, Republic of', phone: '82' },
    { code: 'KW', label: 'Kuwait', phone: '965' },
    { code: 'KY', label: 'Cayman Islands', phone: '1-345' },
    { code: 'KZ', label: 'Kazakhstan', phone: '7' },
    {
      code: 'LA',
      label: "Lao People's Democratic Republic",
      phone: '856',
    },
    { code: 'LB', label: 'Lebanon', phone: '961' },
    { code: 'LC', label: 'Saint Lucia', phone: '1-758' },
    { code: 'LI', label: 'Liechtenstein', phone: '423' },
    { code: 'LK', label: 'Sri Lanka', phone: '94' },
    { code: 'LR', label: 'Liberia', phone: '231' },
    { code: 'LS', label: 'Lesotho', phone: '266' },
    { code: 'LT', label: 'Lithuania', phone: '370' },
    { code: 'LU', label: 'Luxembourg', phone: '352' },
    { code: 'LV', label: 'Latvia', phone: '371' },
    { code: 'LY', label: 'Libya', phone: '218' },
    { code: 'MA', label: 'Morocco', phone: '212' },
    { code: 'MC', label: 'Monaco', phone: '377' },
    {
      code: 'MD',
      label: 'Moldova, Republic of',
      phone: '373',
    },
    { code: 'ME', label: 'Montenegro', phone: '382' },
    {
      code: 'MF',
      label: 'Saint Martin (French part)',
      phone: '590',
    },
    { code: 'MG', label: 'Madagascar', phone: '261' },
    { code: 'MH', label: 'Marshall Islands', phone: '692' },
    {
      code: 'MK',
      label: 'Macedonia, the Former Yugoslav Republic of',
      phone: '389',
    },
    { code: 'ML', label: 'Mali', phone: '223' },
    { code: 'MM', label: 'Myanmar', phone: '95' },
    { code: 'MN', label: 'Mongolia', phone: '976' },
    { code: 'MO', label: 'Macao', phone: '853' },
    {
      code: 'MP',
      label: 'Northern Mariana Islands',
      phone: '1-670',
    },
    { code: 'MQ', label: 'Martinique', phone: '596' },
    { code: 'MR', label: 'Mauritania', phone: '222' },
    { code: 'MS', label: 'Montserrat', phone: '1-664' },
    { code: 'MT', label: 'Malta', phone: '356' },
    { code: 'MU', label: 'Mauritius', phone: '230' },
    { code: 'MV', label: 'Maldives', phone: '960' },
    { code: 'MW', label: 'Malawi', phone: '265' },
    { code: 'MX', label: 'Mexico', phone: '52' },
    { code: 'MY', label: 'Malaysia', phone: '60' },
    { code: 'MZ', label: 'Mozambique', phone: '258' },
    { code: 'NA', label: 'Namibia', phone: '264' },
    { code: 'NC', label: 'New Caledonia', phone: '687' },
    { code: 'NE', label: 'Niger', phone: '227' },
    { code: 'NF', label: 'Norfolk Island', phone: '672' },
    { code: 'NG', label: 'Nigeria', phone: '234' },
    { code: 'NI', label: 'Nicaragua', phone: '505' },
    { code: 'NL', label: 'Netherlands', phone: '31' },
    { code: 'NO', label: 'Norway', phone: '47' },
    { code: 'NP', label: 'Nepal', phone: '977' },
    { code: 'NR', label: 'Nauru', phone: '674' },
    { code: 'NU', label: 'Niue', phone: '683' },
    { code: 'NZ', label: 'New Zealand', phone: '64' },
    { code: 'OM', label: 'Oman', phone: '968' },
    { code: 'PA', label: 'Panama', phone: '507' },
    { code: 'PE', label: 'Peru', phone: '51' },
    { code: 'PF', label: 'French Polynesia', phone: '689' },
    { code: 'PG', label: 'Papua New Guinea', phone: '675' },
    { code: 'PH', label: 'Philippines', phone: '63' },
    { code: 'PK', label: 'Pakistan', phone: '92' },
    { code: 'PL', label: 'Poland', phone: '48' },
    {
      code: 'PM',
      label: 'Saint Pierre and Miquelon',
      phone: '508',
    },
    { code: 'PN', label: 'Pitcairn', phone: '870' },
    { code: 'PR', label: 'Puerto Rico', phone: '1' },
    {
      code: 'PS',
      label: 'Palestine, State of',
      phone: '970',
    },
    { code: 'PT', label: 'Portugal', phone: '351' },
    { code: 'PW', label: 'Palau', phone: '680' },
    { code: 'PY', label: 'Paraguay', phone: '595' },
    { code: 'QA', label: 'Qatar', phone: '974' },
    { code: 'RE', label: 'Reunion', phone: '262' },
    { code: 'RO', label: 'Romania', phone: '40' },
    { code: 'RS', label: 'Serbia', phone: '381' },
    { code: 'RU', label: 'Russian Federation', phone: '7' },
    { code: 'RW', label: 'Rwanda', phone: '250' },
    { code: 'SA', label: 'Saudi Arabia', phone: '966' },
    { code: 'SB', label: 'Solomon Islands', phone: '677' },
    { code: 'SC', label: 'Seychelles', phone: '248' },
    { code: 'SD', label: 'Sudan', phone: '249' },
    { code: 'SE', label: 'Sweden', phone: '46' },
    { code: 'SG', label: 'Singapore', phone: '65' },
    { code: 'SH', label: 'Saint Helena', phone: '290' },
    { code: 'SI', label: 'Slovenia', phone: '386' },
    {
      code: 'SJ',
      label: 'Svalbard and Jan Mayen',
      phone: '47',
    },
    { code: 'SK', label: 'Slovakia', phone: '421' },
    { code: 'SL', label: 'Sierra Leone', phone: '232' },
    { code: 'SM', label: 'San Marino', phone: '378' },
    { code: 'SN', label: 'Senegal', phone: '221' },
    { code: 'SO', label: 'Somalia', phone: '252' },
    { code: 'SR', label: 'Suriname', phone: '597' },
    { code: 'SS', label: 'South Sudan', phone: '211' },
    {
      code: 'ST',
      label: 'Sao Tome and Principe',
      phone: '239',
    },
    { code: 'SV', label: 'El Salvador', phone: '503' },
    {
      code: 'SX',
      label: 'Sint Maarten (Dutch part)',
      phone: '1-721',
    },
    {
      code: 'SY',
      label: 'Syrian Arab Republic',
      phone: '963',
    },
    { code: 'SZ', label: 'Swaziland', phone: '268' },
    {
      code: 'TC',
      label: 'Turks and Caicos Islands',
      phone: '1-649',
    },
    { code: 'TD', label: 'Chad', phone: '235' },
    {
      code: 'TF',
      label: 'French Southern Territories',
      phone: '262',
    },
    { code: 'TG', label: 'Togo', phone: '228' },
    { code: 'TH', label: 'Thailand', phone: '66' },
    { code: 'TJ', label: 'Tajikistan', phone: '992' },
    { code: 'TK', label: 'Tokelau', phone: '690' },
    { code: 'TL', label: 'Timor-Leste', phone: '670' },
    { code: 'TM', label: 'Turkmenistan', phone: '993' },
    { code: 'TN', label: 'Tunisia', phone: '216' },
    { code: 'TO', label: 'Tonga', phone: '676' },
    { code: 'TR', label: 'Turkey', phone: '90' },
    {
      code: 'TT',
      label: 'Trinidad and Tobago',
      phone: '1-868',
    },
    { code: 'TV', label: 'Tuvalu', phone: '688' },
    {
      code: 'TW',
      label: 'Taiwan',
      phone: '886',
    },
    {
      code: 'TZ',
      label: 'United Republic of Tanzania',
      phone: '255',
    },
    { code: 'UA', label: 'Ukraine', phone: '380' },
    { code: 'UG', label: 'Uganda', phone: '256' },
    {
      code: 'US',
      label: 'United States',
      phone: '1',
      suggested: true,
    },
    { code: 'UY', label: 'Uruguay', phone: '598' },
    { code: 'UZ', label: 'Uzbekistan', phone: '998' },
    {
      code: 'VA',
      label: 'Holy See (Vatican City State)',
      phone: '379',
    },
    {
      code: 'VC',
      label: 'Saint Vincent and the Grenadines',
      phone: '1-784',
    },
    { code: 'VE', label: 'Venezuela', phone: '58' },
    {
      code: 'VG',
      label: 'British Virgin Islands',
      phone: '1-284',
    },
    {
      code: 'VI',
      label: 'US Virgin Islands',
      phone: '1-340',
    },
    { code: 'VN', label: 'Vietnam', phone: '84' },
    { code: 'VU', label: 'Vanuatu', phone: '678' },
    { code: 'WF', label: 'Wallis and Futuna', phone: '681' },
    { code: 'WS', label: 'Samoa', phone: '685' },
    { code: 'XK', label: 'Kosovo', phone: '383' },
    { code: 'YE', label: 'Yemen', phone: '967' },
    { code: 'YT', label: 'Mayotte', phone: '262' },
    { code: 'ZA', label: 'South Africa', phone: '27' },
    { code: 'ZM', label: 'Zambia', phone: '260' },
    { code: 'ZW', label: 'Zimbabwe', phone: '263' },
];

export let dataServices: any  = [
  {
    "serviceName": "Terminal Handling Charges (TH...",
    "quantity": 1,
    "unitPrice": 190,
    "SubTotal": 190,
    "contactName": "BURGER  LINERAGENCIES",
    "tag": "0a22e4ca-4c07-4274-8304-06192839c683",
    "HasVoucher": true,
    "HasInvoice": false,
    "comment": "",
    "SubTotalContact": 2402.5
  },
  {
    "serviceName": "Forwarding Agents Commission ...",
    "quantity": 1,
    "unitPrice": -37.5,
    "SubTotal": -37.5,
    "contactName": "BURGER  LINERAGENCIES",
    "tag": "a47c2c10-e675-4eff-8782-37d68bd4c877",
    "HasVoucher": true,
    "HasInvoice": false,
    "comment": "",
    "SubTotalContact": 2402.5
  },
  {
    "serviceName": "Bunker Adjustment Factor (BAF...",
    "quantity": 1,
    "unitPrice": 700,
    "SubTotal": 700,
    "contactName": "BURGER  LINERAGENCIES",
    "tag": "58b9fcc6-bcad-4fec-a6a0-465c3705d7c4",
    "HasVoucher": true,
    "HasInvoice": false,
    "comment": "",
    "SubTotalContact": 2402.5
  },
  {
    "serviceName": "BL fee",
    "quantity": 1,
    "unitPrice": 35,
    "SubTotal": 35,
    "contactName": "BURGER  LINERAGENCIES",
    "tag": "1684de1a-c50c-4a57-80fb-4fc3e2dfecca",
    "HasVoucher": true,
    "HasInvoice": false,
    "comment": "",
    "SubTotalContact": 2402.5
  },
  {
    "serviceName": "International Shipping Port S...",
    "quantity": 1,
    "unitPrice": 15,
    "SubTotal": 15,
    "contactName": "BURGER  LINERAGENCIES",
    "tag": "4dc98bd1-be31-4027-9e6d-826ec337bca1",
    "HasVoucher": true,
    "HasInvoice": false,
    "comment": "",
    "SubTotalContact": 2402.5
  },
  {
    "serviceName": "Oceanfreight",
    "quantity": 1,
    "unitPrice": 1500,
    "SubTotal": 1500,
    "contactName": "BURGER  LINERAGENCIES",
    "tag": "1df3a32a-76a7-4c0c-b28d-a552ab7a12cf",
    "HasVoucher": true,
    "HasInvoice": false,
    "comment": "",
    "SubTotalContact": 2402.5
  },
  {
    "serviceName": "Container positioning",
    "quantity": 1,
    "unitPrice": 265,
    "SubTotal": 265,
    "contactName": "HERMES TRANS BVBA",
    "tag": "c1e4cfe3-a879-4d4c-9724-d4499f3e3b6a",
    "HasVoucher": true,
    "HasInvoice": false,
    "comment": "",
    "SubTotalContact": 530
  },
  {
    "serviceName": "Container positioning",
    "quantity": 1,
    "unitPrice": 265,
    "SubTotal": 265,
    "contactName": "HERMES TRANS BVBA",
    "tag": "60e6044b-cf1f-4f36-b770-fc06a5b06028",
    "HasVoucher": true,
    "HasInvoice": false,
    "comment": "",
    "SubTotalContact": 530
  },
  {
    "serviceName": "Electronic Cargo Tracking Not...",
    "quantity": 1,
    "unitPrice": 55,
    "SubTotal": 55,
    "contactName": "PHOENIX EUROPE EXPRESS SA",
    "tag": "554e7047-46d4-4579-a8b1-6c3eeafc5581",
    "HasVoucher": true,
    "HasInvoice": false,
    "comment": "",
    "SubTotalContact": 55
  },
  {
    "serviceName": "S.O. Container, used, accepte...",
    "quantity": 1,
    "unitPrice": 1130,
    "SubTotal": 1130,
    "contactName": "RALTON TRADING & FORWARDING B...",
    "tag": "fd68720f-54f8-45a6-ae54-961d172574ca",
    "HasVoucher": true,
    "HasInvoice": false,
    "comment": "",
    "SubTotalContact": 1130
  },
  {
    "serviceName": "Customs formalities",
    "quantity": 1,
    "unitPrice": 25,
    "SubTotal": 25,
    "contactName": "THEO MACHTELYNCK & FILS",
    "tag": "c47b3f0e-8af6-444a-a80a-0416a116ee31",
    "HasVoucher": true,
    "HasInvoice": false,
    "comment": "",
    "SubTotalContact": 75
  },
  {
    "serviceName": "Customs formalities",
    "quantity": 1,
    "unitPrice": 50,
    "SubTotal": 50,
    "contactName": "THEO MACHTELYNCK & FILS",
    "tag": "c76b5542-65b0-4032-af7e-170012cbada6",
    "HasVoucher": true,
    "HasInvoice": false,
    "comment": "",
    "SubTotalContact": 75
  }
];

export let dataServices2 = [
  {
      "serviceName": "Customs formalities",
      "quantity": 2,
      "unitPrice": 50,
      "SubTotal": 100,
      "contactName": "AFEEX INTERNATIONAL SPRL",
      "tag": "39bc4b18-915c-48a5-8e0c-a7a4be3c1fcc",
      "HasVoucher": false,
      "HasInvoice": true,
      "comment": "",
      "SubTotalContact": 0
  },
  {
      "serviceName": "Oceanfreight",
      "quantity": 1,
      "unitPrice": 3475,
      "SubTotal": 3475,
      "contactName": "AFEEX INTERNATIONAL SPRL",
      "tag": "4c49fa69-cbc4-4dfd-911e-cd57a6aad5e3",
      "HasVoucher": false,
      "HasInvoice": true,
      "comment": "",
      "SubTotalContact": 0
  },
  {
      "serviceName": "S.O. Container, used, accepte...",
      "quantity": 1,
      "unitPrice": 1350,
      "SubTotal": 1350,
      "contactName": "AFEEX INTERNATIONAL SPRL",
      "tag": "4cc8fbd5-fcdb-411c-9a04-dedf08ff4e44",
      "HasVoucher": false,
      "HasInvoice": true,
      "comment": "",
      "SubTotalContact": 0
  }
]