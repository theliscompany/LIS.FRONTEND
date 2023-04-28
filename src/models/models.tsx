export interface RequestDto {
    id: number;
    whatsapp: string;
    email: string;
    departure: string;
    arrival: string;
    status: string|number;
    cargoType: string|number;
    quantity: number;
    detail: string;
    createdAt?: string;
    updatedAt?: string;
    tags: null|string
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
  
