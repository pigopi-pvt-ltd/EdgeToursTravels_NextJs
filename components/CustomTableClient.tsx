'use client';

import React from 'react';
import { Box, useTheme, Typography, TextField, InputAdornment, NoSsr, ThemeProvider as MuiThemeProvider, createTheme } from "@mui/material";
import { DataGrid, DataGridProps, gridClasses, GridToolbarContainer } from "@mui/x-data-grid";
import { useTheme as useAppTheme } from "@/context/ThemeContext";
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

const TableSkeleton = ({ height }: { height?: string | number }) => {
  const { theme: appMode } = useAppTheme();
  return (
    <div
      style={{ height: height || "calc(100vh - 110px)" }}
      className="w-full bg-white dark:bg-[#0A1128] rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col"
    >
      {/* Header Skeleton */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800/50 flex items-center justify-between">
        <div className="h-4 w-32 bg-slate-100 dark:bg-slate-800/50 rounded animate-pulse"></div>
        <div className="h-4 w-12 bg-slate-50 dark:bg-slate-800/30 rounded animate-pulse"></div>
      </div>

      {/* Toolbar Skeleton */}
      <div className="p-3 border-b border-slate-50 dark:border-slate-800/30 flex items-center gap-4">
        <div className="h-9 w-64 bg-slate-50 dark:bg-slate-900/50 rounded-lg animate-pulse"></div>
        <div className="ml-auto flex gap-2">
          <div className="h-8 w-20 bg-slate-50 dark:bg-slate-900/50 rounded animate-pulse"></div>
          <div className="h-8 w-8 bg-slate-50 dark:bg-slate-900/50 rounded animate-pulse"></div>
        </div>
      </div>

      {/* Rows Skeleton */}
      <div className="flex-1 p-0">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4 border-b border-slate-50 dark:border-slate-800/20">
            <div className="h-4 w-8 bg-slate-50 dark:bg-slate-800/30 rounded animate-pulse"></div>
            <div className="h-4 flex-1 bg-slate-100/50 dark:bg-slate-800/40 rounded animate-pulse"></div>
            <div className="h-4 w-24 bg-slate-50 dark:bg-slate-800/30 rounded animate-pulse"></div>
            <div className="h-4 w-32 bg-slate-50 dark:bg-slate-800/30 rounded animate-pulse"></div>
            <div className="h-4 w-16 bg-slate-50 dark:bg-slate-800/30 rounded animate-pulse"></div>
          </div>
        ))}
      </div>

      {/* Footer Skeleton */}
      <div className="p-4 bg-slate-50/50 dark:bg-slate-900/20 border-t border-slate-100 dark:border-slate-800/50 flex justify-end gap-2">
        <div className="h-4 w-32 bg-slate-100 dark:bg-slate-800/50 rounded animate-pulse"></div>
        <div className="h-4 w-8 bg-slate-100 dark:bg-slate-800/50 rounded animate-pulse"></div>
      </div>
    </div>
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
  const { theme: appMode } = useAppTheme();
  const [mounted, setMounted] = React.useState(false);

  const muiTheme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode: appMode as "light" | "dark",
          primary: {
            main: "#1ABC9C",
          },
          background: {
            default: appMode === "dark" ? "#0A1128" : "#fff",
            paper: appMode === "dark" ? "#111827" : "#fff",
          },
        },
      }),
    [appMode]
  );

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
          borderBottom: appMode === "dark" ? "1px solid rgba(255, 255, 255, 0.05)" : "1px solid rgba(224, 224, 224, 0.5)",
          flexWrap: 'wrap',
          backgroundColor: appMode === "dark" ? "rgba(10, 17, 40, 0.4)" : "transparent"
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
                backgroundColor: theme.palette.mode === "dark" ? "rgba(0, 0, 0, 0.2)" : "#fff",
                "& fieldset": {
                  borderColor: appMode === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.23)",
                },
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
    return <TableSkeleton height={height} />;
  }

  return (
    <MuiThemeProvider theme={muiTheme}>
      <Box
        sx={{
          overflow: "hidden",
          height: height ? height : "calc(100vh - 110px)",
          backgroundColor: appMode === "dark" ? "#0A1128" : "#fff",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {title && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "12px 16px",
              borderBottom: appMode === "dark" ? "1px solid rgba(255, 255, 255, 0.05)" : "1px solid rgba(224, 224, 224, 1)",
              backgroundColor: appMode === "dark" ? "rgba(10, 17, 40, 0.6)" : "#f5f5f5",
              backdropFilter: "blur(8px)",
            }}
          >
            <Typography
              variant="subtitle1"
              component="div"
              sx={{
                fontWeight: 1600,
                fontSize: "15px",
                color: appMode === "dark" ? "#fff" : "#333",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              {title}{" "}
              {(rowCount ?? rows.length) > 0 ? (
                <span style={{ opacity: 0.6, marginLeft: "4px", fontWeight: 500 }}>({rowCount ?? rows.length})</span>
              ) : (
                ""
              )}
            </Typography>
          </div>
        )}
        {mounted && (
          <NoSsr>
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
                toolbar: onSearch || extraToolbarContent ? CustomToolbar : undefined,
                noRowsOverlay: NoDataOverlay,
                ...slots,
              }}
              className="custom-admin-datagrid"
              {...props}
            />
          </NoSsr>
        )}
      </Box>
    </MuiThemeProvider>
  );
};

export default CustomTableClient;
