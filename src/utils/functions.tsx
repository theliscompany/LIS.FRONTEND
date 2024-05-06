import React from "react";
import { AuthenticationResult } from "@azure/msal-browser";
import { t } from "i18next";

function removeAccents(input: string) {
    return input.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

export const calculateDistance = (coord1: any, coord2: any) => {
    const [lat1, lon1] = coord1;
    const [lon2, lat2] = coord2;
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance;
}

export const findClosestSeaPort = (myPort: any, seaPorts: any) => {
    const myCoordinates = [myPort.latitude, myPort.longitude];
    let closestPort = null;
    let minDistance = Infinity;
    
    if (seaPorts !== null && seaPorts !== undefined) {
        const matchingNamePort = seaPorts.find((seaPort: any) => seaPort.portName.toUpperCase() === removeAccents(myPort.city).toUpperCase());
        if (matchingNamePort) {
            return matchingNamePort;
        }
    }

    for (const seaPort of seaPorts) {
        const seaPortCoordinates = seaPort.coordinates;
        if (seaPortCoordinates !== undefined) {
            const distance = calculateDistance(myCoordinates, seaPortCoordinates);
            
            if (distance < minDistance) {
                minDistance = distance;
                closestPort = seaPort;
            }
        }
    }

    return closestPort;
}

export function sortByCloseness(myPort: any, seaPorts: any) {
    const myCoordinates = [myPort.latitude, myPort.longitude];

    // Calculate distances and add them to the sea ports
    seaPorts.forEach((seaPort: any) => {
        const seaPortCoordinates = seaPort.coordinates;
        if (seaPortCoordinates !== undefined) {
            const distance = calculateDistance(myCoordinates, seaPortCoordinates);
            seaPort.distance = distance; // Add the distance to each sea port
        } else {
            seaPort.distance = Infinity; // Ports without coordinates are considered farthest
        }
    });

    // Sort the sea ports by distance
    seaPorts.sort((a: any, b: any) => a.distance - b.distance);

    // Remove the "distance" property from the sorted ports
    seaPorts.forEach((seaPort: any) => {
        delete seaPort.distance;
    });

    return seaPorts;
}

export function generateRandomNumber() {
    const maxNumbers = 100000;
    const randomNumber = Math.floor(Math.random() * maxNumbers) + 1;
    const bias = 0.01; // adjust this value to change the probability of getting the same number
    const previousNumber = sessionStorage.getItem('previousNumber');
  
    if (previousNumber && Math.random() < bias) {
      const offset = Math.floor(Math.random() * (maxNumbers - 1)) + 1;
      return Number(previousNumber + offset) % maxNumbers || maxNumbers;
    }
  
    sessionStorage.setItem('previousNumber', String(randomNumber));
    return randomNumber;
}

export function similar(str1: string, str2: string) {
    const cleanStr1 = str1.replace(/[\s-]/g, '').toLowerCase();
    const cleanStr2 = str2.replace(/[\s-]/g, '').toLowerCase();

    return cleanStr1 === cleanStr2;
}
   
export function compareServices (a: any, b: any) {
    let nameA = a.serviceName.toLowerCase(); // ignore upper and lowercase
    let nameB = b.serviceName.toLowerCase(); // ignore upper and lowercase
    if (nameA < nameB) {
        return -1;
    }
    if (nameA > nameB) {
        return 1;
    }
  
    // names must be equal
    return 0;
}

export function complexEquality(str1: string, str2: string) {
    return str1.includes(str2) || str2.includes(str1);
}
   
export function formatObject(obj: any) {
    const packageName = obj.container.packageName;
    const totalPrice = obj.services.reduce((sum: number, service: any) => sum + service.price, 0);
    return `${packageName} : ${totalPrice}`;
}

export function formatServices(obj: any, currency: string, targetPackageName: string, qty: number) {
    if (obj.container.packageName === targetPackageName) {
        const servicesList = obj.services.map((service: any, index: number) => (
            <React.Fragment key={"someservice"+index}>
                <span>- {service.serviceName} : {qty !== 0 ? qty+"x" : null}{service.price} {currency}</span>
                {index !== obj.services.length - 1 && <br />} {/* Add <br /> except for the last item */}
            </React.Fragment>
        ));
        return servicesList;
    } else {
        return null; // Return null if the package name doesn't match
    }
}

export function calculateTotal(data: any) {
    // Initialize total price and package name
    let total = 0;
    let packageName;

    // Loop through the data
    for(let i = 0; i < data.length; i++) {
        // If packageName is not set, set it to the first one
        if(!packageName) {
            packageName = data[i].container.packageName !== null ? data[i].container.packageName : "Général";
        }

        // Loop through the services in the current data object
        for(let j = 0; j < data[i].services.length; j++) {
            // Add the price of the service to the total
            total += data[i].services[j].price;
        }
    }

    // Return the package name and total price in the desired format
    return packageName + ' : ' + total;
}

export function getTotalNumber(data: any) {
    // Initialize total price and package name
    let total = 0;
    let packageName;

    // Loop through the data
    for(let i = 0; i < data.length; i++) {
        // If packageName is not set, set it to the first one
        if(!packageName) {
            packageName = data[i].container.packageName !== null ? data[i].container.packageName : "Général";
        }

        // Loop through the services in the current data object
        for(let j = 0; j < data[i].services.length; j++) {
            // Add the price of the service to the total
            total += data[i].services[j].price;
        }
    }

    // Return the package name and total price in the desired format
    return Number(total);
}

export function getServicesTotal(data: any, currency: string, margin: number) {
    let services = [];

    // Loop through the data
    for(let i = 0; i < data.length; i++) {
        // Loop through the services in the current data object
        for(let j = 0; j < data[i].services.length; j++) {
            let service = data[i].services[j];
            services.push(`${service.serviceName} : ${(service.price*(1+margin/100)).toFixed(2)} ${currency}`);
        }
    }

    // Return the services and their total price in the desired format
    return services.join('; ');
}

export function getServicesTotal2(data: any, currency: string, quantity: number) {
    let services = [];
    // console.log(data);
    // Loop through the data
    for(let i = 0; i < data.length; i++) {
        // Loop through the services in the current data object
        for(let j = 0; j < data[i].services.length; j++) {
            let service = data[i].services[j];
            services.push(`${service.serviceName} : ${quantity}x${service.price} ${currency}`);
        }
    }

    // Return the services and their total price in the desired format
    return services.join('; ');
}

export function getServices(data: any, currency: string) {
    let services = [];

    // Loop through the data
    for(let i = 0; i < data.length; i++) {
        // Loop through the services in the current data object
        for(let j = 0; j < data[i].services.length; j++) {
            let service = data[i].services[j];
            services.push(`${service.serviceName}`);
        }
    }

    // Return the services and their total price in the desired format
    return services.join('; ');
}

export function myServices(data: any) {
    let services = [];

    // Loop through the data
    for(let i = 0; i < data.length; i++) {
        // Loop through the services in the current data object
        for(let j = 0; j < data[i].services.length; j++) {
            let service = data[i].services[j];
            services.push(service);
        }
    }

    // Return the services
    return services;
}

export function removeDuplicatesWithLatestUpdated(data: any) {
    const latestElements:any = {};

    for (const item of data) {
        const key = `${item.haulierName}_${item.loadingPort}`;
        if (!latestElements[key] || (item.updated && (!latestElements[key].updated || item.updated > latestElements[key].updated))) {
            latestElements[key] = item;
        }
    }

    return Object.values(latestElements);
}

export function checkCarrierConsistency(array: any) {
    if (array.length === 0) {
        return true; // If the array is empty, there's nothing to compare
    }
  
    const firstElement = array[0];
    const firstCarrierName = firstElement.carrierName;
    const firstCarrierAgentName = firstElement.carrierAgentName;
  
    for (let i = 1; i < array.length; i++) {
        const currentElement = array[i];
        if (
            currentElement.carrierName !== firstCarrierName ||
            currentElement.carrierAgentName !== firstCarrierAgentName
        ) {
            return false; // Found a mismatch, not all elements have the same carrierName & carrierAgentName
        }
    }
  
    return true; // All elements have the same carrierName & carrierAgentName
}

export function checkDifferentDefaultContainer(array: any) {
    const containerSet = new Set();
  
    for (const element of array) {
        const defaultContainer = element.defaultContainer;
    
        if (containerSet.has(defaultContainer)) {
            return false; // Found a duplicate defaultContainer, not all elements have different defaultContainer
        }
    
        containerSet.add(defaultContainer);
    }
  
    return true; // All elements have different defaultContainer
}

export function parseLocation(inputString: string) {
    const parts = inputString.split(', ');
    
    const city = parts[0];
    const country = parts[1];
    const latitude = parseFloat(parts[2]);
    const longitude = parseFloat(parts[3]);
    const postalCode = parts[4] || null; 
    
    const locationObject = {
        city: city,
        country: country,
        latitude: latitude,
        longitude: longitude,
        postalCode: postalCode
    };
    
    return locationObject;
}

export function parseLocation2(inputString: string) {
    const parts = inputString.split(', ');
    
    const city = parts[0];
    const country = parts[1];
    const postalCode = parts[2] || null; 
    
    const locationObject = {
        city: city,
        country: country,
        postalCode: postalCode
    };
    
    return locationObject;
}

export function parseContact(inputString: string) {
    const parts = inputString.split(', ');
    
    const number = parts[0];
    const name = parts[1];
    
    const contactObject = {
        contactNumber: number,
        contactName: name,
    };
    
    return contactObject;
}

// export function displayContainers(value: any) {
//     var aux = value.map((elm: any) => '<li>'+elm.quantity+"x"+elm.container+'</li>').join('');
//     return '<ul>'+aux+'</ul>';
// }

export function extractCityAndPostalCode(inputString: string) {
    const parts = inputString.split(', ');
    if (parts.length >= 3) {
        const city = parts[0];
        const country = parts[1];
        const postalCode = parts[2];
        return `${city} ${postalCode}`;
    } 
    else {
        const city = parts[0];
        return city; // Return the original string if the format is not as expected
    }
}

export function transformArray(arr: any) {
    return arr.map((item: any) => ({
        container: item.containers[0],
        services: [{
            serviceId: item.service.serviceId,
            serviceName: item.service.serviceName,
            price: item.service.price
        }]
    }));
}

export function reverseTransformArray(arr: any) {
    return arr.map((item: any) => ({
        serviceId: item.services[0].serviceId,
        serviceName: item.services[0].serviceName,
        price: item.services[0].price,
        containers: [item.container]
    }));
}

export const flattenData = (data: any) => {
    return data.map((item: any) => ({
        id: item.seaFreightServiceId, // DataGrid requires a unique 'id' for each row
        serviceName: item.service.serviceName,
        serviceId: item.service.serviceId,
        price: item.service.price,
        container: item.containers.map((container: any) => container.packageName).join(', '), // Join container names if multiple
    }));
}

export const flattenData2 = (data: any) => {
    return data.map((item: any, index: number) => ({
        id: 'item.miscellaneousServiceId'+index, // DataGrid requires a unique 'id' for each row
        serviceName: item.serviceName,
        serviceId: item.serviceId,
        price: item.price,
        container: item.containers.map((container: any) => container.packageName).join(', '), // Join container names if multiple
    }));
}

// Turn a string to a number, useful for haulages id
export function hashCode(str: string) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash) + str.charCodeAt(i);
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
}

