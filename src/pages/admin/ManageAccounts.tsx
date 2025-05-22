import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import { Button, Checkbox, Stack, TextField } from "@mui/material";
import { FC, useEffect, useMemo, useState } from "react";
import {
  createAccount,
  deleteAccountMany,
  editAccount,
  getAccounts,
  getRoles,
} from "../../api/authApi";
import {
  AddAccount2FormProps,
  AddAccount2Modal,
} from "../../components/admin/AddAccount2Modal";
import {
  EditAccount2FormProps,
  EditAccount2Modal,
} from "../../components/admin/EditAccount2Modal";
import {
  GenericTableActionEdit,
  RowId,
  SortOrder,
} from "../../components/admin/GenericTable";
import { PreviewModal } from "../../components/admin/PreviewModal";
import { useAdminLoading } from "../../store/paginationStore";
import { ApiAccountType, ApiPaginatedResult } from "../../types/api";

type Account2 = ApiAccountType & {
  roleName: string | null;
};
type Paginated<T> = ApiPaginatedResult<T>;

type Account2TableColumnNames = Pick<
  Account2,
  | "id"
  | "username"
  | "email"
  | "roleId"
  | "isActive"
  | "createdAt"
  | "updatedAt"
>;

type Account2TableColumnDefinition = {
  id: keyof Account2TableColumnNames;
  label: string;
  sortable: boolean;
  render?: (value: Account2) => React.ReactNode;
};

// Define which columns to show and how to render them
const account2TableColumnDefinitions: Account2TableColumnDefinition[] = [
  { id: "id", label: "ID", sortable: true },
  { id: "username", label: "Username", sortable: true },
  { id: "email", label: "Email", sortable: true },
  {
    id: "roleId",
    label: "Role ID",
    sortable: true,
    render: (value: Account2) => value.roleName ?? value.roleId,
  },
  {
    id: "isActive",
    label: "Active",
    sortable: true,
    render: (value: Account2) => <Checkbox checked={value.isActive} disabled />,
  },
  {
    id: "createdAt",
    label: "Created",
    sortable: true,
    render: (value: Account2) => new Date(value.createdAt).toLocaleString(),
  },
  {
    id: "updatedAt",
    label: "Updated",
    sortable: true,
    render: (value: Account2) => new Date(value.updatedAt).toLocaleString(),
  },
] as const;

interface Account2TableActionEditProps {
  data: Account2[]; // Only the current page rows
  selectedIds: RowId[];
  onSelect: (id: RowId, isSelected: boolean) => void;
  onSelectAll: (isSelected: boolean) => void;
  onEdit: (id: RowId) => void;
  onDelete: (selectedIds: RowId[]) => void;
  onRequestSort: (
    column: keyof Account2TableColumnNames,
    order: SortOrder
  ) => void;
  onRequestPageChange: (newPage: number) => void;
  onRequestRowsPerPageChange: (rowsPerPage: number) => void;
  order: SortOrder;
  orderBy: keyof Account2TableColumnNames;
  page: number;
  rowsPerPage: number;
  totalCount: number;
}

const Account2TableActionEdit: FC<Account2TableActionEditProps> = ({
  data,
  selectedIds,
  onSelect,
  onSelectAll,
  onEdit,
  onDelete,
  onRequestSort,
  onRequestPageChange,
  onRequestRowsPerPageChange,
  order,
  orderBy,
  page,
  rowsPerPage,
  totalCount,
}) => {
  return (
    <GenericTableActionEdit<Account2, "id">
      label="Account2s"
      pluralEntityName="Account2s"
      data={data}
      columnDefinitions={account2TableColumnDefinitions}
      idKey="id"
      selectedIds={selectedIds}
      onSelect={onSelect}
      onSelectAll={onSelectAll}
      onEdit={onEdit}
      onDelete={onDelete}
      onRequestSort={(column, order) => {
        const def = account2TableColumnDefinitions.find(
          (def) => def.id === column
        );
        if (def) {
          onRequestSort(def.id, order);
        }
      }}
      onRequestPageChange={onRequestPageChange}
      onRequestRowsPerPageChange={onRequestRowsPerPageChange}
      order={order}
      orderBy={orderBy}
      page={page}
      rowsPerPage={rowsPerPage}
      totalCount={totalCount}
    />
  );
};

