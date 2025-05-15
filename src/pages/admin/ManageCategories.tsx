import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import { Avatar, Button, Stack, TextField } from "@mui/material";
import { FC, useMemo, useState } from "react";
import { AddCategoryModal } from "../../components/admin/AddCategoryModal";
import { EditCategoryModal } from "../../components/admin/EditCategoryModal";
import GenericTableActionEdit, {
  RowId,
  SortOrder,
} from "../../components/admin/GenericTable";
import { PreviewModal } from "../../components/admin/PreviewModal";
import { mockData } from "../../mock/data";
import { Category } from "../../types";

type CategoryTableColumnNames = Pick<
  Category,
  "id" | "name" | "imageUrl" | "description"
>;

type CategoryTableColumnDefinition = {
  id: keyof CategoryTableColumnNames;
  label: string;
  sortable: boolean;
  render?: (value: Category) => React.ReactNode;
};

// Define which columns to show and how to render them
const categoryTableColumnDefinitions: CategoryTableColumnDefinition[] = [
  { id: "id", label: "ID", sortable: true },
  { id: "name", label: "Name", sortable: true },
  {
    id: "imageUrl",
    label: "Avater",
    sortable: false,
    render: (value: Category) =>
      value.imageUrl ? <Avatar src={value.imageUrl} /> : null,
  },
  { id: "description", label: "Description", sortable: false },
] as const;

interface CategoryTableActionEditProps {
  data: Category[]; // Only the current page rows
  selectedIds: RowId[];
  onSelect: (id: RowId, isSelected: boolean) => void;
  onSelectAll: (isSelected: boolean) => void;
  onEdit: (id: RowId) => void;
  onDelete: (selectedIds: RowId[]) => void;
  onRequestSort: (
    column: keyof CategoryTableColumnNames,
    order: SortOrder
  ) => void;
  onRequestPageChange: (newPage: number) => void;
  onRequestRowsPerPageChange: (rowsPerPage: number) => void;
  order: SortOrder;
  orderBy: keyof CategoryTableColumnNames;
  page: number;
  rowsPerPage: number;
  totalCount: number;
}