function soundex(word: string) {
    // Convert the word to uppercase and remove any non-alphabetic characters
    word = word.toUpperCase().replace(/[^A-Z]/g, '');

    // Map each letter to its Soundex code
    const codeMap: any = {
        'BFPV': 1,
        'CGJKQSXZ': 2,
        'DT': 3,
        'L': 4,
        'MN': 5,
        'R': 6
    };

    // Initialize the Soundex string with the first letter
    let soundex = word.charAt(0);

    // Iterate over the rest of the word
    let i = 1;
    while (i < word.length) {
        // Get the current character and its code
        const char = word.charAt(i);
        const code = codeMap[char];

        // Handle special cases
        if (char === 'H' || char === 'W') {
            // If the previous character is the same, skip this character
            if (char === word.charAt(i - 1)) {
                i++;
                continue;
            }
            // If the previous character is a vowel, skip this character
            if ('AEIOU'.indexOf(word.charAt(i - 1)) !== -1) {
                i++;
                continue;
            }
        }

        // If the character is a valid code and is different from the previous code
        if (code && code !== codeMap[word.charAt(i - 1)]) {
            // Add the code to the Soundex string
            soundex += code;
        }

        // Move to the next character
        i++;
    }

    // Remove any non-numeric characters
    soundex = soundex.replace(/[^\d]/g, '');

    // Pad with zeros to ensure a length of 4
    soundex = soundex.padEnd(4, '0');

    // Cut off any excess characters
    soundex = soundex.substring(0, 4);

    return soundex;
}

