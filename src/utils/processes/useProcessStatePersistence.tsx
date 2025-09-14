import { useState, useEffect } from 'react';
import { getApiProcessStateByUserIdByProcessName, postApiProcessState } from '@features/sessionstorage/api';

// const API_BASE_URL = import.meta.env.VITE_API_LIS_SESSIONSTORAGE_ENDPOINT;

const useProcessStatePersistence = (userId: string, processName: string, initialState: any, expiresIn = null, enableAutoSave = true) => {
    const [state, setState] = useState(initialState);
    const [isHydrated, setIsHydrated] = useState(false);

    useEffect(() => {
        const fetchPersistedState = async () => {
            try {
                const cachedState = localStorage.getItem(processName);
                // console.log("cache : ", cachedState);
                if (cachedState) {
                    try {
                        setState(JSON.parse(cachedState));
                    } catch (e) {
                        setState(initialState);
                        localStorage.removeItem(processName);
                    }
                    setIsHydrated(true);
                } 
                else {
                    // console.log("userId : ", userId);
                    // console.log("processname : ", processName);
                    // const response = await axios.get(`${API_BASE_URL}ProcessState/${userId}/${processName}`);
                    const response = await getApiProcessStateByUserIdByProcessName({path: {userId: userId, processName: processName}});
                    // console.log("response : ", response);
                    if (response.data && response.data.stateData) {
                        try {
                            setState(JSON.parse(response.data.stateData));
                            localStorage.setItem(processName, response.data.stateData);
                        } catch (e) {
                            setState(initialState);
                            localStorage.removeItem(processName);
                        }
                    }
                    setIsHydrated(true);
                }
            } catch (error) {
                // Fallback : lecture locale uniquement
                const cachedState = localStorage.getItem(processName);
                if (cachedState) {
                    try {
                        setState(JSON.parse(cachedState));
                    } catch (e) {
                        setState(initialState);
                        localStorage.removeItem(processName);
                    }
                } else {
                    setState(initialState);
                }
                setIsHydrated(true);
            }
        };
        fetchPersistedState();
        // eslint-disable-next-line
    }, [userId, processName]);

    useEffect(() => {
        if (!enableAutoSave) return;
        const saveState = async () => {
            try {
                await postApiProcessState({
                    body: {
                        userId,
                        processName,
                        stateData: JSON.stringify(state),
                        expiresIn,
                    }
                });
                localStorage.setItem(processName, JSON.stringify(state));
            } catch (error) {
                // Fallback : sauvegarde locale uniquement
                localStorage.setItem(processName, JSON.stringify(state));
            }
        };
        saveState();
        // eslint-disable-next-line
    }, [state, userId, processName, expiresIn, enableAutoSave]);

    const resetState = () => {
        setState(initialState);
        localStorage.removeItem(processName);
        // TODO: Appeler l'API pour supprimer côté serveur si nécessaire
    };

    return [state, setState, isHydrated, resetState];
};

export default useProcessStatePersistence;
