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

export function getServicesTotal(data: any, currency: string) {
    let services = [];

    // Loop through the data
    for(let i = 0; i < data.length; i++) {
        // Loop through the services in the current data object
        for(let j = 0; j < data[i].services.length; j++) {
            let service = data[i].services[j];
            services.push(`${service.serviceName} : ${service.price} ${currency}`);
        }
    }

    // Return the services and their total price in the desired format
    return services.join('; ');
}

export function getServicesTotal2(data: any, currency: string, quantity: number) {
    let services = [];

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

export function displayContainers(value: any) {
    var aux = value.map((elm: any) => '<li>'+elm.quantity+"x"+elm.container+'</li>').join('');
    return '<ul>'+aux+'</ul>';
}

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