function metaphone(word: string) {
    // Map each character to its Metaphone code
    const codeMap: any = {
        'A': 'A',
        'E': 'A',
        'I': 'A',
        'O': 'A',
        'U': 'A',
        'B': 'P',
        'F': 'F',
        'P': 'F',
        'V': 'F',
        'C': 'K',
        'G': 'K',
        'J': 'K',
        'K': 'K',
        'Q': 'K',
        'S': 'K',
        'X': 'K',
        'Z': 'K',
        'D': 'T',
        'T': 'T',
        'L': 'L',
        'M': 'M',
        'N': 'N',
        'R': 'R',
        'H': 'H',
        'W': 'W',
        'Y': 'Y'
    };

    // Convert the word to uppercase
    word = word.toUpperCase();

    // Initialize the Metaphone string
    let metaphone = '';

    // Iterate over the word
    for (let i = 0; i < word.length; i++) {
        // Get the current character and its code
        const char = word.charAt(i);
        const code = codeMap[char];

        // If the character is a valid code
        if (code) {
            // Add the code to the Metaphone string
            metaphone += code;
        }

        // Handle special cases
        if (char === 'C') {
            // If the next character is 'H' or 'K', replace the code with 'X'
            if (i + 1 < word.length && (word.charAt(i + 1) === 'H' || word.charAt(i + 1) === 'K')) {
                metaphone = metaphone.substring(0, metaphone.length - 1) + 'X';
                i++;
            }
        } else if (char === 'G') {
            // If the next character is 'H' or 'N', replace the code with 'K'
            if (i + 1 < word.length && (word.charAt(i + 1) === 'H' || word.charAt(i + 1) === 'N')) {
                metaphone = metaphone.substring(0, metaphone.length - 1) + 'K';
                i++;
            }
        } else if (char === 'P') {
            // If the next character is 'H', replace the code with 'F'
            if (i + 1 < word.length && word.charAt(i + 1) === 'H') {
                metaphone = metaphone.substring(0, metaphone.length - 1) + 'F';
                i++;
            }
        } else if (char === 'S') {
            // If the next character is 'H', replace the code with 'X'
            if (i + 1 < word.length && word.charAt(i + 1) === 'H') {
                metaphone = metaphone.substring(0, metaphone.length - 1) + 'X';
                i++;
            }
        } else if (char === 'X') {
            // If the next character is 'C', replace the code with 'KS'
            if (i + 1 < word.length && word.charAt(i + 1) === 'C') {
                metaphone = metaphone.substring(0, metaphone.length - 1) + 'KS';
                i++;
            }
        }
    }

    // Remove any duplicate consecutive codes
    metaphone = metaphone.replace(/(.)\1+/g, '$1');

    // Remove any non-alphabetic characters
    metaphone = metaphone.replace(/[^A-Z]/g, '');

    // Pad with 'A's to ensure a length of 4
    metaphone = metaphone.padEnd(4, 'A');

    // Cut off any excess characters
    metaphone = metaphone.substring(0, 4);

    return metaphone;
}

