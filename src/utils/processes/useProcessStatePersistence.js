import { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = 'https://lis-sessionstorage-svc.azurewebsites.net';

const useProcessStatePersistence = (userId, processName, initialState, expiresIn = null, enableAutoSave = true) => {
  const [state, setState] = useState(initialState);

  useEffect(() => {
    const fetchPersistedState = async () => {
      try {
        const cachedState = localStorage.getItem(processName);
        if (cachedState) {
          setState(JSON.parse(cachedState));
        } else {
          const response = await axios.get(`${API_BASE_URL}/api/ProcessState/${userId}/${processName}`);
          if (response.data) {
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
        if (enableAutoSave) {
          await axios.post(`${API_BASE_URL}/api/ProcessState`, {
            userId,
            processName,
            stateData: JSON.stringify(state),
            expiresIn,
          });
        }
      } catch (error) {
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
