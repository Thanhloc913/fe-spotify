import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import { Avatar, Button, Checkbox, Stack, TextField } from "@mui/material";
import { FC, useMemo, useState } from "react";
import { AddPlaylistModal } from "../../components/admin/AddPlaylistModal";
import { EditPlaylistModal } from "../../components/admin/EditPlaylistModal";
import {
  GenericTableActionEdit,
  RowId,
  SortOrder,
} from "../../components/admin/GenericTable";
import { PreviewModal } from "../../components/admin/PreviewModal";
import { mockData } from "../../mock/data";
import { Playlist } from "../../types";

type PlaylistTableColumnNames = Pick<
  Playlist,
  "id" | "name" | "ownerName" | "coverUrl" | "isPublic"
>;

type PlaylistTableColumnDefinition = {
  id: keyof PlaylistTableColumnNames;
  label: string;
  sortable: boolean;
  render?: (value: Playlist) => React.ReactNode;
};

// Define which columns to show and how to render them
const playlistTableColumnDefinitions: PlaylistTableColumnDefinition[] = [
  { id: "id", label: "ID", sortable: true },
  { id: "name", label: "Name", sortable: true },
  { id: "ownerName", label: "OwnerName", sortable: true },
  {
    id: "coverUrl",
    label: "Cover Art",
    sortable: false,
    render: (value: Playlist) =>
      value.coverUrl ? <Avatar src={value.coverUrl} /> : null,
  },
  {
    id: "isPublic",
    label: "Is Public",
    sortable: true,
    render: (value: Playlist) => <Checkbox checked={value.isPublic} disabled />,
  },
] as const;

interface PlaylistTableActionEditProps {
  data: Playlist[]; // Only the current page rows
  selectedIds: RowId[];
  onSelect: (id: RowId, isSelected: boolean) => void;
  onSelectAll: (isSelected: boolean) => void;
  onEdit: (id: RowId) => void;
  onDelete: (selectedIds: RowId[]) => void;
  onRequestSort: (
    column: keyof PlaylistTableColumnNames,
    order: SortOrder
  ) => void;
  onRequestPageChange: (newPage: number) => void;
  onRequestRowsPerPageChange: (rowsPerPage: number) => void;
  order: SortOrder;
  orderBy: keyof PlaylistTableColumnNames;
  page: number;
  rowsPerPage: number;
  totalCount: number;
}

const PlaylistTableActionEdit: FC<PlaylistTableActionEditProps> = ({
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
    <GenericTableActionEdit<Playlist, "id">
      label="Playlists"
      pluralEntityName="Playlists"
      data={data}
      columnDefinitions={playlistTableColumnDefinitions}
      idKey="id"
      selectedIds={selectedIds}
      onSelect={onSelect}
      onSelectAll={onSelectAll}
      onEdit={onEdit}
      onDelete={onDelete}
      onRequestSort={(column, order) => {
        const def = playlistTableColumnDefinitions.find(
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

const ManagePlaylists = () => {
  const [search, setSearch] = useState("");
  const [openEditModal, setOpenEditModal] = useState(false);
  const [editingPlaylistId, setEditingPlaylistId] = useState<RowId | null>(
    null
  );
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedItems, setSelectedItems] = useState<RowId[]>([]);
  const [columnSortOrder, setColumnSortOrder] = useState<"asc" | "desc">("asc");
  const [columnSortOrderBy, setColumnSortOrderBy] =
    useState<keyof PlaylistTableColumnNames>("name");

  const [openPreviewModal, setOpenPreviewModal] = useState(false);
  const [submittedData, setSubmittedData] = useState<object | null>(null);
  const [openAddModal, setOpenAddModal] = useState(false);

  const filteredPlaylists = useMemo(() => {
    return mockData.playlists.filter((playlist) =>
      Object.keys(playlist).some((key) =>
        String(playlist[key as keyof Playlist])
          .toLowerCase()
          .includes(search.toLowerCase())
      )
    );
  }, [search]);

  const handleRequestSort = (property: keyof PlaylistTableColumnNames) => {
    const isAsc = columnSortOrderBy === property && columnSortOrder === "asc";
    setColumnSortOrder(isAsc ? "desc" : "asc");
    setColumnSortOrderBy(property);
  };

  const sortedPlaylists = useMemo(() => {
    const stabilizedThis = filteredPlaylists.map(
      (el, index) => [el, index] as const
    );
    stabilizedThis.sort((a, b) => {
      const orderFn = (
        objA: Playlist,
        objB: Playlist,
        property: keyof Playlist
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
  }, [filteredPlaylists, columnSortOrder, columnSortOrderBy]);

  const displayingPlaylists = useMemo(() => {
    return sortedPlaylists.slice(
      page * rowsPerPage,
      page * rowsPerPage + rowsPerPage
    );
  }, [page, rowsPerPage, sortedPlaylists]);

  const handleSelectAllClick = (isSelected: boolean) => {
    if (isSelected) {
      const newSelecteds = sortedPlaylists
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

  const handleEditPlaylist = (selectedId: RowId) => {
    setEditingPlaylistId(selectedId);
    setOpenEditModal(true);
  };

  const handleDeletePlaylists = (selectedIds: RowId[]) => {
    console.log("Deleting playlists with IDs:", selectedIds);
    setSelectedItems([]); // Clear selection after deletion for now
  };

  const editingPlaylist = useMemo(
    () => mockData.playlists.find((u) => u.id === editingPlaylistId),
    [editingPlaylistId]
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
        <PlaylistTableActionEdit
          data={displayingPlaylists}
          selectedIds={selectedItems}
          onSelect={handleClick}
          onSelectAll={handleSelectAllClick}
          onEdit={handleEditPlaylist}
          onDelete={handleDeletePlaylists}
          onRequestSort={handleRequestSort}
          onRequestPageChange={handleChangePage}
          onRequestRowsPerPageChange={handleChangeRowsPerPage}
          order={columnSortOrder}
          orderBy={columnSortOrderBy}
          page={page}
          rowsPerPage={rowsPerPage}
          totalCount={sortedPlaylists.length}
        />
        {editingPlaylist && (
          <EditPlaylistModal
            open={openEditModal}
            onClose={() => setOpenEditModal(false)}
            onSubmit={(data, playlist) => {
              setSubmittedData({ ...playlist, ...data });
              setOpenPreviewModal(true);
            }}
            playlist={editingPlaylist}
          />
        )}
      </Stack>
      {openAddModal && (
        <AddPlaylistModal
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

export default ManagePlaylists;
