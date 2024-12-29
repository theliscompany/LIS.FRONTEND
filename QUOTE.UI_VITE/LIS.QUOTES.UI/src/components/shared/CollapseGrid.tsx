import { useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

const CollapsibleDataGrid = () => {
  const [expandedGroups, setExpandedGroups] = useState(new Set());

  const projects = [
    { 
      id: 1, 
      name: 'Project A', 
      budget: 100000, 
      status: 'Active',
      tasks: ["Task 1", "Task 2"],
      isGroup: true,
    },
    { 
      id: 2, 
      name: 'Project B', 
      budget: 150000, 
      status: 'On Hold',
      tasks: ["Task 3", "Task 4", "Task 5"],
      isGroup: true,
    },
  ];

  // Create rows including tasks when expanded
  const rows = projects.flatMap(project => {
    const projectRow = { ...project };
    
    if (!expandedGroups.has(project.id)) {
      return [projectRow];
    }

    const taskRows = project.tasks.map((task, index) => ({
      id: `${project.id}-${index}`,
      name: task,
      budget: '-',
      status: '-',
      isTask: true
    }));

    return [projectRow, ...taskRows];
  });

  const columns = [
    { 
      field: 'name', 
      headerName: 'Name', 
      flex: 1,
      renderCell: (params: any) => {
        if (params.row.isGroup) {
          return (
            <div 
              onClick={() => toggleExpanded(params.row.id)} 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                cursor: 'pointer',
                gap: '8px'
              }}
            >
              {expandedGroups.has(params.row.id) ? 
                <KeyboardArrowDownIcon /> : 
                <KeyboardArrowRightIcon />
              }
              <strong>{params.row.name}</strong>
            </div>
          );
        }

        // This is where you can customize how individual tasks look
        return (
          <div style={{ marginLeft: '32px' }}>
            📋 {params.value}
          </div>
        );
      }
    },
    { 
      field: 'budget', 
      headerName: 'Budget', 
      width: 130,
      valueFormatter: (params: any) => {
        if (params.value == null || params.value === '-') return '-';
        return `$${params.value.toLocaleString()}`;
      },
    },
    { 
      field: 'status', 
      headerName: 'Status', 
      width: 130 
    },
  ];

  const toggleExpanded = (id: any) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedGroups(newExpanded);
  };

  return (
    <div style={{ height: 400, width: '100%' }}>
      <DataGrid
        rows={rows}
        columns={columns}
        disableRowSelectionOnClick
        getRowClassName={(params: any) => 
          params.row.isGroup ? 'group-row' : 'task-row'
        }
        sx={{
          '& .group-row': {
            backgroundColor: '#f5f5f5',
          },
          '& .task-row': {
            backgroundColor: '#ffffff',
          },
        }}
      />
    </div>
  );
};

export default CollapsibleDataGrid;