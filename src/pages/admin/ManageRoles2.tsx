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
import GenericTableActionEdit, {
  RowId,
  SortOrder,
} from "../../components/admin/GenericTable";
import { PreviewModal } from "../../components/admin/PreviewModal";
import { ApiPaginatedResult, ApiRoleType } from "../../types/api";
import { createRole, editRole, getRoles } from "../../api/authApi";

type Role2 = ApiRoleType;
type Paginated<T> = ApiPaginatedResult<T>;

type Role2TableColumnNames = Pick<Role2, "id" | "name" | "description">;

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
  const [columnSortOrder, setColumnSortOrder] = useState<"asc" | "desc">("asc");
  const [columnSortOrderBy, setColumnSortOrderBy] =
    useState<keyof Role2TableColumnNames>("name");

  const [openPreviewModal, setOpenPreviewModal] = useState(false);
  const [submittedData, setSubmittedData] = useState<object | null>(null);
  const [openAddModal, setOpenAddModal] = useState(false);

  const [displayingResult, setDisplayingResult] = useState<Paginated<Role2>>({
    result: [],
    currentPage: 1,
    total: 0,
    totalPages: 1,
  });

  useEffect(() => {
    const getRolesFromApi = async () => {
      const pagedResult = await getRoles({
        name: search,
        page: page + 1,
        pageSize: rowsPerPage,
      });
      // api chua co sort nen sort tam local
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
    };
    getRolesFromApi();
  }, [search, page, rowsPerPage, columnSortOrder, columnSortOrderBy]);

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

  const handleDeleteRole2s = (selectedIds: RowId[]) => {
    console.log("Deleting role2s with IDs:", selectedIds);
    setSelectedItems([]); // Clear selection after deletion for now
  };

  const editingRole2 = useMemo(
    () => displayingResult.result.find((u) => u.id === editingRole2Id),
    [editingRole2Id]
  );

  const handleCreate = async (data: AddRole2FormProps) => {
    setSubmittedData(await createRole(data));
    setOpenPreviewModal(true);
  };

  const handleEdit = async (data: EditRole2FormProps, entity: Role2) => {
    setSubmittedData(await editRole({ ...data, id: entity.id }));
    setOpenPreviewModal(true);
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
