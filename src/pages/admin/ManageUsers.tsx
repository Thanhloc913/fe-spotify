import DeleteIcon from "@mui/icons-material/Delete";
import FirstPageIcon from "@mui/icons-material/FirstPage";
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import LastPageIcon from "@mui/icons-material/LastPage";
import SearchIcon from "@mui/icons-material/Search";
import {
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
  TextField,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { visuallyHidden } from "@mui/utils";
import React, { useState } from "react";
import EditUserModal from "../../components/admin/modal/EditUserModal"; // Make sure this path is correct
import { mockData } from "../../mock/data"; // Make sure this path is correct
import { User } from "../../types"; // Make sure this path is correct

interface TablePaginationActionsProps {
  count: number;
  page: number;
  rowsPerPage: number;
  onPageChange: (
    event: React.MouseEvent<HTMLButtonElement>,
    newPage: number
  ) => void;
}

function TablePaginationActions(props: TablePaginationActionsProps) {
  const { count, page, rowsPerPage, onPageChange } = props;

  const handleFirstPageButtonClick = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    onPageChange(event, 0);
  };

  const handleBackButtonClick = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    onPageChange(event, page - 1);
  };

  const handleNextButtonClick = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    onPageChange(event, page + 1);
  };

  const handleLastPageButtonClick = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
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
  numSelected: number;
  onDelete: (selectedIds: string[]) => void;
  selected: string[];
}