const CategoryTableActionEdit: FC<CategoryTableActionEditProps> = ({
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
    <GenericTableActionEdit<Category, "id">
      label="Categories"
      pluralEntityName="Categories"
      data={data}
      columnDefinitions={categoryTableColumnDefinitions}
      idKey="id"
      selectedIds={selectedIds}
      onSelect={onSelect}
      onSelectAll={onSelectAll}
      onEdit={onEdit}
      onDelete={onDelete}
      onRequestSort={(column, order) => {
        const def = categoryTableColumnDefinitions.find(
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

const ManageCategories = () => {
  const [search, setSearch] = useState("");
  const [openEditModal, setOpenEditModal] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<RowId | null>(
    null
  );
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedItems, setSelectedItems] = useState<RowId[]>([]);
  const [columnSortOrder, setColumnSortOrder] = useState<"asc" | "desc">("asc");
  const [columnSortOrderBy, setColumnSortOrderBy] =
    useState<keyof CategoryTableColumnNames>("name");

  const [openPreviewModal, setOpenPreviewModal] = useState(false);
  const [submittedData, setSubmittedData] = useState<object | null>(null);
  const [openAddModal, setOpenAddModal] = useState(false);

  const filteredCategories = useMemo(() => {
    return mockData.categories.filter((category) =>
      Object.keys(category).some((key) =>
        String(category[key as keyof Category])
          .toLowerCase()
          .includes(search.toLowerCase())
      )
    );
  }, [search]);

  const handleRequestSort = (property: keyof CategoryTableColumnNames) => {
    const isAsc = columnSortOrderBy === property && columnSortOrder === "asc";
    setColumnSortOrder(isAsc ? "desc" : "asc");
    setColumnSortOrderBy(property);
  };

  const sortedCategories = useMemo(() => {
    const stabilizedThis = filteredCategories.map(
      (el, index) => [el, index] as const
    );
    stabilizedThis.sort((a, b) => {
      const orderFn = (
        objA: Category,
        objB: Category,
        property: keyof Category
      ) => {
        const valA = objA[property];
        const valB = objB[property];

        // Handle null/undefined
        if (valA == null && valB == null) return 0;
        if (valA == null) return -1;
        if (valB == null) return 1;

        // Handle arrays
        if (Array.isArray(valA) && Array.isArray(valB)) {
          const minLen = Math.min(valA.length, valB.length);
          for (let i = 0; i < minLen; i++) {
            if (valA[i] == null && valB[i] == null) continue;
            if (valA[i] == null) return -1;
            if (valB[i] == null) return 1;
            if (valA[i] < valB[i]) return -1;
            if (valA[i] > valB[i]) return 1;
          }
          // If all elements so far are equal, shorter array is smaller
          if (valA.length < valB.length) return -1;
          if (valA.length > valB.length) return 1;
          return 0;
        }

        // If only one is array, treat array as greater
        if (Array.isArray(valA)) return 1;
        if (Array.isArray(valB)) return -1;

        // Normal comparison
        if (valA < valB) return -1;
        if (valA > valB) return 1;
        return 0;
      };
      const value = orderFn(a[0], b[0], columnSortOrderBy);
      if (value !== 0) {
        return columnSortOrder === "asc" ? value : -value;
      }
      return a[1] - b[1];
    });
    return stabilizedThis.map((el) => el[0]);
  }, [filteredCategories, columnSortOrder, columnSortOrderBy]);

  const displayingCategories = useMemo(() => {
    return sortedCategories.slice(
      page * rowsPerPage,
      page * rowsPerPage + rowsPerPage
    );
  }, [page, rowsPerPage, sortedCategories]);

  const handleSelectAllClick = (isSelected: boolean) => {
    if (isSelected) {
      const newSelecteds = sortedCategories
        // uncomment to select all current page only
        // .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
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

  const handleChangePage = (newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setPage(0);
  };

  const handleEditCategory = (selectedId: RowId) => {
    setEditingCategoryId(selectedId);
    setOpenEditModal(true);
  };

  const handleDeleteCategories = (selectedIds: RowId[]) => {
    console.log("Deleting categories with IDs:", selectedIds);
    setSelectedItems([]); // Clear selection after deletion for now
  };

  const editingCategory = useMemo(
    () => mockData.categories.find((u) => u.id === editingCategoryId),
    [editingCategoryId]
  );

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
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button variant="contained" onClick={() => setOpenAddModal(true)}>
            <AddIcon />
          </Button>
        </Stack>
        <CategoryTableActionEdit
          data={displayingCategories}
          selectedIds={selectedItems}
          onSelect={handleClick}
          onSelectAll={handleSelectAllClick}
          onEdit={handleEditCategory}
          onDelete={handleDeleteCategories}
          onRequestSort={handleRequestSort}
          onRequestPageChange={handleChangePage}
          onRequestRowsPerPageChange={handleChangeRowsPerPage}
          order={columnSortOrder}
          orderBy={columnSortOrderBy}
          page={page}
          rowsPerPage={rowsPerPage}
          totalCount={sortedCategories.length}
        />
        {editingCategory && (
          <EditCategoryModal
            open={openEditModal}
            onClose={() => setOpenEditModal(false)}
            onSubmit={(data, category) => {
              setSubmittedData({ ...category, ...data });
              setOpenPreviewModal(true);
            }}
            category={editingCategory}
          />
        )}
      </Stack>
      {openAddModal && (
        <AddCategoryModal
          open={openAddModal}
          onClose={() => setOpenAddModal(false)}
          onSubmit={(data) => {
            setSubmittedData(data);
            setOpenPreviewModal(true);
          }}
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

export default ManageCategories;
