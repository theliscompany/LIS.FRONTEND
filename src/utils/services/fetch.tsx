export class BackendService<T> {
    private accessToken?: string;
    protected jsonParseReviver: ((key: string, value: any) => any) | undefined = undefined;
    

    constructor(accessToken?: string) {
        this.accessToken = accessToken;
    }

    private getOption = (): RequestInit => {
        const authorization = "Bearer " + this.accessToken;
        return {
            method: "GET",
            headers: {
                "Accept": "application/json",
                "Authorization": authorization
            }
        };
    }

    private deleteOption = (): RequestInit => {
        const authorization = "Bearer " + this.accessToken;
        return {
            method: "DELETE",
            headers: {
                "Authorization": authorization
            }
        };
    }

    private getOptionWithParamsToken = (token: string): RequestInit => {
        const authorization = "Bearer " + token;
        return {
            method: "GET",
            headers: {
                "Accept": "application/json",
                "Authorization": authorization
            }
        };
    }

    getWithToken = async (url: string, token: string): Promise<T | null> => {
        url = url.replace(/[?&]$/, "");

        let options_: RequestInit = this.getOptionWithParamsToken(token);

        return fetch(url, options_).then((_response: Response) => {
            return this.processGetSingleRequest(_response);
        });
    }

    get = (url: string): Promise<T[] | null> => {
        url = url.replace(/[?&]$/, "");

        let options_: RequestInit = this.getOption();

        return fetch(url, options_).then((_response: Response) => {
            return this.processGetRequest(_response);
        });
    }

    getSingle = (url: string): Promise<T | null> => {
        url = url.replace(/[?&]$/, "");

        //const authorization = "Bearer " + this.accessToken;
        let options_: RequestInit = this.getOption();

        return fetch(url, options_).then((_response: Response) => {
            return this.processGetSingleRequest(_response);
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

    postForm = (url: string, model: any): Promise<FileResponse | null> => {
        url = url.replace(/[?&]$/, "");
    
        const authorization = "Bearer " + this.accessToken;
    
        const formData = new FormData();
        for (const [key, value] of Object.entries(model)) {
            if (value !== null && value !== undefined) {
                if (typeof value === "string" || value instanceof Blob) {
                    formData.append(key, value);
                }
            }
        }
        //console.log(formData);
        
        let options_: RequestInit = {
            body: formData,
            method: "POST",
            headers: {
                "Authorization": authorization
            }
        };
    
        return fetch(url, options_).then((_response: Response) => {
            return this.processPostRequests(_response);
        });
    }     

    postWithToken = (url: string, model: T, accessToken: string): Promise<FileResponse | null> => {
        if(!accessToken) return Promise.reject<null>("Access token is not valid!");

        url = url.replace(/[?&]$/, "");

        const authorization = "Bearer " + accessToken;

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

    postBasic = (url: string, model: T): Promise<FileResponse | null> => {
        url = url.replace(/[?&]$/, "");

        const content_ = JSON.stringify(model);

        let options_ : RequestInit = {
            body: content_,
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            }
        };

        return fetch(url, options_).then((_response: Response) => {
            return this.processPostRequests(_response);
        });
    } 
    
    postReturnJson = (url: string, model: T): Promise<any | null> => {
        url = url.replace(/[?&]$/, "");

        const content_ = JSON.stringify(model);

        let options_ : RequestInit = {
            body: content_,
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            }
        };

        return fetch(url, options_).then(response => response.json()).then((_response: Response) => {
            return _response;
        });
    } 
    
    put = (url: string, model: T): Promise<FileResponse | null> => {
        url = url.replace(/[?&]$/, "");

        const authorization = "Bearer " + this.accessToken;

        const content_ = JSON.stringify(model);

        let options_ : RequestInit = {
            body: content_,
            method: "PUT",
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

    putWithToken = (url: string, model: T, accessToken: string): Promise<FileResponse | null> => {
        if(!accessToken) return Promise.reject<null>("Access token is not valid!");

        url = url.replace(/[?&]$/, "");

        const authorization = "Bearer " + accessToken;

        const content_ = JSON.stringify(model);

        let options_ : RequestInit = {
            body: content_,
            method: "PUT",
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

    delete = (url: string): Promise<T | null> => {
        url = url.replace(/[?&]$/, "");

        //const authorization = "Bearer " + this.accessToken;
        let options_: RequestInit = this.deleteOption();

        return fetch(url, options_).then((_response: Response) => {
            return this.processGetSingleRequest(_response);
        });
    }

    deleteWithToken = (url: string, accessToken: string): Promise<T | null> => {
        if(!accessToken) return Promise.reject<null>("Access token is not valid!");
        
        url = url.replace(/[?&]$/, "");

        const authorization = "Bearer " + accessToken;
        let options_: RequestInit = {
            method: "DELETE",
            headers: {
                "Authorization": authorization
            }
        }

        return fetch(url, options_).then((_response: Response) => {
            return this.processGetSingleRequest(_response);
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
        } 
        else if (status !== 200 && status !== 204) {
            return response.text().then((_responseText) => {
                return throwException("An unexpected server error occurred.", status, _responseText, _headers);
            });
        }
        return Promise.resolve<T[] | null>(null);
    }

    protected processGetSingleRequest(response: Response): Promise<T | null> {
        const status = response.status;
        let _headers: any = {}; if (response.headers && response.headers.forEach) { response.headers.forEach((v: any, k: any) => _headers[k] = v); };
        if (status === 200) {
            return response.text().then((_responseText) => {
                return _responseText === "" ? null : JSON.parse(_responseText, this.jsonParseReviver);
            });
        } 
        else if (status !== 200 && status !== 204) {
            return response.text().then((_responseText) => {
                return throwException("An unexpected server error occurred.", status, _responseText, _headers);
            });
        }
        return Promise.resolve<T | null>(null);
    }

    protected processPostRequests(response: Response): Promise<FileResponse | null> {
        const status = response.status;
        let _headers: any = {}; if (response.headers && response.headers.forEach) { response.headers.forEach((v: any, k: any) => _headers[k] = v); };
        if (status === 200 || status === 201 || status === 206) {
            const contentDisposition = response.headers ? response.headers.get("content-disposition") : undefined;
            const fileNameMatch = contentDisposition ? /filename="?([^"]*?)"?(;|$)/g.exec(contentDisposition) : undefined;
            const fileName = fileNameMatch && fileNameMatch.length > 1 ? fileNameMatch[1] : undefined;
            return response.blob().then(blob => { return { fileName: fileName, data: blob, status: status, headers: _headers }; });
        } 
        else if (status !== 200 && status !== 201 && status !== 204) {
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
    code?: number;
    fileName?: string;
    headers?: { [name: string]: any };
}