export function arePhoneticallyClose(word1: string, word2: string) {
    const metaphone1 = metaphone(word1);
    const metaphone2 = metaphone(word2);

    return metaphone1 === metaphone2;
}

export function sortSuppliersByCarrierAgentName(array: any) {
    array.forEach((port: any) => {
        port.suppliers.sort((a: any, b: any) => {
            const carrierA = a.carrierAgentName.toUpperCase();
            const carrierB = b.carrierAgentName.toUpperCase();
    
            if (carrierA < carrierB) {
                return -1;
            }
            if (carrierA > carrierB) {
                return 1;
            }
            // names must be equal
            return 0;
        });
    });
    return array;
}

export function sortHauliersByName(array: any) {
    array.forEach((item: any) => {
        item.hauliers.sort((a: any, b: any) => {
            const nameA = a.haulierName.toUpperCase();
            const nameB = b.haulierName.toUpperCase();
    
            if (nameA < nameB) {
                return -1;
            }
            if (nameA > nameB) {
                return 1;
            }
            // names must be equal
            return 0;
        });
    });
    return array;
}

export function isJSON(str: string) {
    try {
        let newJson = JSON.parse(str);
        return typeof newJson === "object" && newJson !== str || false
    } 
    catch (e: any) {
        return false;
    }
};

