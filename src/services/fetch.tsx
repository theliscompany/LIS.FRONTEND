import { AccountInfo, AuthenticationResult, IPublicClientApplication } from '@azure/msal-browser';
import { loginRequest } from '../authConfig';

export const GetToken = (instance:IPublicClientApplication,account: AccountInfo): Promise<AuthenticationResult> => {
    
    return instance.acquireTokenSilent({
        scopes: loginRequest.scopes,
        account: account
    })

}

export class BackendService<T> {
    private accessToken?: string;
    protected jsonParseReviver: ((key: string, value: any) => any) | undefined = undefined;

    constructor(accessToken?: string) {
        this.accessToken = accessToken;
    }

    private getOption = ():RequestInit => {

        const authorization = "Bearer " + this.accessToken;
        return {
            method: "GET",
            headers: {
                "Accept": "application/json",
                "Authorization": authorization
            }
        };
    }

    get = (url:string): Promise<T[] | null> => {

        url = url.replace(/[?&]$/, "");

        const authorization = "Bearer " + this.accessToken;
        let options_: RequestInit = this.getOption();

        return fetch(url, options_).then((_response: Response) => {
            return this.processGetRequest(_response);
        });
    }

    getSingle = (url:string): Promise<T | null> => {

        url = url.replace(/[?&]$/, "");

        const authorization = "Bearer " + this.accessToken;
        let options_: RequestInit = this.getOption();

        return fetch(url, options_).then((_response: Response) => {
            return this.processGetSignleRequest(_response);
        });
    }

    

    post = (url: string, model: T): Promise<FileResponse | null> => {
        url = url.replace(/[?&]$/, "");

        const authorization = "Bearer " + this.accessToken;

        const content_ = JSON.stringify(model);

        let options_ : RequestInit = {
            body: content_,
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "Authorization": authorization
            }
        };

        return fetch(url, options_).then((_response: Response) => {
            return this.processPostRequests(_response);
        });
    }

    protected processGetRequest(response: Response): Promise<T[] | null> {
        const status = response.status;
        let _headers: any = {}; if (response.headers && response.headers.forEach) { response.headers.forEach((v: any, k: any) => _headers[k] = v); };
        if (status === 200) {
            return response.text().then((_responseText) => {
            let result200: T[] | null = null;
            let resultData200 = _responseText === "" ? null : JSON.parse(_responseText, this.jsonParseReviver);
            if (Array.isArray(resultData200)) {
                result200 = [...resultData200]
            }
            
            return result200;
            });
        } else if (status !== 200 && status !== 204) {
            return response.text().then((_responseText) => {
            return throwException("An unexpected server error occurred.", status, _responseText, _headers);
            });
        }
        return Promise.resolve<T[] | null>(null);
    }

    protected processGetSignleRequest(response: Response): Promise<T | null> {
        const status = response.status;
        let _headers: any = {}; if (response.headers && response.headers.forEach) { response.headers.forEach((v: any, k: any) => _headers[k] = v); };
        if (status === 200) {
            return response.text().then((_responseText) => {
            return _responseText === "" ? null : JSON.parse(_responseText, this.jsonParseReviver);
            });
        } else if (status !== 200 && status !== 204) {
            return response.text().then((_responseText) => {
            return throwException("An unexpected server error occurred.", status, _responseText, _headers);
            });
        }
        return Promise.resolve<T | null>(null);
    }

    protected processPostRequests(response: Response): Promise<FileResponse | null> {
        const status = response.status;
        let _headers: any = {}; if (response.headers && response.headers.forEach) { response.headers.forEach((v: any, k: any) => _headers[k] = v); };
        if (status === 200 || status === 206) {
            const contentDisposition = response.headers ? response.headers.get("content-disposition") : undefined;
            const fileNameMatch = contentDisposition ? /filename="?([^"]*?)"?(;|$)/g.exec(contentDisposition) : undefined;
            const fileName = fileNameMatch && fileNameMatch.length > 1 ? fileNameMatch[1] : undefined;
            return response.blob().then(blob => { return { fileName: fileName, data: blob, status: status, headers: _headers }; });
        } else if (status !== 200 && status !== 204) {
            return response.text().then((_responseText) => {
            return throwException("An unexpected server error occurred.", status, _responseText, _headers);
            });
        }

        return Promise.resolve<FileResponse | null>(null);
    }
}

export class ApiException extends Error {
    message: string;
    status: number;
    response: string;
    headers: { [key: string]: any; };
    result: any;

    constructor(message: string, status: number, response: string, headers: { [key: string]: any; }, result: any) {
        super();

        this.message = message;
        this.status = status;
        this.response = response;
        this.headers = headers;
        this.result = result;
    }

    protected isApiException = true;

    static isApiException(obj: any): obj is ApiException {
        return obj.isApiException === true;
    }
}

function throwException(message: string, status: number, response: string, headers: { [key: string]: any; }, result?: any): any {
    throw new ApiException(message, status, response, headers, result);
}

export interface FileResponse {
    data: Blob;
    status: number;
    fileName?: string;
    headers?: { [name: string]: any };
}
