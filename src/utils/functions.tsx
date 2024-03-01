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
  