export interface RequestDto {
    id: number;
    whatsapp: string;
    email?: string;
    departure: string;
    arrival: string;
    status?: string|number|null|undefined;
    cargoType?: string|number;
    clientNumber?: string;
    packingType: string;
    quantity: number;
    detail: string;
    createdAt?: string;
    updatedAt?: string;
    tags: string|null,
    assigneeId: number|null;
}

export interface RequestResponseDto {
    code: number;
    message: string;
    data?: RequestDto[];
    error?: string;
}

export interface MailData {
    from: string;
    to: string;
    subject: string;
    htmlContent: string;
}

export interface DialogTitleProps {
    id: string;
    children?: React.ReactNode;
    onClose: () => void;
}
  