const EnhancedTableToolbar: React.FC<EnhancedTableToolbarProps> = (props) => {
  const { numSelected, onDelete, selected } = props;
  const [open, setOpen] = useState(false);

  const handleDelete = () => {
    setOpen(false);
    onDelete(selected);
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
            Users
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
            {selected.join(", ")})? This action cannot be undone.
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

interface UserTableRowProps {
  user: User;
  onSelect: (id: string, isSelected: boolean) => void;
  isSelected: boolean;
  onEdit: (user: User) => void;
}

const UserTableRow: React.FC<UserTableRowProps> = ({
  user,
  onSelect,
  isSelected,
  onEdit,
}) => {
  return (
    <TableRow hover role="checkbox" tabIndex={-1} key={user.id}>
      <TableCell padding="checkbox">
        <Checkbox
          checked={isSelected}
          onChange={(event) => onSelect(user.id, event.target.checked)}
        />
      </TableCell>
      <TableCell>{user.id}</TableCell>
      <TableCell>{user.name}</TableCell>
      <TableCell>{user.email}</TableCell>
      <TableCell>
        <Button onClick={() => onEdit(user)}>Edit</Button>
      </TableCell>
    </TableRow>
  );
};

const ManageUsers = () => {
  const [search, setSearch] = useState("");
  const [openEditModal, setOpenEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [columnSortOrder, setColumnSortOrder] = useState<"asc" | "desc">("asc");
  const [columnSortOrderBy, setColumnSortOrderBy] =
    useState<keyof User>("name");

  const filteredUsers = mockData.users.filter(
    (user) =>
      user.id.toLowerCase().includes(search.toLowerCase()) ||
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleRequestSort = (
    _: React.MouseEvent<unknown>,
    property: keyof User
  ) => {
    const isAsc = columnSortOrderBy === property && columnSortOrder === "asc";
    setColumnSortOrder(isAsc ? "desc" : "asc");
    setColumnSortOrderBy(property);
  };

  const sortedUsers = React.useMemo(() => {
    const stabilizedThis = filteredUsers.map(
      (el, index) => [el, index] as const
    );
    stabilizedThis.sort((a, b) => {
      const orderFn = (objA: User, objB: User, property: keyof User) => {
        const valA = objA[property];
        const valB = objB[property];
        if (valA < valB) {
          return -1;
        }
        if (valA > valB) {
          return 1;
        }
        return 0;
      };
      const value = orderFn(a[0], b[0], columnSortOrderBy);
      if (value !== 0) {
        return columnSortOrder === "asc" ? value : -value;
      }
      return a[1] - b[1];
    });
    return stabilizedThis.map((el) => el[0]);
  }, [filteredUsers, columnSortOrder, columnSortOrderBy]);

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelecteds = sortedUsers
        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
        .map((n) => n.id);
      setSelectedItems(newSelecteds);
    } else {
      setSelectedItems([]);
    }
  };

  const handleClick = (id: string, checked: boolean) => {
    setSelectedItems((prevSelected) => {
      if (checked) {
        return [...prevSelected, id];
      } else {
        return prevSelected.filter((item) => item !== id);
      }
    });
  };

  const isItemSelected = (id: string) => selectedItems.indexOf(id) !== -1;

  const handleChangePage = (
    _: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number
  ) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleDeleteUsers = (selectedIds: string[]) => {
    // In a real application, you'd send a request to your backend to delete the users.
    console.log("Deleting users with IDs:", selectedIds);
    setSelectedItems([]); // Clear selection after deletion
  };

  return (
    <Stack className="h-full">
      <div
        className="flex-none"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          marginBottom: "1rem",
        }}
      >
        <SearchIcon />
        <TextField
          label="Search"
          variant="outlined"
          fullWidth
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <Paper className="flex-auto overflow-x-auto">
        <Stack className="h-full">
          <EnhancedTableToolbar
            numSelected={selectedItems.length}
            onDelete={handleDeleteUsers}
            selected={selectedItems}
          />
          <TableContainer className="flex-auto">
            <Table stickyHeader aria-label="sticky user table">
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      indeterminate={
                        selectedItems.length > 0 &&
                        selectedItems.length <
                          sortedUsers.slice(
                            page * rowsPerPage,
                            page * rowsPerPage + rowsPerPage
                          ).length
                      }
                      checked={
                        sortedUsers.length > 0 &&
                        selectedItems.length ===
                          sortedUsers.slice(
                            page * rowsPerPage,
                            page * rowsPerPage + rowsPerPage
                          ).length
                      }
                      onChange={handleSelectAllClick}
                      slotProps={{
                        input: {
                          "aria-label": "select all users",
                        },
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={columnSortOrderBy === "id"}
                      direction={
                        columnSortOrderBy === "id" ? columnSortOrder : "asc"
                      }
                      onClick={(event) => handleRequestSort(event, "id")}
                    >
                      ID
                      {columnSortOrderBy === "id" ? (
                        <Box component="span" sx={visuallyHidden}>
                          {columnSortOrder === "desc"
                            ? "sorted descending"
                            : "sorted ascending"}
                        </Box>
                      ) : null}
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={columnSortOrderBy === "name"}
                      direction={
                        columnSortOrderBy === "name" ? columnSortOrder : "asc"
                      }
                      onClick={(event) => handleRequestSort(event, "name")}
                    >
                      Name
                      {columnSortOrderBy === "name" ? (
                        <Box component="span" sx={visuallyHidden}>
                          {columnSortOrder === "desc"
                            ? "sorted descending"
                            : "sorted ascending"}
                        </Box>
                      ) : null}
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={columnSortOrderBy === "email"}
                      direction={
                        columnSortOrderBy === "email" ? columnSortOrder : "asc"
                      }
                      onClick={(event) => handleRequestSort(event, "email")}
                    >
                      Email
                      {columnSortOrderBy === "email" ? (
                        <Box component="span" sx={visuallyHidden}>
                          {columnSortOrder === "desc"
                            ? "sorted descending"
                            : "sorted ascending"}
                        </Box>
                      ) : null}
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedUsers
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((user) => {
                    return (
                      <UserTableRow
                        key={user.id}
                        user={user}
                        onSelect={handleClick}
                        isSelected={isItemSelected(user.id)}
                        onEdit={(user) => {
                          setEditingUser(user);
                          setOpenEditModal(true);
                        }}
                      />
                    );
                  })}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            className="flex-none"
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredUsers.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            ActionsComponent={TablePaginationActions}
          />
        </Stack>
      </Paper>

      {editingUser && (
        <EditUserModal
          open={openEditModal}
          onClose={() => setOpenEditModal(false)}
          user={editingUser}
          profile={
            mockData.profiles.find((p) => p.accountID === editingUser.id) ||
            null
          }
        />
      )}
    </Stack>
  );
};

export default ManageUsers;