const ManageAccount2s = () => {
  const [search, setSearch] = useState("");
  const [openEditModal, setOpenEditModal] = useState(false);
  const [editingAccount2Id, setEditingAccount2Id] = useState<RowId | null>(
    null
  );
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedItems, setSelectedItems] = useState<RowId[]>([]);
  const [columnSortOrder, setColumnSortOrder] = useState<"asc" | "desc">(
    "desc"
  );
  const [columnSortOrderBy, setColumnSortOrderBy] =
    useState<keyof Account2TableColumnNames>("updatedAt");

  const [openPreviewModal, setOpenPreviewModal] = useState(false);
  const [submittedData, setSubmittedData] = useState<unknown>(null);
  const [openAddModal, setOpenAddModal] = useState(false);

  const [displayingResult, setDisplayingResult] = useState<Paginated<Account2>>(
    {
      result: [],
      currentPage: 1,
      total: 0,
      totalPages: 1,
    }
  );
  const [refreshKey, setRefreshKey] = useState(0);
  const loading = useAdminLoading();

  useEffect(() => {
    const getAccountsFromApi = async () => {
      await loading(async () => {
        const pagedResult = await getAccounts({
          // api chi co get by chu ko co search account
          // username: search,
          // email: search,
          page: page + 1,
          pageSize: rowsPerPage,
        });
        // api chưa có sort nên sort tạm local
        if (pagedResult.result && pagedResult.result.length > 0) {
          pagedResult.result.sort((a, b) => {
            const aValue = a[columnSortOrderBy];
            const bValue = b[columnSortOrderBy];
            if (aValue < bValue) return columnSortOrder === "asc" ? -1 : 1;
            if (aValue > bValue) return columnSortOrder === "asc" ? 1 : -1;
            return 0;
          });
        }
        const roles = (await getRoles()).result;
        // Map ApiAccountType to Account2 by adding roleName from roles
        const mappedResult: Account2[] = pagedResult.result.map((account) => {
          const role = roles.find((r) => r.id === account.roleId);
          return {
            ...account,
            roleName: role ? role.name : null,
          };
        });
        setDisplayingResult({
          ...pagedResult,
          result: mappedResult,
        });
        console.log("paged result", { ...pagedResult, result: mappedResult });
      })();
    };
    getAccountsFromApi();
  }, [
    search,
    page,
    rowsPerPage,
    columnSortOrder,
    columnSortOrderBy,
    refreshKey,
    loading,
  ]);

  const handleRequestSort = (property: keyof Account2TableColumnNames) => {
    const isAsc = columnSortOrderBy === property && columnSortOrder === "asc";
    setColumnSortOrder(isAsc ? "desc" : "asc");
    setColumnSortOrderBy(property);
  };

  const handleSelectAllClick = async (isSelected: boolean) => {
    if (isSelected) {
      const newSelecteds = (
        await getAccounts({
          username: search,
          email: search,
          page: 1,
          pageSize: 100,
        })
      ).result.map((s) => s.id);
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

  const handleChangePage = (newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setPage(0);
  };

  const handleEditAccount2 = (selectedId: RowId) => {
    setEditingAccount2Id(selectedId);
    setOpenEditModal(true);
  };

  const editingAccount2 = useMemo(
    () => displayingResult.result.find((u) => u.id === editingAccount2Id),
    [displayingResult.result, editingAccount2Id]
  );

  const handleOpenPreview = (data: unknown) => {
    setSubmittedData(data);
    setOpenPreviewModal(true);
  };

  const handleDeleteAccount2s = async (selectedIds: RowId[]) => {
    try {
      const deleteRequests = selectedIds.map((id) => ({ id: id as string }));
      const results = await deleteAccountMany(deleteRequests);
      handleOpenPreview(results);
      setSelectedItems([]);
      setRefreshKey((k) => k + 1);
    } catch (error) {
      handleOpenPreview(error);
    }
  };

  const handleCreate = async (data: AddAccount2FormProps) => {
    await loading(async () => {
      try {
        const result = await createAccount(data);
        handleOpenPreview(result);
        setRefreshKey((k) => k + 1);
        setOpenAddModal(false);
      } catch (error) {
        handleOpenPreview(error);
      }
    })();
  };

  const handleEdit = async (data: EditAccount2FormProps, entity: Account2) => {
    await loading(async () => {
      try {
        const result = await editAccount({ ...data, id: entity.id });
        handleOpenPreview(result);
        setRefreshKey((k) => k + 1);
        setOpenEditModal(false);
      } catch (error) {
        handleOpenPreview(error);
      }
    })();
  };

  return (
    <>
      <Stack className="h-full">
        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          sx={{ marginBottom: "1rem" }}
        >
          <SearchIcon />
          <TextField
            label="Search"
            variant="outlined"
            fullWidth
            onBlur={(e) => setSearch(e.target.value)}
          />
          <Button variant="contained" onClick={() => setOpenAddModal(true)}>
            <AddIcon />
          </Button>
        </Stack>
        <Account2TableActionEdit
          data={displayingResult.result}
          selectedIds={selectedItems}
          onSelect={handleClick}
          onSelectAll={handleSelectAllClick}
          onEdit={handleEditAccount2}
          onDelete={handleDeleteAccount2s}
          onRequestSort={handleRequestSort}
          onRequestPageChange={handleChangePage}
          onRequestRowsPerPageChange={handleChangeRowsPerPage}
          order={columnSortOrder}
          orderBy={columnSortOrderBy}
          page={page}
          rowsPerPage={rowsPerPage}
          totalCount={displayingResult.total}
        />
        {editingAccount2 && (
          <EditAccount2Modal
            open={openEditModal}
            onClose={() => setOpenEditModal(false)}
            onSubmit={(data) => handleEdit(data, editingAccount2)}
            account2={editingAccount2}
          />
        )}
      </Stack>
      {openAddModal && (
        <AddAccount2Modal
          open={openAddModal}
          onClose={() => setOpenAddModal(false)}
          onSubmit={handleCreate}
        />
      )}
      <PreviewModal
        open={openPreviewModal}
        onClose={() => setOpenPreviewModal(false)}
        data={submittedData}
      />
    </>
  );
};

export default ManageAccount2s;
