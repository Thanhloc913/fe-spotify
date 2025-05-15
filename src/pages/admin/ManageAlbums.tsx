import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import {
  Avatar,
  Button,
  MenuItem,
  Select,
  Stack,
  TextField,
} from "@mui/material";
import { FC, useMemo, useState } from "react";
import { AddAlbumModal } from "../../components/admin/AddAlbumModal";
import { EditAlbumModal } from "../../components/admin/EditAlbumModal";
import GenericTableActionEdit, {
  RowId,
  SortOrder,
} from "../../components/admin/GenericTable";
import { PreviewModal } from "../../components/admin/PreviewModal";
import { mockData } from "../../mock/data";
import { Album } from "../../types";

type AlbumTableColumnNames = Pick<
  Album,
  "id" | "title" | "artistName" | "coverUrl" | "type"
>;

type AlbumTableColumnDefinition = {
  id: keyof AlbumTableColumnNames;
  label: string;
  sortable: boolean;
  render?: (value: Album) => React.ReactNode;
};

// Define which columns to show and how to render them
const albumTableColumnDefinitions: AlbumTableColumnDefinition[] = [
  { id: "id", label: "ID", sortable: true },
  { id: "title", label: "Title", sortable: true },
  { id: "artistName", label: "Artist name", sortable: true },
  {
    id: "coverUrl",
    label: "Cover art",
    sortable: false,
    render: (value: Album) =>
      value.coverUrl ? <Avatar src={value.coverUrl} /> : null,
  },
  {
    id: "type",
    label: "Type",
    sortable: true,
    render: (value: Album) => (
      <Select value={value.type} disabled>
        <MenuItem value={value.type}>{value.type}</MenuItem>
      </Select>
    ),
  },
] as const;

interface AlbumTableActionEditProps {
  data: Album[]; // Only the current page rows
  selectedIds: RowId[];
  onSelect: (id: RowId, isSelected: boolean) => void;
  onSelectAll: (isSelected: boolean) => void;
  onEdit: (id: RowId) => void;
  onDelete: (selectedIds: RowId[]) => void;
  onRequestSort: (
    column: keyof AlbumTableColumnNames,
    order: SortOrder
  ) => void;
  onRequestPageChange: (newPage: number) => void;
  onRequestRowsPerPageChange: (rowsPerPage: number) => void;
  order: SortOrder;
  orderBy: keyof AlbumTableColumnNames;
  page: number;
  rowsPerPage: number;
  totalCount: number;
}

const AlbumTableActionEdit: FC<AlbumTableActionEditProps> = ({
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
    <GenericTableActionEdit<Album, "id">
      label="Albums"
      pluralEntityName="Albums"
      data={data}
      columnDefinitions={albumTableColumnDefinitions}
      idKey="id"
      selectedIds={selectedIds}
      onSelect={onSelect}
      onSelectAll={onSelectAll}
      onEdit={onEdit}
      onDelete={onDelete}
      onRequestSort={(column, order) => {
        const def = albumTableColumnDefinitions.find(
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

const ManageAlbums = () => {
  const [search, setSearch] = useState("");
  const [openEditModal, setOpenEditModal] = useState(false);
  const [editingAlbumId, setEditingAlbumId] = useState<RowId | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedItems, setSelectedItems] = useState<RowId[]>([]);
  const [columnSortOrder, setColumnSortOrder] = useState<"asc" | "desc">("asc");
  const [columnSortOrderBy, setColumnSortOrderBy] =
    useState<keyof AlbumTableColumnNames>("title");

  const [openPreviewModal, setOpenPreviewModal] = useState(false);
  const [submittedData, setSubmittedData] = useState<object | null>(null);
  const [openAddModal, setOpenAddModal] = useState(false);

  const filteredAlbums = useMemo(() => {
    return mockData.albums.filter((album) =>
      Object.keys(album).some((key) =>
        String(album[key as keyof Album])
          .toLowerCase()
          .includes(search.toLowerCase())
      )
    );
  }, [search]);

  const handleRequestSort = (property: keyof AlbumTableColumnNames) => {
    const isAsc = columnSortOrderBy === property && columnSortOrder === "asc";
    setColumnSortOrder(isAsc ? "desc" : "asc");
    setColumnSortOrderBy(property);
  };

  const sortedAlbums = useMemo(() => {
    const stabilizedThis = filteredAlbums.map(
      (el, index) => [el, index] as const
    );
    stabilizedThis.sort((a, b) => {
      const orderFn = (objA: Album, objB: Album, property: keyof Album) => {
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
  }, [filteredAlbums, columnSortOrder, columnSortOrderBy]);

  const displayingAlbums = useMemo(() => {
    return sortedAlbums.slice(
      page * rowsPerPage,
      page * rowsPerPage + rowsPerPage
    );
  }, [page, rowsPerPage, sortedAlbums]);

  const handleSelectAllClick = (isSelected: boolean) => {
    if (isSelected) {
      const newSelecteds = sortedAlbums
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

  const handleEditAlbum = (selectedId: RowId) => {
    setEditingAlbumId(selectedId);
    setOpenEditModal(true);
  };

  const handleDeleteAlbums = (selectedIds: RowId[]) => {
    console.log("Deleting albums with IDs:", selectedIds);
    setSelectedItems([]); // Clear selection after deletion for now
  };

  const editingAlbum = useMemo(
    () => mockData.albums.find((u) => u.id === editingAlbumId),
    [editingAlbumId]
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
        <AlbumTableActionEdit
          data={displayingAlbums}
          selectedIds={selectedItems}
          onSelect={handleClick}
          onSelectAll={handleSelectAllClick}
          onEdit={handleEditAlbum}
          onDelete={handleDeleteAlbums}
          onRequestSort={handleRequestSort}
          onRequestPageChange={handleChangePage}
          onRequestRowsPerPageChange={handleChangeRowsPerPage}
          order={columnSortOrder}
          orderBy={columnSortOrderBy}
          page={page}
          rowsPerPage={rowsPerPage}
          totalCount={sortedAlbums.length}
        />
        {editingAlbum && (
          <EditAlbumModal
            open={openEditModal}
            onClose={() => setOpenEditModal(false)}
            onSubmit={(data, album) => {
              setSubmittedData({ ...album, ...data });
              setOpenPreviewModal(true);
            }}
            album={editingAlbum}
          />
        )}
      </Stack>
      {openAddModal && (
        <AddAlbumModal
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

export default ManageAlbums;
