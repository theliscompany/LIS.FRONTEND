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

