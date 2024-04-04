import useProcessStatePersistence from './useProcessStatePersistence';

const MyForm = ({ userId }) => {
  const [formState, setFormState] = useProcessStatePersistence(
    userId,
    'myFormProcessName',
    { email: '', password: '' },
    '7.00:00:00', // Optionnel, par défaut à null (pas d'expiration)
    true // Optionnel, par défaut à true (sauvegarde automatique activée)
  );

  const handleChange = (e) => {
    setFormState({ ...formState, [e.target.name]: e.target.value });
  };

  return (
    <form>
      <input
        type="email"
        name="email"
        value={formState.email}
        onChange={handleChange}
      />
      <input
        type="password"
        name="password"
        value={formState.password}
        onChange={handleChange}
      />
      {/* ... */}
    </form>
  );
};
