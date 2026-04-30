'use client';

import React from 'react';
import { Box, useTheme, Typography, TextField, InputAdornment, NoSsr } from "@mui/material";
import { DataGrid, DataGridProps, gridClasses, GridToolbarContainer } from "@mui/x-data-grid";
import { HiMagnifyingGlass } from 'react-icons/hi2';
import './CustomTable.css';

interface CustomTableProps extends Partial<DataGridProps> {
  title?: string;
  rowCount?: number;
  height?: string | number;
  rowHeight?: number;
  onSearch?: (term: string) => void;
  extraToolbarContent?: React.ReactNode;
}

const NoDataOverlay = () => {
  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        color: "text.secondary",
        fontSize: "1rem",
      }}
    >
      <Typography sx={{ fontWeight: 'bold', fontStyle: 'italic', color: '#999' }}>No data available</Typography>
    </Box>
  );
};

const CustomTableClient: React.FC<CustomTableProps> = ({
  rows = [],
  columns = [],
  rowCount,
  paginationModel,
  onPaginationModelChange,
  sortModel,
  onSortModelChange,
  slots,
  pageSizeOptions = [25, 50, 100],
  height,
  rowHeight = 30,
  title,
  onSearch,
  extraToolbarContent,
  ...props
}) => {
  const theme = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const CustomToolbar = () => {
    return (
      <GridToolbarContainer
        sx={{
          p: 1.5,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 2,
          borderBottom: theme.palette.mode === "dark" ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid rgba(224, 224, 224, 0.5)",
          flexWrap: 'wrap'
        }}
      >
        {onSearch && (
          <TextField
            variant="outlined"
            size="small"
            placeholder="Search records..."
            onChange={(e) => onSearch(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <HiMagnifyingGlass className="text-slate-400" />
                  </InputAdornment>
                ),
              },
            }}
            sx={{
              width: { xs: '100%', sm: 250 },
              "& .MuiOutlinedInput-root": {
                borderRadius: "8px",
                backgroundColor: theme.palette.mode === "dark" ? "#1e1e1e" : "#fff",
                fontSize: "12px",
                fontWeight: "bold",
              },
            }}
          />
        )}
        {extraToolbarContent && (
          <Box sx={{ display: "flex", gap: 1, alignItems: "center", ml: "auto" }}>
            {extraToolbarContent}
          </Box>
        )}
      </GridToolbarContainer>
    );
  };

  if (!mounted) {
    return (
      <div className="w-full h-full animate-pulse bg-slate-50 dark:bg-slate-900 flex items-center justify-center min-h-[400px] rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Preparing Table...</div>
      </div>
    );
  }

  return (
    <Box
      sx={{
        overflow: "hidden",
        height: height ? height : "calc(100vh - 110px)",
        backgroundColor: theme.palette.mode === "dark" ? "#121212" : "#fff",
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {title && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "8px 16px",
            borderBottom: theme.palette.mode === "dark" ? "1px solid rgba(255, 255, 255, 0.2)" : "1px solid rgba(224, 224, 224, 1)",
            backgroundColor: theme.palette.mode === "dark" ? "#1e1e1e" : "#f5f5f5",
          }}
        >
          <Typography
            variant="subtitle1"
            component="div"
            sx={{
              fontWeight: 1600,
              fontSize: '15px',
              color: theme.palette.mode === "dark" ? "#fff" : "#333",
              textTransform: 'uppercase',
              letterSpacing: '-0.02em'
            }}
          >
            {title}{" "}
            {(rowCount ?? rows.length) > 0 ? `(${(rowCount ?? rows.length)})` : ""}
          </Typography>
        </div>
      )}
      {mounted && (
        <DataGrid
          rows={rows}
          columns={columns}
          rowHeight={rowHeight}
          pagination
          paginationMode={paginationModel ? "server" : "client"}
          {...(paginationModel ? { rowCount: rowCount ?? rows.length } : {})}
          paginationModel={paginationModel}
          onPaginationModelChange={onPaginationModelChange}
          sortingMode={sortModel ? "server" : "client"}
          sortModel={sortModel}
          onSortModelChange={onSortModelChange}
          pageSizeOptions={pageSizeOptions}
          disableRowSelectionOnClick
          slots={{
            toolbar: (onSearch || extraToolbarContent) ? CustomToolbar : undefined,
            noRowsOverlay: NoDataOverlay,
            ...slots,
          }}
          sx={{
            flex: 1,
            border: "none",
            borderRadius: "0 0 16px 16px",
            backgroundColor: theme.palette.mode === "dark" ? "#1A2236" : "#fff",
            color: theme.palette.mode === "dark" ? "#fff" : "#333",
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: theme.palette.mode === "dark" ? "#111827" : "#f1f5f9",
              color: theme.palette.mode === "dark" ? "#fff" : "#0f172a",
              fontSize: "12px",
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              borderBottom: theme.palette.mode === "dark" ? "1px solid rgba(255,255,255,0.1)" : "1px solid #e2e8f0",
            },
            "& .MuiDataGrid-cell": {
              borderBottom: theme.palette.mode === "dark" ? "1px solid rgba(255,255,255,0.05)" : "1px solid #f1f5f9",
              fontSize: "13px",
              fontWeight: 500,
            },
            "& .MuiDataGrid-row:hover": {
              backgroundColor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.02)" : "#f8fafc",
            },
            [`& .${gridClasses.cell}:focus, & .${gridClasses.cell}:focus-within`]: {
              outline: "none",
            },
            [`& .${gridClasses.columnHeader}:focus, & .${gridClasses.columnHeader}:focus-within`]: {
              outline: "none",
            },
          }}
          {...props}
        />
      )}
    </Box>
  );
};

export default CustomTableClient;
