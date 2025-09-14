import React from 'react';
import { MiscellaneousMiscellaneousServiceResponse } from '../api/types.gen';

interface MiscellaneousActionsProps {
  miscellaneous: MiscellaneousMiscellaneousServiceResponse;
  onEdit: (miscellaneous: MiscellaneousMiscellaneousServiceResponse) => void;
  onDelete: (id: string) => void;
  onView: (miscellaneous: MiscellaneousMiscellaneousServiceResponse) => void;
}

const MiscellaneousActions: React.FC<MiscellaneousActionsProps> = ({
  miscellaneous,
  onEdit,
  onDelete,
  onView
}) => {
  const handleDelete = () => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer le service "${miscellaneous.serviceName}" ?`)) {
      onDelete(miscellaneous.id || '');
    }
  };

  return (
    <div className="miscellaneous-actions">
      <button
        type="button"
        className="btn btn-view"
        onClick={() => onView(miscellaneous)}
        title="Voir les détails"
      >
        👁️
      </button>
      <button
        type="button"
        className="btn btn-edit"
        onClick={() => onEdit(miscellaneous)}
        title="Modifier"
      >
        ✏️
      </button>
      <button
        type="button"
        className="btn btn-delete"
        onClick={handleDelete}
        title="Supprimer"
      >
        🗑️
      </button>
    </div>
  );
};

export default MiscellaneousActions; 