export function getTotalPrice(seaFreightObject: any) {
    let totalPrice:number = 0;
  
    // Loop through the containers array
    for (const container of seaFreightObject.containers) {
        // Loop through the services array inside each container
        for (const service of container.services) {
            // Add the price of the service to the totalPrice
            totalPrice += service.price;
        }
    }
  
    return Number(totalPrice);
}

export function getTotalPrices(seaFreights: any) {
    var listPrices = 0;
    for (const seaFreight of seaFreights) {
        const totalPrice = getTotalPrice(seaFreight);
        listPrices += totalPrice;
    }
    
    return Number(listPrices);
}

export async function getToken(instance: any, account: any, scope: any) {
    await instance.acquireTokenSilent({
        scopes: scope.scopes,
        account: account
    })
    .then((response: AuthenticationResult) => {
        return response.accessToken;
    })
    .catch(() => {
        return instance.acquireTokenPopup({
            ...scope,
            account: account
            }).then((response: any) => {
                return response.accessToken;
            });
        }
    );
}

export const getAccessToken = async (instance: any, scope: any, account: any) => {
    try {
        const response = await instance.acquireTokenSilent({
            scopes: scope.scopes,
            account: account,
        });
        return response.accessToken;
    } 
    catch (error) {
        const response = await instance.acquireTokenPopup({
            ...scope,
            account: account,
        });
        return response.accessToken;
    }
};

export const getExtensionFromContentType = (contentType: string): string => {
    const contentTypeMap: { [key: string]: string } = {
      // Audio
      'audio/aac': 'aac',
      'audio/mpeg': 'mp3',
      'audio/mp4': 'm4a',
      'audio/ogg': 'oga',
      'audio/wav': 'wav',
      'audio/webm': 'weba',
  
      // Font
      'font/ttf': 'ttf',
      'font/otf': 'otf',
      'font/woff': 'woff',
      'font/woff2': 'woff2',
  
      // Image
      'image/bmp': 'bmp',
      'image/gif': 'gif',
      'image/jpeg': 'jpeg',
      'image/jpg': 'jpg',
      'image/png': 'png',
      'image/svg+xml': 'svg',
      'image/tiff': 'tiff',
      'image/webp': 'webp',
  
      // Text
      'text/css': 'css',
      'text/csv': 'csv',
      'text/html': 'html',
      'text/javascript': 'js',
      'text/plain': 'txt',
      'text/xml': 'xml',
  
      // Video
      'video/mp4': 'mp4',
      'video/mpeg': 'mpeg',
      'video/ogg': 'ogv',
      'video/webm': 'webm',
  
      // Other
      'application/json': 'json',
      'application/pdf': 'pdf',
      'application/zip': 'zip',
      'application/octet-stream': 'bin',
    };
  
    return contentTypeMap[contentType] || 'unknown';
};