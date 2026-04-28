'use client';

import React from 'react';
import { Box, useTheme, Typography, StyledEngineProvider, TextField, InputAdornment } from "@mui/material";
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

  const CustomToolbar = () => {
    return (
      <GridToolbarContainer sx={{
        p: '6px 16px',
        borderBottom: theme.palette.mode === "dark" ? "1px solid rgba(255, 255, 255, 0.2)" : "1px solid rgba(224, 224, 224, 1)",
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 2
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
          <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Toolbar
          </Typography>
          {extraToolbarContent}
        </Box>

        {onSearch && (
          <TextField
            size="small"
            placeholder="Search..."
            variant="outlined"
            onChange={(e) => onSearch(e.target.value)}
            sx={{
              width: 250,
              '& .MuiOutlinedInput-root': {
                fontSize: '12px',
                height: '32px',
                backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : '#fff'
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <HiMagnifyingGlass className="text-slate-400" />
                </InputAdornment>
              ),
            }}
          />
        )}
      </GridToolbarContainer>
    );
  };

  return (
    <StyledEngineProvider injectFirst>
      <Box
        sx={{
          overflow: "hidden",
          height: height ? height : "calc(100vh - 110px)",
          backgroundColor: theme.palette.mode === "dark" ? "#121212" : "#fff",
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <DataGrid
          rows={rows}
          columns={columns}
          rowHeight={rowHeight}
          pagination
          paginationMode={paginationModel ? "server" : "client"}
          rowCount={rowCount ?? rows.length}
          paginationModel={paginationModel}
          onPaginationModelChange={onPaginationModelChange}
          sortingMode={sortModel ? "server" : "client"}
          sortModel={sortModel}
          onSortModelChange={onSortModelChange}
          pageSizeOptions={pageSizeOptions}
          disableColumnMenu
          disableRowSelectionOnClick
          className="custom-admin-datagrid"
          slots={{
            noRowsOverlay: NoDataOverlay,
            toolbar: (onSearch || extraToolbarContent) ? CustomToolbar : undefined,
            headerRow: () => (
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
            ),
            ...slots,
          }}
          sx={{
            borderRadius: 0,
            border: 'none',
            backgroundColor: theme.palette.mode === "dark" ? "#121212" : "#fff",
            color: theme.palette.mode === "dark" ? "#fff" : "inherit",

            "& .MuiDataGrid-columnHeader, & .MuiDataGrid-columnHeaderTitle, & .MuiDataGrid-columnHeaderTitleContainer, & .MuiDataGrid-columnHeaderTitleContainerContent": {
              textDecoration: "none !important",
              outline: "none !important",
              boxShadow: "none !important",
            },

            "& .MuiDataGrid-columnHeaderTitle": {
              fontWeight: "bold",
              textAlign: "center",
              width: "100%",
            },

            "& .MuiDataGrid-row": {
              "&:hover": {
                backgroundColor: theme.palette.mode === "dark" ? "#1e1e1e" : "#f5f5f5",
              },
            },

            [`& .${gridClasses.headerRow}`]: {
              borderBottom: "none",
            },

            ...props.sx,
          }}
          {...props}
        />
      </Box>
    </StyledEngineProvider>
  );
};

export default CustomTableClient;
