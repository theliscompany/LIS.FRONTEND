import { useState, useEffect } from 'react';
import { getApiProcessStateByUserIdByProcessName, postApiProcessState } from '@features/sessionstorage/api';

// const API_BASE_URL = import.meta.env.VITE_API_LIS_SESSIONSTORAGE_ENDPOINT;

const useProcessStatePersistence = (userId: string, processName: string, initialState: any, expiresIn = null, enableAutoSave = true) => {
    const [state, setState] = useState(initialState);

    useEffect(() => {
        const fetchPersistedState = async () => {
            try {
                const cachedState = localStorage.getItem(processName);
                // console.log("cache : ", cachedState);
                if (cachedState) {
                    setState(JSON.parse(cachedState));
                } 
                else {
                    // console.log("userId : ", userId);
                    // console.log("processname : ", processName);
                    // const response = await axios.get(`${API_BASE_URL}ProcessState/${userId}/${processName}`);
                    const response = await getApiProcessStateByUserIdByProcessName({path: {userId: userId, processName: processName}});
                    // console.log("response : ", response);
                    if (response.data && response.data.stateData) {
                        setState(JSON.parse(response.data.stateData));
                        localStorage.setItem(processName, response.data.stateData);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch persisted state:', error);
            }
        };
        fetchPersistedState();
    }, [userId, processName]);

    useEffect(() => {
        const persistState = async () => {
        try {
            localStorage.setItem(processName, JSON.stringify(state));
            // console.log("userId : ", userId);
            // console.log("processName : ", processName);
            // console.log("API BASE : ", API_BASE_URL);
            if (enableAutoSave) {
                // await axios.post(`${API_BASE_URL}ProcessState`, {
                //     userId,
                //     processName,
                //     stateData: JSON.stringify(state),
                //     expiresIn,
                // });
                await postApiProcessState({body: { userId: userId, processName: processName, stateData: JSON.stringify(state), expiresIn: expiresIn }});
            }
        } 
        catch (error) {
            console.error('Failed to persist state:', error);
            // TODO: Implement retry mechanism
        }
    };

    const debounceDelay = 1000; // Adjust the delay as needed
    const timeoutId = setTimeout(persistState, debounceDelay);

    return () => {
        clearTimeout(timeoutId);
    };
  }, [userId, processName, state, expiresIn, enableAutoSave]);

  return [state, setState];
};

export default useProcessStatePersistence;
