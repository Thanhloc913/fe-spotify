import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import { Avatar, Button, Checkbox, Stack, TextField } from "@mui/material";
import { FC, useMemo, useState } from "react";
import { AddArtistModal } from "../../components/admin/AddArtistModal";
import { EditArtistModal } from "../../components/admin/EditArtistModal";
import {
  GenericTableActionEdit,
  RowId,
  SortOrder,
} from "../../components/admin/GenericTable";
import { PreviewModal } from "../../components/admin/PreviewModal";
import { mockData } from "../../mock/data";
import { Artist } from "../../types";

type ArtistTableColumnNames = Pick<
  Artist,
  "id" | "name" | "avatarUrl" | "monthlyListeners" | "isActive"
>;

type ArtistTableColumnDefinition = {
  id: keyof ArtistTableColumnNames;
  label: string;
  sortable: boolean;
  render?: (value: Artist) => React.ReactNode;
};

// Define which columns to show and how to render them
const artistTableColumnDefinitions: ArtistTableColumnDefinition[] = [
  { id: "id", label: "ID", sortable: true },
  { id: "name", label: "Name", sortable: true },
  {
    id: "avatarUrl",
    label: "Avater",
    sortable: false,
    render: (value: Artist) =>
      value.avatarUrl ? <Avatar src={value.avatarUrl} /> : null,
  },
  {
    id: "isActive",
    label: "Active",
    sortable: true,
    render: (value: Artist) => <Checkbox checked={value.isActive} disabled />,
  },
  { id: "monthlyListeners", label: "Monthly Listeners", sortable: true },
] as const;

interface ArtistTableActionEditProps {
  data: Artist[]; // Only the current page rows
  selectedIds: RowId[];
  onSelect: (id: RowId, isSelected: boolean) => void;
  onSelectAll: (isSelected: boolean) => void;
  onEdit: (id: RowId) => void;
  onDelete: (selectedIds: RowId[]) => void;
  onRequestSort: (
    column: keyof ArtistTableColumnNames,
    order: SortOrder
  ) => void;
  onRequestPageChange: (newPage: number) => void;
  onRequestRowsPerPageChange: (rowsPerPage: number) => void;
  order: SortOrder;
  orderBy: keyof ArtistTableColumnNames;
  page: number;
  rowsPerPage: number;
  totalCount: number;
}

const ArtistTableActionEdit: FC<ArtistTableActionEditProps> = ({
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
    <GenericTableActionEdit<Artist, "id">
      label="Artists"
      pluralEntityName="Artists"
      data={data}
      columnDefinitions={artistTableColumnDefinitions}
      idKey="id"
      selectedIds={selectedIds}
      onSelect={onSelect}
      onSelectAll={onSelectAll}
      onEdit={onEdit}
      onDelete={onDelete}
      onRequestSort={(column, order) => {
        const def = artistTableColumnDefinitions.find(
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

const ManageArtists = () => {
  const [search, setSearch] = useState("");
  const [openEditModal, setOpenEditModal] = useState(false);
  const [editingArtistId, setEditingArtistId] = useState<RowId | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedItems, setSelectedItems] = useState<RowId[]>([]);
  const [columnSortOrder, setColumnSortOrder] = useState<"asc" | "desc">("asc");
  const [columnSortOrderBy, setColumnSortOrderBy] =
    useState<keyof ArtistTableColumnNames>("name");

  const [openPreviewModal, setOpenPreviewModal] = useState(false);
  const [submittedData, setSubmittedData] = useState<object | null>(null);
  const [openAddModal, setOpenAddModal] = useState(false);

  const filteredArtists = useMemo(() => {
    return mockData.artists.filter((artist) =>
      Object.keys(artist).some((key) =>
        String(artist[key as keyof Artist])
          .toLowerCase()
          .includes(search.toLowerCase())
      )
    );
  }, [search]);

  const handleRequestSort = (property: keyof ArtistTableColumnNames) => {
    const isAsc = columnSortOrderBy === property && columnSortOrder === "asc";
    setColumnSortOrder(isAsc ? "desc" : "asc");
    setColumnSortOrderBy(property);
  };

  const sortedArtists = useMemo(() => {
    const stabilizedThis = filteredArtists.map(
      (el, index) => [el, index] as const
    );
    stabilizedThis.sort((a, b) => {
      const orderFn = (objA: Artist, objB: Artist, property: keyof Artist) => {
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
  }, [filteredArtists, columnSortOrder, columnSortOrderBy]);

  const displayingArtists = useMemo(() => {
    return sortedArtists.slice(
      page * rowsPerPage,
      page * rowsPerPage + rowsPerPage
    );
  }, [page, rowsPerPage, sortedArtists]);

  const handleSelectAllClick = (isSelected: boolean) => {
    if (isSelected) {
      const newSelecteds = sortedArtists
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

  const handleEditArtist = (selectedId: RowId) => {
    setEditingArtistId(selectedId);
    setOpenEditModal(true);
  };

  const handleDeleteArtists = (selectedIds: RowId[]) => {
    console.log("Deleting artists with IDs:", selectedIds);
    setSelectedItems([]); // Clear selection after deletion for now
  };

  const editingArtist = useMemo(
    () => mockData.artists.find((u) => u.id === editingArtistId),
    [editingArtistId]
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
        <ArtistTableActionEdit
          data={displayingArtists}
          selectedIds={selectedItems}
          onSelect={handleClick}
          onSelectAll={handleSelectAllClick}
          onEdit={handleEditArtist}
          onDelete={handleDeleteArtists}
          onRequestSort={handleRequestSort}
          onRequestPageChange={handleChangePage}
          onRequestRowsPerPageChange={handleChangeRowsPerPage}
          order={columnSortOrder}
          orderBy={columnSortOrderBy}
          page={page}
          rowsPerPage={rowsPerPage}
          totalCount={sortedArtists.length}
        />
        {editingArtist && (
          <EditArtistModal
            open={openEditModal}
            onClose={() => setOpenEditModal(false)}
            onSubmit={(data, artist) => {
              setSubmittedData({ ...artist, ...data });
              setOpenPreviewModal(true);
            }}
            artist={editingArtist}
          />
        )}
      </Stack>
      {openAddModal && (
        <AddArtistModal
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

export default ManageArtists;
