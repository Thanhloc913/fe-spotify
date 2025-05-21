import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import { Button, Stack, TextField } from "@mui/material";
import { FC, useEffect, useMemo, useState } from "react";
import {
  AddRole2FormProps,
  AddRole2Modal,
} from "../../components/admin/AddRole2Modal";
import {
  EditRole2FormProps,
  EditRole2Modal,
} from "../../components/admin/EditRole2Modal";
import {
  GenericTableActionEdit,
  RowId,
  SortOrder,
} from "../../components/admin/GenericTable";
import { PreviewModal } from "../../components/admin/PreviewModal";
import { ApiPaginatedResult, ApiRoleType } from "../../types/api";
import { createRole, deleteRoles, editRole, getRoles } from "../../api/authApi";
import { useAdminLoading } from "../../store/paginationStore";

type Role2 = ApiRoleType;
type Paginated<T> = ApiPaginatedResult<T>;

type Role2TableColumnNames = Pick<
  Role2,
  "id" | "name" | "description" | "createdAt" | "updatedAt"
>;

type Role2TableColumnDefinition = {
  id: keyof Role2TableColumnNames;
  label: string;
  sortable: boolean;
  render?: (value: Role2) => React.ReactNode;
};

// Define which columns to show and how to render them
const role2TableColumnDefinitions: Role2TableColumnDefinition[] = [
  { id: "id", label: "ID", sortable: true },
  { id: "name", label: "Name", sortable: true },
  { id: "description", label: "Description", sortable: false },
  {
    id: "createdAt",
    label: "Created",
    sortable: true,
    render: (value: Role2) => new Date(value.createdAt).toLocaleString(),
  },
  {
    id: "updatedAt",
    label: "Updated",
    sortable: true,
    render: (value: Role2) => new Date(value.updatedAt).toLocaleString(),
  },
] as const;

interface Role2TableActionEditProps {
  data: Role2[]; // Only the current page rows
  selectedIds: RowId[];
  onSelect: (id: RowId, isSelected: boolean) => void;
  onSelectAll: (isSelected: boolean) => void;
  onEdit: (id: RowId) => void;
  onDelete: (selectedIds: RowId[]) => void;
  onRequestSort: (
    column: keyof Role2TableColumnNames,
    order: SortOrder
  ) => void;
  onRequestPageChange: (newPage: number) => void;
  onRequestRowsPerPageChange: (rowsPerPage: number) => void;
  order: SortOrder;
  orderBy: keyof Role2TableColumnNames;
  page: number;
  rowsPerPage: number;
  totalCount: number;
}

const Role2TableActionEdit: FC<Role2TableActionEditProps> = ({
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
    <GenericTableActionEdit<Role2, "id">
      label="Role2s"
      pluralEntityName="Role2s"
      data={data}
      columnDefinitions={role2TableColumnDefinitions}
      idKey="id"
      selectedIds={selectedIds}
      onSelect={onSelect}
      onSelectAll={onSelectAll}
      onEdit={onEdit}
      onDelete={onDelete}
      onRequestSort={(column, order) => {
        const def = role2TableColumnDefinitions.find(
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

const ManageRole2s = () => {
  const [search, setSearch] = useState("");
  const [openEditModal, setOpenEditModal] = useState(false);
  const [editingRole2Id, setEditingRole2Id] = useState<RowId | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedItems, setSelectedItems] = useState<RowId[]>([]);
  const [columnSortOrder, setColumnSortOrder] = useState<"asc" | "desc">(
    "desc"
  );
  const [columnSortOrderBy, setColumnSortOrderBy] =
    useState<keyof Role2TableColumnNames>("updatedAt");

  const [openPreviewModal, setOpenPreviewModal] = useState(false);
  const [submittedData, setSubmittedData] = useState<unknown>(null);
  const [openAddModal, setOpenAddModal] = useState(false);

  const [displayingResult, setDisplayingResult] = useState<Paginated<Role2>>({
    result: [],
    currentPage: 1,
    total: 0,
    totalPages: 1,
  });
  const [refreshKey, setRefreshKey] = useState(0);
  const loading = useAdminLoading();

  useEffect(() => {
    const getRolesFromApi = async () => {
      await loading(async () => {
        const pagedResult = await getRoles({
          name: search,
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
        setDisplayingResult(pagedResult);
        console.log("paged result", pagedResult);
      })();
    };
    getRolesFromApi();
  }, [
    search,
    page,
    rowsPerPage,
    columnSortOrder,
    columnSortOrderBy,
    refreshKey,
    loading,
  ]);

  const handleRequestSort = (property: keyof Role2TableColumnNames) => {
    const isAsc = columnSortOrderBy === property && columnSortOrder === "asc";
    setColumnSortOrder(isAsc ? "desc" : "asc");
    setColumnSortOrderBy(property);
  };

  const handleSelectAllClick = async (isSelected: boolean) => {
    if (isSelected) {
      const newSelecteds = (
        await getRoles({ name: search, page: 1, pageSize: 100 })
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

  const handleEditRole2 = (selectedId: RowId) => {
    setEditingRole2Id(selectedId);
    setOpenEditModal(true);
  };

  const editingRole2 = useMemo(
    () => displayingResult.result.find((u) => u.id === editingRole2Id),
    [displayingResult.result, editingRole2Id]
  );

  const handleOpenPreview = (data: unknown) => {
    setSubmittedData(data);
    setOpenPreviewModal(true);
  };

  const handleDeleteRole2s = async (selectedIds: RowId[]) => {
    try {
      const result = await deleteRoles(selectedIds as string[]);
      handleOpenPreview(result);
      setSelectedItems([]);
      setRefreshKey((k) => k + 1);
    } catch (error) {
      handleOpenPreview(error);
    }
  };

  const handleCreate = async (data: AddRole2FormProps) => {
    await loading(async () => {
      try {
        const result = await createRole(data);
        handleOpenPreview(result);
        setRefreshKey((k) => k + 1);
        setOpenAddModal(false);
      } catch (error) {
        handleOpenPreview(error);
      }
    })();
  };

  const handleEdit = async (data: EditRole2FormProps, entity: Role2) => {
    await loading(async () => {
      try {
        const result = await editRole({ ...data, id: entity.id });
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
        <Role2TableActionEdit
          data={displayingResult.result}
          selectedIds={selectedItems}
          onSelect={handleClick}
          onSelectAll={handleSelectAllClick}
          onEdit={handleEditRole2}
          onDelete={handleDeleteRole2s}
          onRequestSort={handleRequestSort}
          onRequestPageChange={handleChangePage}
          onRequestRowsPerPageChange={handleChangeRowsPerPage}
          order={columnSortOrder}
          orderBy={columnSortOrderBy}
          page={page}
          rowsPerPage={rowsPerPage}
          totalCount={displayingResult.total}
        />
        {editingRole2 && (
          <EditRole2Modal
            open={openEditModal}
            onClose={() => setOpenEditModal(false)}
            onSubmit={handleEdit}
            role2={editingRole2}
          />
        )}
      </Stack>
      {openAddModal && (
        <AddRole2Modal
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

export default ManageRole2s;
