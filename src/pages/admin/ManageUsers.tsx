import SearchIcon from "@mui/icons-material/Search";
import { Avatar, Stack, TextField } from "@mui/material";
import { ChangeEvent, FC, MouseEvent, useMemo, useState } from "react";
import EditUserModal from "../../components/admin/EditUserModal";
import GenericTableActionEdit, {
  RowId,
} from "../../components/admin/GenericTable";
import { mockData } from "../../mock/data";
import { User } from "../../types";

type UserTableColumnNames = Pick<
  User,
  "id" | "name" | "email" | "createdAt" | "profileImageUrl"
>;

type UserTableColumnDefinition = {
  id: keyof UserTableColumnNames;
  label: string;
  sortable: boolean;
  render?: (value: User) => React.ReactNode;
};

// Define which columns to show and how to render them
const userTableColumnDefinitions: UserTableColumnDefinition[] = [
  { id: "id", label: "ID", sortable: true },
  { id: "name", label: "Name", sortable: true },
  { id: "email", label: "Email", sortable: true },
  {
    id: "createdAt",
    label: "Join Date",
    sortable: true,
    render: (value: User) => new Date(value.createdAt).toLocaleDateString(),
  },
  {
    id: "profileImageUrl",
    label: "Avatar",
    sortable: false,
    render: (value: User) =>
      value.profileImageUrl ? <Avatar src={value.profileImageUrl} /> : null,
  },
] as const;

interface UserTableActionEditProps {
  data: User[]; // Only the current page rows
  selectedIds: RowId[]; // Selection now handled externally
  onSelect: (id: RowId, isSelected: boolean) => void;
  onSelectAll: (isSelected: boolean) => void;
  onEdit: (id: RowId) => void;
  onDelete: (selectedIds: RowId[]) => void;
  onRequestSort: (column: keyof UserTableColumnNames) => void;
  onRequestPageChange: (newPage: number) => void;
  onRequestRowsPerPageChange: (rowsPerPage: number) => void;
  page: number;
  rowsPerPage: number;
  totalCount: number;
}

const UserTableActionEdit: FC<UserTableActionEditProps> = ({
  data,
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
}) => {
  return (
    <GenericTableActionEdit<User, "id">
      label="Users"
      data={data}
      columnDefinitions={userTableColumnDefinitions}
      idKey="id"
      selectedIds={selectedIds}
      onSelect={onSelect}
      onSelectAll={onSelectAll}
      onEdit={onEdit}
      onDelete={onDelete}
      onRequestSort={(column) => {
        const def = userTableColumnDefinitions.find((def) => def.id === column);
        if (def) {
          onRequestSort(def.id);
        }
      }}
      onRequestPageChange={onRequestPageChange}
      onRequestRowsPerPageChange={onRequestRowsPerPageChange}
      page={page}
      rowsPerPage={rowsPerPage}
      totalCount={totalCount}
    />
  );
};

const ManageUsers = () => {
  const [search, setSearch] = useState("");
  const [openEditModal, setOpenEditModal] = useState(false);
  const [editingUserId, setEditingUserId] = useState<RowId | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [columnSortOrder, setColumnSortOrder] = useState<"asc" | "desc">("asc");
  const [columnSortOrderBy, setColumnSortOrderBy] =
    useState<keyof UserTableColumnNames>("name");

  const filteredUsers = useMemo(() => {
    return mockData.users.filter((user) =>
      Object.keys(user).some((key) =>
        String(user[key as keyof User])
          .toLowerCase()
          .includes(search.toLowerCase())
      )
    );
  }, [search]);

  const handleRequestSort = (property: keyof UserTableColumnNames) => {
    const isAsc = columnSortOrderBy === property && columnSortOrder === "asc";
    setColumnSortOrder(isAsc ? "desc" : "asc");
    setColumnSortOrderBy(property);
  };

  const sortedUsers = useMemo(() => {
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

  const handleSelectAllClick = (isSelected: boolean) => {
    if (isSelected) {
      const newSelecteds = sortedUsers
        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
        .map((n) => n.id);
      setSelectedItems(newSelecteds);
    } else {
      setSelectedItems([]);
    }
  };

  const handleClick = (id: RowId, checked: boolean) => {
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
    _: MouseEvent<HTMLButtonElement> | null,
    newPage: number
  ) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleDeleteUsers = (selectedIds: RowId[]) => {
    console.log("Deleting users with IDs:", selectedIds);
    setSelectedItems([]); // Clear selection after deletion
  };

  const editingUser = useMemo(
    () => mockData.users.find((u) => u.id === editingUserId),
    [editingUserId]
  );
  const editingProfile = useMemo(
    () => mockData.profiles.find((p) => p.accountID === editingUserId),
    [editingUserId]
  );

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
      <UserTableActionEdit
        data={[]}
        selectedIds={[]}
        onSelect={handleClick}
        onSelectAll={handleSelectAllClick}
        onEdit={setEditingUserId}
        onDelete={handleDeleteUsers}
        onRequestSort={handleRequestSort}
        onRequestPageChange={setPage}
        onRequestRowsPerPageChange={setRowsPerPage}
        page={page}
        rowsPerPage={rowsPerPage}
        totalCount={sortedUsers.length}
      />
      {editingUser && (
        <EditUserModal
          open={openEditModal}
          onClose={() => setOpenEditModal(false)}
          user={editingUser}
          profile={editingProfile || null}
        />
      )}
    </Stack>
  );
};

export default ManageUsers;
