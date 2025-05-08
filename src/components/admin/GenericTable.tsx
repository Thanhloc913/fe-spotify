import DeleteIcon from "@mui/icons-material/Delete";
import FirstPageIcon from "@mui/icons-material/FirstPage";
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import LastPageIcon from "@mui/icons-material/LastPage";
import {
  alpha,
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
import { visuallyHidden } from "@mui/utils";
import { FC, MouseEvent, ReactNode, useState } from "react";

export type RowId = string | number;
type TableColumnDefinition<T> = {
  id: keyof T;
  label: string;
  sortable: boolean;
  render?: (value: T) => ReactNode;
};
export type TableColumnDefinitions<T> = Array<TableColumnDefinition<T>>;
type RowColumnDefinition<T> = Omit<TableColumnDefinition<T>, "sortable">;
type RowColumnDefinitions<T> = Array<RowColumnDefinition<T>>;
type RowAction = {
  label: string;
  onClick: (id: RowId) => void;
};
type RowActions = Array<RowAction>;

interface TablePaginationActionsProps {
  count: number;
  page: number;
  rowsPerPage: number;
  onPageChange: (event: MouseEvent<HTMLButtonElement>, newPage: number) => void;
}

function TablePaginationActions(props: TablePaginationActionsProps) {
  const { count, page, rowsPerPage, onPageChange } = props;

  const handleFirstPageButtonClick = (event: MouseEvent<HTMLButtonElement>) => {
    onPageChange(event, 0);
  };

  const handleBackButtonClick = (event: MouseEvent<HTMLButtonElement>) => {
    onPageChange(event, page - 1);
  };

  const handleNextButtonClick = (event: MouseEvent<HTMLButtonElement>) => {
    onPageChange(event, page + 1);
  };

  const handleLastPageButtonClick = (event: MouseEvent<HTMLButtonElement>) => {
    onPageChange(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1));
  };

  return (
    <Box sx={{ flexShrink: 0, ml: 2.5 }}>
      <IconButton
        onClick={handleFirstPageButtonClick}
        disabled={page === 0}
        aria-label="first page"
      >
        <FirstPageIcon />
      </IconButton>
      <IconButton
        onClick={handleBackButtonClick}
        disabled={page === 0}
        aria-label="previous page"
      >
        <KeyboardArrowLeft />
      </IconButton>
      <IconButton
        onClick={handleNextButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="next page"
      >
        <KeyboardArrowRight />
      </IconButton>
      <IconButton
        onClick={handleLastPageButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="last page"
      >
        <LastPageIcon />
      </IconButton>
    </Box>
  );
}

interface EnhancedTableToolbarProps {
  label: string;
  numSelected: number;
  onDelete: (selectedIds: RowId[]) => void;
  selectedIds: RowId[];
}

const EnhancedTableToolbar: FC<EnhancedTableToolbarProps> = (props) => {
  const { numSelected, onDelete, selectedIds } = props;
  const [open, setOpen] = useState(false);

  const handleDelete = () => {
    setOpen(false);
    onDelete(selectedIds);
  };

  return (
    <>
      <Toolbar
        className="flex-none"
        sx={{
          ...(numSelected > 0 && {
            bgcolor: (theme) =>
              alpha(
                theme.palette.primary.main,
                theme.palette.action.activatedOpacity
              ),
          }),
        }}
      >
        {numSelected > 0 ? (
          <Typography
            sx={{ flex: "1 1 100%" }}
            color="inherit"
            variant="subtitle1"
            component="div"
          >
            {numSelected} selected
          </Typography>
        ) : (
          <Typography
            sx={{ flex: "1 1 100%" }}
            variant="h6"
            id="tableTitle"
            component="div"
          >
            {props.label}
          </Typography>
        )}

        {numSelected > 0 && (
          <Tooltip title="Delete">
            <IconButton onClick={() => setOpen(true)}>
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        )}
      </Toolbar>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Delete Users"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete the selected users (ID:{" "}
            {selectedIds.join(", ")})? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleDelete} autoFocus>
            Uncheck all
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

interface SortableTableHeaderLabelProps<T> {
  columnId: keyof T;
  label: string;
  orderBy: keyof T;
  order: "asc" | "desc";
  onRequestSort: (property: keyof T) => void;
}

const SortableTableHeaderLabel = <T,>({
  columnId,
  label,
  orderBy,
  order,
  onRequestSort,
}: SortableTableHeaderLabelProps<T>) => {
  return (
    <TableSortLabel
      active={orderBy === columnId}
      direction={orderBy === columnId ? order : "asc"}
      onClick={() => onRequestSort(columnId)}
    >
      {label}
      {orderBy === columnId ? (
        <Box component="span" sx={visuallyHidden}>
          {order === "desc" ? "sorted descending" : "sorted ascending"}
        </Box>
      ) : null}
    </TableSortLabel>
  );
};

interface GenericTableRowProps<
  T extends { [key: string]: any },
  K extends keyof T
> {
  data: T;
  columnDefinitions: RowColumnDefinitions<T>;
  idKey: K; // The key to use as unique identifier
  isSelected: boolean;
  onSelect: (id: RowId, isSelected: boolean) => void;
  actions: RowActions;
}

const GenericTableRow = <T extends { [key: string]: any }, K extends keyof T>({
  data,
  columnDefinitions,
  idKey,
  isSelected = false,
  onSelect,
  actions = [],
}: GenericTableRowProps<T, K>) => {
  return (
    <TableRow hover role="checkbox" key={String(data[idKey])}>
      {onSelect && (
        <TableCell padding="checkbox">
          <Checkbox
            checked={isSelected}
            onChange={(event) => onSelect(data[idKey], event.target.checked)}
          />
        </TableCell>
      )}

      {columnDefinitions.map((column) => (
        <TableCell key={String(column.id)}>
          {column.render ? column.render(data) : String(data[column.id])}
        </TableCell>
      ))}

      {actions.length > 0 && (
        <TableCell>
          {actions.map((action, index) => (
            <Button key={index} onClick={() => action.onClick(data[idKey])}>
              {action.label}
            </Button>
          ))}
        </TableCell>
      )}
    </TableRow>
  );
};

interface GenericTableRowActionEditProps<
  T extends { [key: string]: any },
  K extends keyof T
> {
  data: T;
  columnDefinitions: RowColumnDefinitions<T>;
  idKey: K;
  isSelected: boolean;
  onSelect: (id: RowId, isSelected: boolean) => void;
  onEdit: (id: RowId) => void; // Edit-specific callback
}

const GenericTableRowActionEdit = <
  T extends { [key: string]: any },
  K extends keyof T
>({
  data,
  columnDefinitions,
  idKey,
  isSelected = false,
  onSelect,
  onEdit,
}: GenericTableRowActionEditProps<T, K>) => {
  return (
    <GenericTableRow<T, K>
      data={data}
      columnDefinitions={columnDefinitions}
      idKey={idKey}
      isSelected={isSelected}
      onSelect={onSelect}
      actions={[
        {
          label: "Edit",
          onClick: () => onEdit(data[idKey]),
        },
      ]}
    />
  );
};

export interface GenericTableActionEditProps<
  T extends { [key: string]: any },
  K extends keyof T
> {
  label: string;
  data: T[]; // Only the current page rows
  columnDefinitions: TableColumnDefinitions<T>;
  idKey: K;
  selectedIds: RowId[]; // Selection now handled externally
  onSelect: (id: RowId, isSelected: boolean) => void;
  onSelectAll: (isSelected: boolean) => void;
  onEdit: (id: RowId) => void;
  onDelete: (selectedIds: RowId[]) => void;
  onRequestSort: (column: keyof T) => void;
  onRequestPageChange: (newPage: number) => void;
  onRequestRowsPerPageChange: (rowsPerPage: number) => void;
  page: number;
  rowsPerPage: number;
  totalCount: number;
}

export const GenericTableActionEdit = <
  T extends { [key: string]: any },
  K extends keyof T
>({
  label,
  data,
  columnDefinitions,
  idKey,
  selectedIds,
  onSelect,
  onSelectAll,
  onEdit,
  onDelete,
  onRequestSort,
  onRequestPageChange,
  onRequestRowsPerPageChange,
  page,
  rowsPerPage,
  totalCount,
}: GenericTableActionEditProps<T, K>) => {
  return (
    <Paper className="flex-auto overflow-x-auto">
      <Stack className="h-full">
        <EnhancedTableToolbar
          label="Users"
          numSelected={selectedIds.length}
          onDelete={onDelete}
          selectedIds={selectedIds}
        />
        <TableContainer className="flex-auto">
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={
                      selectedIds.length > 0 && selectedIds.length < data.length
                    }
                    checked={
                      data.length > 0 && selectedIds.length === data.length
                    }
                    onChange={(e) => onSelectAll(e.target.checked)}
                    slotProps={{
                      input: { "aria-label": `select all ${label}` },
                    }}
                  />
                </TableCell>
                {columnDefinitions.map((column) => (
                  <TableCell key={String(column.id)}>
                    {column.sortable ? (
                      <SortableTableHeaderLabel
                        columnId={column.id}
                        label={column.label}
                        orderBy={column.id}
                        order={"asc"} // Parent should manage state
                        onRequestSort={() => onRequestSort(column.id)}
                      />
                    ) : (
                      column.label
                    )}
                  </TableCell>
                ))}
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((item) => (
                <GenericTableRowActionEdit<T, K>
                  key={String(item[idKey])}
                  data={item}
                  columnDefinitions={columnDefinitions}
                  idKey={idKey}
                  isSelected={selectedIds.includes(item[idKey])}
                  onSelect={onSelect}
                  onEdit={onEdit}
                />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={totalCount}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(_, newPage) => onRequestPageChange(newPage)}
          onRowsPerPageChange={(event) =>
            onRequestRowsPerPageChange(parseInt(event.target.value, 10))
          }
          ActionsComponent={TablePaginationActions}
        />
      </Stack>
    </Paper>
  );
};

export default GenericTableActionEdit;
